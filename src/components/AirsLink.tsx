import { useEffect, useRef, useState, type CSSProperties } from 'react';
import gsap from 'gsap';
import { byId, districts, researchDomains, type DistrictId } from '../data/districts';
import { airsProjects, categoryLabels, type ProjectCategory } from '../data/projects';
import type { EventCategory } from '../data/events';
import type { WorldState } from '../store/world';
import { AirsMark, Icon } from './Icon';
import { audio } from '../audio';
import { CrewNetwork } from './CrewNetwork';
// ── Constants ─────────────────────────────────────────────────────────────────
const CLOSE_DURATION_MS = 340;

// ── Audio helpers ─────────────────────────────────────────────────────────────
function soundOpen()      { audio.cue('open'); }
function soundAppSwitch() { audio.cue('switch'); }
function soundClose()     { audio.cue('close'); }

// ── Types ─────────────────────────────────────────────────────────────────────
export type AirsLinkAppId = 'home' | 'city' | 'missions' | 'id' | 'districts' | 'intel' | 'research' | 'projects' | 'events' | 'crew';

export type IntelItem = {
  id: string;
  category: 'MISSION' | 'DISCOVERY' | 'SYSTEM' | 'RESEARCH' | 'EVENT' | 'AIRS';
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  districtId?: DistrictId;
};

interface Props {
  state: WorldState;
  travel: (id: DistrictId | 'city') => void;
  onClose: () => void;
  reduced: boolean;
  audioEnabled: boolean;
  onToggleAudio?: () => void;
  intel: IntelItem[];
  readIntel: Set<string>;
  markIntelRead: (id: string) => void;
}

// ── Mission status derivation ─────────────────────────────────────────────────
type MissionStatus = 'undiscovered' | 'available' | 'active' | 'complete';

function getMissionStatus(id: DistrictId, state: WorldState): MissionStatus {
  if (!state.discovered.includes(id)) return 'undiscovered';
  if (id === 'hq' && state.originComplete) return 'complete';
  if (state.district === id && (state.level === 'CONTENT' || state.level === 'DISTRICT')) return 'active';
  return 'available';
}

// ── Location helpers ──────────────────────────────────────────────────────────
function locationLabel(state: WorldState): string {
  if (!state.district) return 'City Overview';
  return byId[state.district].name;
}
function locationSector(state: WorldState): string {
  if (!state.district) return 'AC-001';
  return byId[state.district].sector;
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomeApp({ state, onNav, unreadCount }: { state: WorldState; onNav: (app: AirsLinkAppId) => void; unreadCount: number }) {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hh = time.getHours().toString().padStart(2, '0');
  const mm = time.getMinutes().toString().padStart(2, '0');
  const ss = time.getSeconds().toString().padStart(2, '0');
  const discovered = state.discovered.length;

  let missionLabel = '—';
  let missionSub   = 'No active mission';
  let missionActive = false;
  if (state.district && (state.level === 'DISTRICT' || state.level === 'CONTENT')) {
    const d = byId[state.district];
    missionLabel  = d.mission;
    missionSub    = d.sector + ' / ' + d.name;
    missionActive = true;
  } else if (!state.originComplete && state.discovered.length === 0) {
    missionLabel  = 'The origin';
    missionSub    = 'HQ-01 / Available';
    missionActive = false;
  }

  let contextualAction = null;
  if (state.district && state.level === 'DISTRICT') {
    const actionMap: Record<string, { label: string, app: AirsLinkAppId, icon: any }> = {
      hq: { label: 'View AIRS ID', app: 'id', icon: 'id' },
      research: { label: 'Access Research Database', app: 'research', icon: 'map' },
      garage: { label: 'Access Project Logs', app: 'projects', icon: 'target' },
      arena: { label: 'Access Event Archive', app: 'events', icon: 'arena' },
      crew: { label: 'Access Personnel Registry', app: 'crew', icon: 'crew' },
    };
    const ctx = actionMap[state.district];
    if (ctx) {
      contextualAction = (
        <div className="al-home-row">
          <span className="al-eyebrow-label">Location Context</span>
          <button className="al-contextual-action" onClick={() => onNav(ctx.app)}>
            <span>{ctx.label}</span>
            <Icon name={ctx.icon} size={14} />
          </button>
        </div>
      );
    }
  }

  return (
    <div className="al-app al-app-home">
      <div className="al-home-hero">
        <div className="al-home-hero-eyebrow">
          <span className={`al-status-dot ${state.district ? 'active' : ''}`} />
          <span>Current location</span>
        </div>
        <div className="al-home-hero-name">{locationLabel(state)}</div>
        <div className="al-home-hero-meta">
          <span className="al-home-hero-sector">{locationSector(state)}</span>
          <span className="al-home-hero-sep" aria-hidden="true">·</span>
          <span className="al-home-hero-level">{state.level === 'CITY' ? 'CITY MAP' : state.level}</span>
        </div>
      </div>

      <div className="al-home-strip">
        <div className="al-home-clock">
          <span className="al-home-clock-hm">{hh}<span className="al-colon">:</span>{mm}</span>
          <span className="al-home-clock-s">{ss}</span>
          <span className="al-home-clock-label">LOCAL</span>
        </div>
        <div className="al-home-net">
          <span className="al-signal-bars"><i/><i/><i/><i/></span>
          <span className="al-home-net-label">SIGNAL<br/>ACTIVE</span>
        </div>
      </div>

      <div className="al-home-row">
        <span className="al-eyebrow-label">Network discovery</span>
        <div className="al-home-discovery">
          <div className="al-disc-track">
            {districts.map(d => (
              <span
                key={d.id}
                className={`al-disc-pip ${state.discovered.includes(d.id) ? 'on' : ''}`}
                style={{ '--pip': d.accent } as CSSProperties}
                title={d.name}
              />
            ))}
          </div>
          <span className="al-disc-count">
            <strong>{discovered}</strong>/5
          </span>
        </div>
      </div>

      <div className="al-home-row">
        <span className="al-eyebrow-label">Active mission</span>
        <div className={`al-home-mission-card ${missionActive ? 'active' : ''}`}>
          <span className={`al-status-dot ${missionActive ? 'active' : 'idle'}`} />
          <div className="al-home-mission-body">
            <span className="al-home-mission-name">{missionLabel}</span>
            <span className="al-home-mission-loc">{missionSub}</span>
          </div>
          {missionActive && (
            <span className="al-home-mission-badge">ACTIVE</span>
          )}
        </div>
      </div>

      {contextualAction}

      <div className="al-home-row al-home-row-last">
        <span className="al-eyebrow-label">Quick access</span>
        <div className="al-home-quicklaunch">
          <button className="al-ql-btn" onClick={() => onNav('intel')}>
            <div className="al-ql-icon">
              <Icon name="hq" size={17} />
              {unreadCount > 0 && <span className="al-unread-pip" />}
            </div>
            <span>Intel</span>
          </button>
          <button className="al-ql-btn" onClick={() => onNav('research')}>
            <div className="al-ql-icon"><Icon name="map" size={17} /></div>
            <span>Research</span>
          </button>
          <button className="al-ql-btn" onClick={() => onNav('projects')}>
            <div className="al-ql-icon"><Icon name="target" size={17} /></div>
            <span>Projects</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CITY / GPS ────────────────────────────────────────────────────────────────
function CityApp({ state, onLocate }: { state: WorldState; onLocate: (id: DistrictId) => void }) {
  return (
    <div className="al-app al-app-city">
      <div className="al-app-compact-header">
        <div>
          <span className="al-eyebrow-label">Navigation</span>
          <h2 className="al-compact-title">District Map</h2>
        </div>
        <div className="al-gps-pos">
          <span className="al-status-dot active" />
          <span>{locationLabel(state)}</span>
        </div>
      </div>

      <ul className="al-city-list" role="list">
        {districts.map(d => {
          const isHere = state.district === d.id;
          const disc   = state.discovered.includes(d.id);
          const goDisabled = isHere && state.level !== 'CITY';
          return (
            <li
              key={d.id}
              className={`al-city-item${isHere ? ' here' : ''}${disc ? ' disc' : ''}`}
            >
              <span
                className="al-city-pip"
                style={{ background: disc ? d.accent : undefined }}
                aria-hidden="true"
              />
              <div className="al-city-body">
                <div className="al-city-top">
                  <span className="al-city-code">{d.sector}</span>
                  {isHere && <span className="al-here-tag">YOU ARE HERE</span>}
                  {disc && !isHere && <span className="al-disc-tag"><Icon name="check" size={8}/>DISC</span>}
                </div>
                <div className="al-city-name">{d.name}</div>
                <div className="al-city-desc">{d.category}</div>
              </div>
              <button
                className={`al-city-go${goDisabled ? ' is-here' : ''}`}
                onClick={() => onLocate(d.id)}
                disabled={goDisabled}
                aria-label={`Navigate to ${d.name}`}
              >
                {goDisabled
                  ? <Icon name="target" size={15}/>
                  : <Icon name="arrow" size={15}/>
                }
                <span>{goDisabled ? 'HERE' : 'GO'}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── MISSIONS ──────────────────────────────────────────────────────────────────
function MissionsApp({ state, onLocate }: { state: WorldState; onLocate: (id: DistrictId) => void }) {
  const completed = districts.filter(d => getMissionStatus(d.id, state) === 'complete').length;
  const pct = (completed / districts.length) * 100;

  return (
    <div className="al-app al-app-missions">
      <div className="al-app-compact-header">
        <div>
          <span className="al-eyebrow-label">Mission log</span>
          <h2 className="al-compact-title">Objectives</h2>
        </div>
        <div className="al-mission-progress-summary">
          <div className="al-mps-bar">
            <div className="al-mps-fill" style={{ width: `${pct}%` }}/>
          </div>
          <span className="al-mps-label">{completed}/{districts.length}</span>
        </div>
      </div>

      <ul className="al-mission-list" role="list">
        {districts.map(d => {
          const status    = getMissionStatus(d.id, state);
          const isActive  = status === 'active';
          const canLocate = status !== 'undiscovered';
          return (
            <li
              key={d.id}
              className={`al-mission-item s-${status}${isActive ? ' active' : ''}`}
              style={{ '--da': d.accent } as CSSProperties}
            >
              <div className="al-mission-edge" aria-hidden="true"/>
              <div className="al-mission-body">
                <div className="al-mission-row1">
                  <span className="al-mission-code">{d.sector}</span>
                  <span className={`al-mission-badge s-${status}`}>
                    {status === 'undiscovered' && 'UNCHARTED'}
                    {status === 'available'    && 'AVAILABLE'}
                    {status === 'active'       && <><span className="al-dot-live"/>ACTIVE</>}
                    {status === 'complete'     && <><Icon name="check" size={8}/>COMPLETE</>}
                  </span>
                </div>
                <div className="al-mission-district">{d.name}</div>
                <div className="al-mission-codename">{d.mission}</div>
                {status !== 'undiscovered' && (
                  <div className="al-mission-obj">{d.objective}</div>
                )}
              </div>
              {canLocate && (
                <button
                  className="al-mission-go"
                  onClick={() => onLocate(d.id)}
                  aria-label={`Navigate to ${d.name}`}
                >
                  <Icon name="target" size={13}/>
                  <span>LOCATE</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── AIRS ID ───────────────────────────────────────────────────────────────────
function AirsIdApp({ state }: { state: WorldState }) {
  const discovered  = state.discovered.length;
  const completed   = districts.filter(d => getMissionStatus(d.id, state) === 'complete').length;

  const chapterLabel = () => {
    if (state.originComplete) return 'Complete';
    if (state.chapter === 0)  return 'Not started';
    return `Ch. ${state.chapter + 1} / 4`;
  };

  return (
    <div className="al-app al-app-id">
      <div className="al-id-header">
        <div className="al-id-mark">
          <AirsMark />
        </div>
        <div className="al-id-heading">
          <span className="al-eyebrow-label">AIRS LINK Identity</span>
          <div className="al-id-role">Explorer / City Network</div>
        </div>
      </div>

      <div className="al-id-stats">
        <div className="al-id-stat">
          <span className="al-id-stat-val">{String(discovered).padStart(2,'0')}</span>
          <span className="al-id-stat-label">Districts</span>
        </div>
        <div className="al-id-stat-div"/>
        <div className="al-id-stat">
          <span className="al-id-stat-val">{String(completed).padStart(2,'0')}</span>
          <span className="al-id-stat-label">Resolved</span>
        </div>
        <div className="al-id-stat-div"/>
        <div className="al-id-stat">
          <span className="al-id-stat-val">{String(5 - discovered).padStart(2,'0')}</span>
          <span className="al-id-stat-label">Uncharted</span>
        </div>
      </div>

      <div className="al-id-disc-track">
        {districts.map(d => (
          <span
            key={d.id}
            className={`al-disc-pip lg ${state.discovered.includes(d.id) ? 'on' : ''}`}
            style={{ '--pip': d.accent } as CSSProperties}
            title={d.name}
          />
        ))}
        <span className="al-id-disc-count">{discovered}/5 districts</span>
      </div>

      <div className="al-id-section">
        <span className="al-eyebrow-label">District dossier</span>
        <ul className="al-id-dossier" role="list">
          {districts.map(d => {
            const status = getMissionStatus(d.id, state);
            const disc   = state.discovered.includes(d.id);
            return (
              <li key={d.id} className={`al-id-dossier-row s-${status}`}>
                <span
                  className="al-id-dossier-pip"
                  style={disc ? { background: d.accent, boxShadow: `0 0 4px ${d.accent}` } : undefined}
                />
                <div className="al-id-dossier-info">
                  <span className="al-id-dossier-name">{d.name}</span>
                  <span className="al-id-dossier-sector">{d.sector}</span>
                </div>
                <span className={`al-id-dossier-status s-${status}`}>
                  {status === 'undiscovered' && 'UNCHARTED'}
                  {status === 'available'    && 'DISCOVERED'}
                  {status === 'active'       && 'ACTIVE'}
                  {status === 'complete'     && <><Icon name="check" size={9}/> COMPLETE</>}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="al-id-section">
        <span className="al-eyebrow-label">Origin mission</span>
        <div className="al-id-origin">
          <span className="al-id-origin-label">HQ-01 / The Origin</span>
          <span className={`al-id-origin-status${state.originComplete ? ' complete' : ''}`}>
            {state.originComplete
              ? <><Icon name="check" size={10}/> Complete</>
              : chapterLabel()
            }
          </span>
        </div>
        {!state.originComplete && state.chapter > 0 && (
          <div className="al-id-chapter-track">
            {[0,1,2,3].map(i => (
              <span key={i} className={`al-id-chapter-pip${i <= state.chapter - 1 ? ' on' : ''}`}/>
            ))}
          </div>
        )}
      </div>

      <div className="al-id-footer">
        <span>AIRS CITY / IDENTITY FILE</span>
        <span>Progress stored locally</span>
      </div>
    </div>
  );
}

// ── DISTRICTS ─────────────────────────────────────────────────────────────────
function DistrictsApp({ state, onLocate }: { state: WorldState; onLocate: (id: DistrictId) => void }) {
  return (
    <div className="al-app al-app-districts">
      <div className="al-app-compact-header">
        <div>
          <span className="al-eyebrow-label">Database</span>
          <h2 className="al-compact-title">Districts</h2>
        </div>
      </div>
      <div className="al-districts-list">
        {districts.map(d => {
          const isHere = state.district === d.id;
          const disc = state.discovered.includes(d.id);
          const goDisabled = isHere && state.level !== 'CITY';
          return (
            <div key={d.id} className={`al-district-card${isHere ? ' here' : ''}${disc ? ' disc' : ''}`} style={{ '--da': d.accent } as CSSProperties}>
              <div className="al-district-card-header">
                <span className="al-district-sector">{d.sector}</span>
                <span className={`al-district-status ${isHere ? 's-active' : disc ? 's-complete' : 's-undiscovered'}`}>
                  {isHere ? 'CURRENT LOCATION' : disc ? 'DISCOVERED' : 'UNCHARTED'}
                </span>
              </div>
              <h3 className="al-district-name">{d.name}</h3>
              <div className="al-district-category">{d.category}</div>
              
              <div className="al-district-desc">
                <span className="al-eyebrow-label">Description</span>
                <p>{disc || isHere ? d.description : 'Data unavailable. Area uncharted.'}</p>
              </div>
              <div className="al-district-obj">
                <span className="al-eyebrow-label">Objective</span>
                <p>{disc || isHere ? d.objective : 'Unknown'}</p>
              </div>
              
              {(disc || isHere) && (
                <button
                  className={`al-btn-primary${goDisabled ? ' disabled' : ''}`}
                  onClick={() => onLocate(d.id)}
                  disabled={goDisabled}
                >
                  <Icon name={goDisabled ? 'target' : 'arrow'} size={15} />
                  {goDisabled ? 'YOU ARE HERE' : 'GO TO DISTRICT'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── INTEL / DISPATCH ─────────────────────────────────────────────────────────
function IntelApp({ intel, readIntel, markIntelRead, onLocate, onNav }: { intel: IntelItem[]; readIntel: Set<string>; markIntelRead: (id: string) => void; onLocate: (id: DistrictId) => void; onNav: (app: AirsLinkAppId) => void; }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      intel.forEach(item => {
        if (!readIntel.has(item.id)) markIntelRead(item.id);
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [intel, readIntel, markIntelRead]);

  return (
    <div className="al-app al-app-intel">
      <div className="al-app-compact-header">
        <div>
          <span className="al-eyebrow-label">AIRS Dispatch</span>
          <h2 className="al-compact-title">Intel Feed</h2>
        </div>
        <div className="al-intel-badge">
          {intel.filter(i => !readIntel.has(i.id)).length} UNREAD
        </div>
      </div>
      <div className="al-intel-feed">
        {intel.map(item => {
          const isUnread = !readIntel.has(item.id);
          return (
            <div key={item.id} className={`al-intel-card ${isUnread ? 'unread' : ''}`}>
              <div className="al-intel-card-header">
                <span className="al-intel-category">[{item.category}]</span>
                {isUnread && <span className="al-intel-new-tag">NEW</span>}
              </div>
              <h4 className="al-intel-title">{item.title}</h4>
              <p className="al-intel-message">{item.message}</p>
              {item.districtId && (
                <div className="al-intel-actions">
                  <button className="al-intel-action-btn" onClick={() => onNav('districts')}>VIEW</button>
                  <button className="al-intel-action-btn" onClick={() => onLocate(item.districtId!)}>LOCATE</button>
                </div>
              )}
            </div>
          );
        })}
        {intel.length === 0 && (
          <div className="al-intel-empty">No incoming transmissions.</div>
        )}
      </div>
    </div>
  );
}

// ── RESEARCH APP ──────────────────────────────────────────────────────────────
// Uses real researchDomains data from districts.ts.
// Labs, publications, opportunities: honest empty states — no data exists yet.

type ResearchView =
  | { kind: 'list' }
  | { kind: 'domain'; code: string };

function ResearchApp({ onLocate }: { onLocate: (id: DistrictId) => void }) {
  const [view, setView] = useState<ResearchView>({ kind: 'list' });
  const [activeSection, setActiveSection] = useState<'domains' | 'labs' | 'publications' | 'opportunities'>('domains');

  if (view.kind === 'domain') {
    const domain = researchDomains.find(d => d.code === view.code);
    if (!domain) return null;
    return (
      <div className="al-app al-app-research">
        <button className="al-back-btn" onClick={() => setView({ kind: 'list' })} aria-label="Back to Research">
          <Icon name="arrow" size={12} />
          <span>RESEARCH</span>
        </button>
        <div className="al-research-detail">
          <div className="al-rd-eyebrow">
            <span className="al-rd-code">R-{domain.code}</span>
            <span className="al-rd-badge">DOMAIN</span>
          </div>
          <h2 className="al-rd-title">{domain.name.toUpperCase()}</h2>
          <div className="al-rd-section">
            <span className="al-eyebrow-label">Overview</span>
            <p className="al-rd-body">{domain.detail}</p>
          </div>
          <div className="al-rd-section">
            <span className="al-eyebrow-label">Focus areas</span>
            <div className="al-rd-tools">
              {domain.tools.split(' / ').map(t => (
                <span key={t} className="al-rd-tool-tag">{t}</span>
              ))}
            </div>
          </div>
          <div className="al-rd-section">
            <span className="al-eyebrow-label">Primary location</span>
            <div className="al-rd-locate-row">
              <div>
                <span className="al-rd-loc-name">Research District</span>
                <span className="al-rd-loc-code">RD-02</span>
              </div>
              <button
                className="al-rd-locate-btn"
                onClick={() => onLocate('research')}
                aria-label="Locate Research District"
              >
                <Icon name="target" size={12} />
                <span>LOCATE</span>
              </button>
            </div>
          </div>
          <div className="al-rd-section">
            <span className="al-eyebrow-label">Related labs</span>
            <div className="al-empty-state">
              <span className="al-empty-code">LAB REGISTRY</span>
              <span className="al-empty-msg">No entries registered</span>
            </div>
          </div>
          <div className="al-rd-section">
            <span className="al-eyebrow-label">Related projects</span>
            <div className="al-empty-state">
              <span className="al-empty-code">PROJECT DATABASE</span>
              <span className="al-empty-msg">Awaiting data</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="al-app al-app-research">
      <div className="al-app-compact-header">
        <div>
          <span className="al-eyebrow-label">AIRS Research Network</span>
          <h2 className="al-compact-title">Research</h2>
        </div>
        <span className="al-status-dot active" title="Network online" />
      </div>

      {/* Section tabs */}
      <div className="al-research-tabs" role="tablist" aria-label="Research sections">
        {(['domains', 'labs', 'publications', 'opportunities'] as const).map(tab => (
          <button
            key={tab}
            className={`al-research-tab${activeSection === tab ? ' on' : ''}`}
            role="tab"
            aria-selected={activeSection === tab}
            onClick={() => setActiveSection(tab)}
          >
            {tab === 'domains'       && 'DOMAINS'}
            {tab === 'labs'          && 'LABS'}
            {tab === 'publications'  && 'PUBS'}
            {tab === 'opportunities' && 'OPPS'}
          </button>
        ))}
      </div>

      {/* DOMAINS — real data */}
      {activeSection === 'domains' && (
        <div className="al-research-list">
          {researchDomains.map(domain => (
            <div key={domain.code} className="al-research-card">
              <div className="al-rc-header">
                <span className="al-rc-code">R-{domain.code}</span>
                <span className="al-rc-badge">DOMAIN</span>
              </div>
              <div className="al-rc-name">{domain.name.toUpperCase()}</div>
              <p className="al-rc-detail">{domain.detail}</p>
              <div className="al-rc-tools">
                {domain.tools.split(' / ').map(t => (
                  <span key={t} className="al-rc-tool">{t}</span>
                ))}
              </div>
              <div className="al-rc-footer">
                <button
                  className="al-rc-view-btn"
                  onClick={() => setView({ kind: 'domain', code: domain.code })}
                  aria-label={`View ${domain.name} domain`}
                >
                  VIEW <Icon name="arrow" size={11} />
                </button>
                <button
                  className="al-rc-locate-btn"
                  onClick={() => onLocate('research')}
                  aria-label="Locate Research District"
                >
                  <Icon name="target" size={11} />
                  LOCATE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LABS — honest empty state */}
      {activeSection === 'labs' && (
        <div className="al-research-list">
          <div className="al-empty-state al-empty-state-lg">
            <span className="al-empty-code">LAB REGISTRY</span>
            <span className="al-empty-msg">No entries registered</span>
            <span className="al-empty-sub">Lab data will appear here when available</span>
          </div>
        </div>
      )}

      {/* PUBLICATIONS — honest empty state */}
      {activeSection === 'publications' && (
        <div className="al-research-list">
          <div className="al-empty-state al-empty-state-lg">
            <span className="al-empty-code">PUBLICATION ARCHIVE</span>
            <span className="al-empty-msg">No entries registered</span>
            <span className="al-empty-sub">Publications will appear here when available</span>
          </div>
        </div>
      )}

      {/* OPPORTUNITIES — honest empty state */}
      {activeSection === 'opportunities' && (
        <div className="al-research-list">
          <div className="al-empty-state al-empty-state-lg">
            <span className="al-empty-code">OPPORTUNITIES</span>
            <span className="al-empty-msg">No entries registered</span>
            <span className="al-empty-sub">Research opportunities will appear here when available</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PROJECTS APP ──────────────────────────────────────────────────────────────
// Project Garage (PG-03) is the canonical home for builds.
// Uses real district descriptions as project stubs.
// No fabricated metrics, team data, or outcomes.

type ProjectView = { kind: 'list' } | { kind: 'dossier'; districtId: DistrictId };
const districtProjects = airsProjects;

function ProjectsApp({ state, onLocate }: { state: WorldState; onLocate: (id: DistrictId) => void }) {
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>('all');
  const [view, setView] = useState<ProjectView>({ kind: 'list' });

  const filtered = activeFilter === 'all'
    ? districtProjects
    : districtProjects.filter(p => p.category === activeFilter);

  if (view.kind === 'dossier') {
    const proj = districtProjects.find(p => p.districtId === view.districtId);
    const district = byId[view.districtId];
    if (!proj) return null;
    const isHere = state.district === view.districtId;
    const goDisabled = isHere && state.level !== 'CITY';
    return (
      <div className="al-app al-app-projects">
        <button className="al-back-btn" onClick={() => setView({ kind: 'list' })} aria-label="Back to Projects">
          <Icon name="arrow" size={12} />
          <span>PROJECTS</span>
        </button>
        <div className="al-project-dossier">
          <div className="al-pd-eyebrow">
            <span className="al-pd-id">PROJECT / {proj.id}</span>
            <span className={`al-pd-status s-${proj.status.toLowerCase()}`}>{proj.status}</span>
          </div>
          <h2 className="al-pd-title">{proj.name.toUpperCase()}</h2>
          <div className="al-pd-subtitle">{district.category.toUpperCase()}</div>
          <div className="al-pd-section">
            <span className="al-eyebrow-label">Category</span>
            <span className="al-pd-category-tag">{categoryLabels[proj.category]}</span>
          </div>
          <div className="al-pd-section">
            <span className="al-eyebrow-label">Description</span>
            <p className="al-pd-body">{district.description}</p>
          </div>
          <div className="al-pd-section">
            <span className="al-eyebrow-label">Objective</span>
            <p className="al-pd-body">{district.objective}</p>
          </div>
          <div className="al-pd-section">
            <span className="al-eyebrow-label">District location</span>
            <div className="al-pd-locate-row">
              <div>
                <span className="al-pd-loc-name">{district.name}</span>
                <span className="al-pd-loc-code">{district.sector}</span>
              </div>
              <button
                className={`al-pd-locate-btn${goDisabled ? ' disabled' : ''}`}
                onClick={() => onLocate(view.districtId)}
                disabled={goDisabled}
                aria-label={`Locate ${district.name}`}
              >
                <Icon name="target" size={12} />
                <span>{goDisabled ? 'HERE' : 'LOCATE'}</span>
              </button>
            </div>
          </div>
          <div className="al-pd-section">
            <span className="al-eyebrow-label">Tech stack</span>
            <div className="al-empty-state">
              <span className="al-empty-code">STACK DATA</span>
              <span className="al-empty-msg">Awaiting data</span>
            </div>
          </div>
          <div className="al-pd-section">
            <span className="al-eyebrow-label">Team</span>
            <div className="al-empty-state">
              <span className="al-empty-code">TEAM ROSTER</span>
              <span className="al-empty-msg">Awaiting data</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="al-app al-app-projects">
      <div className="al-app-compact-header">
        <div>
          <span className="al-eyebrow-label">AIRS Build Log</span>
          <h2 className="al-compact-title">Projects</h2>
        </div>
        <span className="al-projects-count">{filtered.length} / {districtProjects.length}</span>
      </div>

      {/* Category filters */}
      <div className="al-project-filters" role="group" aria-label="Filter projects by category">
        {(['all', 'ai-ml', 'software', 'robotics', 'open-source'] as ProjectCategory[]).map(cat => {
          const count = cat === 'all' ? districtProjects.length : districtProjects.filter(p => p.category === cat).length;
          return (
            <button
              key={cat}
              className={`al-project-filter-btn${activeFilter === cat ? ' on' : ''}${count === 0 && cat !== 'all' ? ' empty' : ''}`}
              onClick={() => setActiveFilter(cat)}
              aria-pressed={activeFilter === cat}
              aria-label={`Filter: ${categoryLabels[cat]}`}
            >
              {categoryLabels[cat]}
            </button>
          );
        })}
      </div>

      {/* Project list */}
      <div className="al-project-list">
        {filtered.length === 0 ? (
          <div className="al-empty-state al-empty-state-lg">
            <span className="al-empty-code">PROJECT DATABASE</span>
            <span className="al-empty-msg">{districtProjects.length === 0 ? 'No verified entries' : 'No projects in this category'}</span>
            <span className="al-empty-sub">{districtProjects.length === 0 ? 'Verified engineering builds will appear here upon submission.' : 'Try selecting another category filter.'}</span>
          </div>
        ) : (
          filtered.map(proj => {
            const district = byId[proj.districtId];
            return (
              <div key={proj.id} className="al-project-card" style={{ '--da': district.accent } as CSSProperties}>
                <div className="al-pc-header">
                  <span className="al-pc-id">{proj.id}</span>
                  <span className={`al-pc-status s-${proj.status.toLowerCase()}`}>{proj.status}</span>
                </div>
                <div className="al-pc-name">{proj.name.toUpperCase()}</div>
                <div className="al-pc-category">{categoryLabels[proj.category]}</div>
                <p className="al-pc-desc">{proj.shortDesc}</p>
                <div className="al-pc-footer">
                  <button
                    className="al-pc-view-btn"
                    onClick={() => setView({ kind: 'dossier', districtId: proj.districtId })}
                    aria-label={`View ${proj.name} dossier`}
                  >
                    VIEW <Icon name="arrow" size={11} />
                  </button>
                  <button
                    className="al-pc-locate-btn"
                    onClick={() => onLocate(proj.districtId)}
                    aria-label={`Locate ${district.name}`}
                  >
                    <Icon name="target" size={11} />
                    LOCATE
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Robotics empty state note */}
      {activeFilter === 'robotics' && filtered.length === 0 && (
        <div className="al-empty-state al-empty-state-lg">
          <span className="al-empty-code">ROBOTICS PROJECTS</span>
          <span className="al-empty-msg">No entries registered</span>
          <span className="al-empty-sub">Robotics projects will appear here when available</span>
        </div>
      )}
    </div>
  );
}

// ── EVENTS APP ────────────────────────────────────────────────────────────────
function EventsApp() {
  const [activeTab, setActiveTab] = useState<EventCategory>('upcoming');

  const tabs: { id: EventCategory; label: string }[] = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'hackathons', label: 'Hackathons' },
    { id: 'workshops', label: 'Workshops' },
    { id: 'talks', label: 'Talks' },
    { id: 'competitions', label: 'Competitions' },
    { id: 'past', label: 'Past' },
  ];

  return (
    <div className="al-app al-app-events">
      {/* Section tabs */}
      <div className="al-events-tabs" role="tablist" aria-label="Event categories">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`al-events-tab${activeTab === tab.id ? ' on' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Honest empty state for all categories (No data in repo) */}
      <div className="al-empty-state al-empty-state-lg">
        <span className="al-empty-code">EVENT ARCHIVE</span>
        <span className="al-empty-msg">No verified entries</span>
        <span className="al-empty-sub">No registered event records are currently available.</span>
      </div>
    </div>
  );
}


// ── Device shell ──────────────────────────────────────────────────────────────
export function AirsLink({ state, travel, onClose, reduced, audioEnabled, onToggleAudio, intel, readIntel, markIntelRead }: Props) {
  const deviceRef     = useRef<HTMLDivElement>(null);
  const backdropRef   = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [activeApp, setActiveApp] = useState<AirsLinkAppId>('home');
  const [time, setTime]           = useState(() => new Date());

  const handleToggleAudio = () => {
    if (onToggleAudio) {
      onToggleAudio();
    } else {
      audio.setMute(!audio.muted);
    }
  };

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;

    if (audioEnabled) soundOpen();

    if (reduced) {
      gsap.set(deviceRef.current,   { opacity: 1, scale: 1, y: 0 });
      gsap.set(backdropRef.current, { opacity: 1 });
    } else {
      gsap.fromTo(backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.38, ease: 'power2.out' },
      );
      gsap.fromTo(deviceRef.current,
        { opacity: 0, scale: 0.88, y: 36 },
        { opacity: 1, scale: 1, y: 0, duration: 0.54, ease: 'power3.out' },
      );
    }

    const el = deviceRef.current!;
    requestAnimationFrame(() => {
      (el.querySelector<HTMLElement>('button:not([disabled])'))?.focus();
    });

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = [...el.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex="0"]',
      )];
      if (!items.length) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    el.addEventListener('keydown', trap);
    return () => {
      el.removeEventListener('keydown', trap);
      if (previousFocus.current?.isConnected) previousFocus.current.focus();
    };
  }, [reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    if (audioEnabled) soundClose();
    if (reduced) { onClose(); return; }
    gsap.to(backdropRef.current, { opacity: 0, duration: CLOSE_DURATION_MS / 1000, ease: 'power2.in' });
    gsap.to(deviceRef.current, {
      opacity: 0, scale: 0.9, y: 28,
      duration: CLOSE_DURATION_MS / 1000,
      ease: 'power3.in',
      onComplete: onClose,
    });
  };

  const navigate = (app: AirsLinkAppId) => {
    if (app === activeApp) return;
    if (audioEnabled) soundAppSwitch();
    setActiveApp(app);
  };

  const locateAndTravel = (id: DistrictId) => {
    if (audioEnabled) soundAppSwitch(); // affirmative lock sound
    if (reduced) { onClose(); travel(id); return; }
    
    // Quick "Coordinate Locked" visual flash before closing
    gsap.to('.al-screen', {
      boxShadow: 'inset 0 0 40px rgba(136, 255, 204, 0.25)',
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        if (audioEnabled) soundClose();
        gsap.to(backdropRef.current, { opacity: 0, duration: CLOSE_DURATION_MS / 1000, ease: 'power2.in' });
        gsap.to(deviceRef.current, {
          opacity: 0, scale: 0.9, y: 28,
          duration: CLOSE_DURATION_MS / 1000,
          ease: 'power3.in',
          onComplete: () => { onClose(); travel(id); },
        });
      }
    });
  };

  const hh = time.getHours().toString().padStart(2, '0');
  const mm = time.getMinutes().toString().padStart(2, '0');

  const dock: { id: AirsLinkAppId; icon: Parameters<typeof Icon>[0]['name']; label: string }[] = [
    { id: 'home',      icon: 'hq',     label: 'Home' },
    { id: 'intel',     icon: 'target', label: 'Intel' },
    { id: 'districts', icon: 'hq',     label: 'Districts' },
    { id: 'city',      icon: 'map',    label: 'GPS' },
    { id: 'missions',  icon: 'check',  label: 'Missions' },
    { id: 'events',    icon: 'arena',  label: 'Events' },
    { id: 'research',  icon: 'map',    label: 'Research' },
    { id: 'projects',  icon: 'arrow',  label: 'Projects' },
    { id: 'crew',      icon: 'crew',   label: 'Crew' },
    { id: 'id',        icon: 'target', label: 'AIRS ID' },
  ];

  return (
    <div
      className="al-backdrop"
      ref={backdropRef}
      role="presentation"
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="al-device"
        ref={deviceRef}
        role="dialog"
        aria-modal="true"
        aria-label="AIRS LINK"
        tabIndex={-1}
      >
        {/* ── Status bar ──────────────────────────────────────── */}
        <div className="al-statusbar">
          <span className="al-sb-brand" aria-hidden="true">AIRS<span>·</span>LINK</span>
          <span className="al-sb-time" aria-hidden="true">{hh}:{mm}</span>
          <div className="al-sb-right">
            <button
              type="button"
              className="al-sb-mute"
              onClick={handleToggleAudio}
              aria-label={audioEnabled ? 'Mute audio' : 'Unmute audio'}
              aria-pressed={audioEnabled}
            >
              <Icon name={audioEnabled ? 'sound' : 'mute'} size={12}/>
              <span className="al-sb-mute-label">{audioEnabled ? 'ON' : 'OFF'}</span>
            </button>
            <span className="al-signal-bars sm" aria-hidden="true"><i/><i/><i/><i/></span>
            <span className="al-battery" role="presentation" aria-hidden="true">
              <span className="al-battery-charge"/>
            </span>
          </div>
        </div>

        {/* ── Hairline separator ──────────────────────────────── */}
        <div className="al-sep" aria-hidden="true"/>

        {/* ── Screen content ──────────────────────────────────── */}
        <div className="al-screen">
          <button className="al-close-btn" onClick={handleClose} aria-label="Close AIRS LINK">
            <Icon name="close" size={14}/>
          </button>

          <div className="al-viewport" key={activeApp}>
            {activeApp === 'home'      && <HomeApp      state={state} onNav={navigate} unreadCount={intel.filter(i => !readIntel.has(i.id)).length} />}
            {activeApp === 'city'      && <CityApp      state={state} onLocate={locateAndTravel}/>}
            {activeApp === 'missions'  && <MissionsApp  state={state} onLocate={locateAndTravel}/>}
            {activeApp === 'id'        && <AirsIdApp    state={state}/>}
            {activeApp === 'districts' && <DistrictsApp state={state} onLocate={locateAndTravel}/>}
            {activeApp === 'intel'     && <IntelApp     intel={intel} readIntel={readIntel} markIntelRead={markIntelRead} onLocate={locateAndTravel} onNav={navigate}/>}
            {activeApp === 'events'    && <EventsApp    />}
            {activeApp === 'research'  && <ResearchApp  onLocate={locateAndTravel}/>}
            {activeApp === 'projects'  && <ProjectsApp  state={state} onLocate={locateAndTravel}/>}
            {activeApp === 'crew'      && <CrewNetwork  onLocate={() => locateAndTravel('crew')} reduced={reduced} />}
          </div>
        </div>

        {/* ── Dock ────────────────────────────────────────────── */}
        <nav className="al-dock" aria-label="AIRS LINK apps">
          {dock.map(item => (
            <button
              key={item.id}
              className={`al-dock-btn${activeApp === item.id ? ' on' : ''}`}
              onClick={() => navigate(item.id)}
              aria-pressed={activeApp === item.id}
              aria-label={item.label}
            >
              <span className="al-dock-icon">
                <Icon name={item.icon} size={20}/>
                {item.id === 'intel' && intel.filter(i => !readIntel.has(i.id)).length > 0 && <span className="al-dock-unread-dot" />}
              </span>
              <span className="al-dock-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* ── Frame decorations ───────────────────────────────── */}
        <span className="al-corner tl" aria-hidden="true"/>
        <span className="al-corner tr" aria-hidden="true"/>
        <span className="al-corner bl" aria-hidden="true"/>
        <span className="al-corner br" aria-hidden="true"/>
      </div>
    </div>
  );
}

// ── Trigger ───────────────────────────────────────────────────────────────────
export { AirsLinkTrigger } from './AirsLinkTrigger';
