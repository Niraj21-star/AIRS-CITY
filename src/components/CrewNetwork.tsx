import React, { useState, useEffect, useRef } from 'react';
import { crewData, Team, Person } from '../data/crew';
import { Icon } from './Icon';

// ── View levels for progressive disclosure ────────────────────────────────────
type ViewLevel = 'overview' | 'team' | 'bod';

// ── Constellation geometry ────────────────────────────────────────────────────
// Coordinate space is centered at (0,0) in real CSS pixels.
// Total height spans from y = -100 (CORE) to y = 92 (Row 1 teams) = ~230px,
// fitting comfortably in any viewport (380px to 800px) with generous breathing room.

export const CORE = { x: 0, y: -100 };
export const BOD_HUB = { x: 0, y: -48 };

// 7 teams:
// Row 0 (4 teams): Tech, Design, Media, PR — short labels, evenly spaced across ±114px
// Row 1 (3 teams): Cultural, Event Mgmt, Marketing — placed in the gaps at x = -76, 0, +76
export const TEAM_POSITIONS: Record<string, { x: number; y: number }> = {
  'team-tech':      { x: -114, y: 22 },
  'team-design':    { x:  -38, y: 22 },
  'team-media':     { x:   38, y: 22 },
  'team-pr':        { x:  114, y: 22 },
  'team-cultural':  { x:  -76, y: 92 },
  'team-event':     { x:    0, y: 92 },
  'team-marketing': { x:   76, y: 92 },
};

// BOD expansion: 2 columns × 2 rows under BOD hub
export const BOD_EXPANDED_POSITIONS: Record<string, { x: number; y: number }> = {
  'board-pres': { x: -75, y: 18 },
  'board-vp':   { x:  75, y: 18 },
  'board-sec':  { x: -75, y: 82 },
  'board-tres': { x:  75, y: 82 },
};

// Clean display metadata
export const TEAM_META: Record<string, { code: string; label: string }> = {
  'team-tech':      { code: 'TECH', label: 'Tech Team' },
  'team-design':    { code: 'DSGN', label: 'Design' },
  'team-media':     { code: 'MDIA', label: 'Media' },
  'team-pr':        { code: 'PR',   label: 'PR Team' },
  'team-cultural':  { code: 'CLTR', label: 'Cultural' },
  'team-event':     { code: 'EVNT', label: 'Event Mgmt' },
  'team-marketing': { code: 'MKTG', label: 'Marketing' },
};

// ── SVG line component ────────────────────────────────────────────────────────
function HierarchyLine({
  x1, y1, x2, y2,
  dimmed = false,
  accent = false,
  pathD,
}: {
  x1?: number; y1?: number; x2?: number; y2?: number;
  dimmed?: boolean; accent?: boolean;
  pathD?: string;
}) {
  let d = pathD;
  if (!d && x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
    const my = (y1 + y2) / 2;
    d = Math.abs(x2 - x1) < 2
      ? `M ${x1} ${y1} L ${x2} ${y2}`
      : `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
  }

  return (
    <path
      d={d}
      fill="none"
      stroke={accent ? 'rgba(0,240,255,0.6)' : 'rgba(255,255,255,0.14)'}
      strokeWidth={accent ? 1.5 : 1}
      strokeDasharray={accent ? undefined : '3 3'}
      opacity={dimmed ? 0.2 : 1}
      aria-hidden="true"
      style={{ transition: 'opacity 0.35s ease, stroke 0.35s ease' }}
    />
  );
}

// ── Node components ───────────────────────────────────────────────────────────
function CoreNode({ onClick }: { onClick: () => void }) {
  return (
    <button
      id="cn-core"
      className="cn-node cn-node--core"
      onClick={onClick}
      aria-label="AIRS CORE — Artificial Intelligence Research Society"
    >
      <span className="cn-node__mark" aria-hidden="true" />
      <span className="cn-node__title">AIRS CORE</span>
      <span className="cn-node__eyebrow">ARTIFICIAL INTELLIGENCE RESEARCH SOCIETY</span>
    </button>
  );
}

function BodHubNode({
  expanded,
  onClick,
}: {
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      id="cn-bod"
      className={`cn-node cn-node--bod ${expanded ? 'is-expanded' : ''}`}
      onClick={onClick}
      aria-expanded={expanded}
      aria-label={`Board of Directors — ${expanded ? 'collapse' : 'expand'} leadership`}
    >
      <span className="cn-node__title">BOARD OF DIRECTORS</span>
      <span className="cn-node__chevron" aria-hidden="true">{expanded ? '▲' : '▼'}</span>
    </button>
  );
}

function BodMemberNode({
  person,
  onClick,
  index,
}: {
  person: Person;
  onClick: () => void;
  index: number;
}) {
  return (
    <button
      id={`cn-bod-${person.id}`}
      className="cn-node cn-node--bod-member"
      onClick={onClick}
      aria-label={person.name ? `${person.role}: ${person.name}` : `${person.role} — data pending`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <span className="cn-node__role">{person.role}</span>
      {person.name
        ? <span className="cn-node__name">{person.name}</span>
        : <span className="cn-node__pending">PENDING</span>}
    </button>
  );
}

function TeamNode({
  team,
  active,
  dimmed,
  onClick,
}: {
  team: Team;
  active: boolean;
  dimmed: boolean;
  onClick: () => void;
}) {
  const meta = TEAM_META[team.id] || {
    code: team.name.slice(0, 4).toUpperCase(),
    label: team.name,
  };

  return (
    <button
      id={`cn-team-${team.id}`}
      className={`cn-node cn-node--team ${active ? 'is-active' : ''} ${dimmed ? 'is-dimmed' : ''}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${team.name} — click to explore`}
    >
      <span className="cn-node__sector" aria-hidden="true">{meta.code}</span>
      <span className="cn-node__title">{meta.label}</span>
    </button>
  );
}


function PersonNode({
  person,
  level,
  onClick,
  index,
}: {
  person: Person;
  level: 'lead' | 'colead' | 'member';
  onClick: () => void;
  index?: number;
}) {
  const levelLabel = level === 'lead' ? 'Team Lead' : level === 'colead' ? 'Co-Lead' : 'Member';
  return (
    <button
      id={`cn-person-${person.id}`}
      className={`cn-node cn-node--person cn-node--${level}`}
      onClick={onClick}
      aria-label={person.name ? `${levelLabel}: ${person.name}` : `${levelLabel} — data pending`}
      style={index !== undefined ? { animationDelay: `${index * 0.06}s` } : undefined}
    >
      <span className="cn-node__level-badge" aria-hidden="true">{levelLabel}</span>
      {person.name
        ? <span className="cn-node__name">{person.name}</span>
        : <span className="cn-node__pending">DATA PENDING</span>}
    </button>
  );
}

// ── Personnel Dossier ─────────────────────────────────────────────────────────
export function PersonnelDossier({ person, onClose }: { person: Person; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="cn-dossier"
      role="dialog"
      aria-modal="true"
      aria-label="Personnel Dossier"
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      <div className="cn-dossier__backdrop" onClick={onClose} />
      <div className="cn-dossier__panel" tabIndex={-1} ref={panelRef}>
        <button className="cn-dossier__close" onClick={onClose} aria-label="Close dossier">
          <Icon name="close" size={16} />
        </button>

        <p className="cn-dossier__eyebrow">PERSONNEL DOSSIER</p>

        <div className="cn-dossier__header">
          {person.name
            ? <h2 className="cn-dossier__name">{person.name}</h2>
            : <h2 className="cn-dossier__name cn-dossier__name--pending">DATA PENDING</h2>}
          <p className="cn-dossier__role">{person.role}</p>
          {person.team && <p className="cn-dossier__team">{person.team}</p>}
        </div>

        {person.responsibilities && (
          <div className="cn-dossier__section">
            <p className="cn-dossier__section-label">ROLE RESPONSIBILITIES</p>
            <p className="cn-dossier__body">{person.responsibilities}</p>
          </div>
        )}

        {person.bio && (
          <div className="cn-dossier__section">
            <p className="cn-dossier__section-label">BIOGRAPHY</p>
            <p className="cn-dossier__body">{person.bio}</p>
          </div>
        )}

        {person.expertise && person.expertise.length > 0 && (
          <div className="cn-dossier__section">
            <p className="cn-dossier__section-label">FUNCTIONAL EXPERTISE</p>
            <ul className="cn-dossier__tags">
              {person.expertise.map(e => <li key={e}>{e}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main CrewNetwork component ────────────────────────────────────────────────
export function CrewNetwork({ onLocate, reduced }: { onLocate: () => void; reduced?: boolean }) {
  const [view, setView] = useState<ViewLevel>('overview');
  const [bodExpanded, setBodExpanded] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const selectTeam = (t: Team) => {
    setSelectedTeam(t);
    setView('team');
    setBodExpanded(false);
  };

  const selectBod = () => {
    if (view === 'team') { setSelectedTeam(null); setView('overview'); return; }
    setBodExpanded(b => {
      const next = !b;
      setView(next ? 'bod' : 'overview');
      return next;
    });
  };

  const goOverview = () => {
    setView('overview');
    setSelectedTeam(null);
    setBodExpanded(false);
  };

  const goBack = () => {
    if (selectedPerson) { setSelectedPerson(null); return; }
    if (view === 'team') { setSelectedTeam(null); setView('overview'); return; }
    if (view === 'bod')  { setBodExpanded(false);  setView('overview'); return; }
  };

  const canGoBack = view !== 'overview' || !!selectedPerson;

  return (
    <div className="al-app al-app-crew">
      {/* ── Header ── */}
      <div className="al-crew-header">
        {canGoBack ? (
          <button className="al-crew-back" onClick={goBack} aria-label="Back">
            <Icon name="back" /> Back
          </button>
        ) : (
          <span className="al-crew-title">CREW NETWORK</span>
        )}
        <button className="al-crew-locate" onClick={onLocate} aria-label="Locate Crew HQ on city map">
          <Icon name="map" /> LOCATE HQ
        </button>
      </div>

      {/* ── Constellation Viewport ── */}
      <div className="cn-viewport" aria-label="Crew organizational constellation">
        <ConstellationView
          view={view}
          bodExpanded={bodExpanded}
          selectedTeam={selectedTeam}
          reduced={reduced}
          onSelectTeam={selectTeam}
          onSelectBod={selectBod}
          onSelectCore={goOverview}
          onSelectPerson={setSelectedPerson}
        />
      </div>

      {/* ── Team detail strip (visible in team view, below constellation) ── */}
      {view === 'team' && selectedTeam && (
        <TeamDetailStrip team={selectedTeam} onSelectPerson={setSelectedPerson} reduced={reduced} />
      )}

      {/* ── Dossier ── */}
      {selectedPerson && (
        <PersonnelDossier person={selectedPerson} onClose={() => setSelectedPerson(null)} />
      )}
    </div>
  );
}

// ── Constellation View (SVG + DOM in shared coordinate space) ─────────────────
function ConstellationView({
  view, bodExpanded, selectedTeam, reduced,
  onSelectTeam, onSelectBod, onSelectCore, onSelectPerson,
}: {
  view: ViewLevel;
  bodExpanded: boolean;
  selectedTeam: Team | null;
  reduced?: boolean;
  onSelectTeam: (t: Team) => void;
  onSelectBod: () => void;
  onSelectCore: () => void;
  onSelectPerson: (p: Person) => void;
}) {
  const isTeamView = view === 'team';
  const isBodView  = view === 'bod';

  const canvasStyle: React.CSSProperties = {
    transition: reduced ? 'none' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  return (
    <div className="cn-canvas" style={canvasStyle}>
      {/* ── SVG lines ── drawn in same CSS pixel space as DOM nodes ── */}
      <svg
        className="cn-lines"
        viewBox="-200 -200 400 400"
        aria-hidden="true"
      >
        {/* Core → BOD hub */}
        <HierarchyLine
          x1={0} y1={isTeamView ? -40 : -82}
          x2={0} y2={isTeamView ? -28 : -62}
          accent={!isTeamView}
          dimmed={isTeamView}
        />

        {/* ── Level 2: BOD Hub → BOD members (when expanded) ── */}
        {isBodView && bodExpanded && (
          <>
            {/* Hub to President & VP */}
            <HierarchyLine pathD="M 0 -34 C 0 -8, -75 -8, -75 18" accent />
            <HierarchyLine pathD="M 0 -34 C 0 -8, 75 -8, 75 18" accent />
            {/* President to Secretary, VP to Treasurer */}
            <HierarchyLine pathD="M -75 18 L -75 82" accent />
            <HierarchyLine pathD="M 75 18 L 75 82" accent />
          </>
        )}

        {/* ── Level 3: BOD Hub → Selected Team ── */}
        {isTeamView && selectedTeam && (
          <HierarchyLine x1={0} y1={-8} x2={0} y2={10} accent />
        )}

        {/* ── Level 1: BOD Hub → 7 Team nodes (Overview mode) ── */}
        {!isTeamView && !bodExpanded && crewData.teams.map((t) => {
          const tp = TEAM_POSITIONS[t.id];
          if (!tp) return null;
          const pathD = Math.abs(tp.x) < 2
            ? `M 0 -34 L 0 ${tp.y}`
            : `M 0 -34 C 0 -10, ${tp.x} -10, ${tp.x} ${tp.y}`;
          return (
            <HierarchyLine
              key={t.id}
              pathD={pathD}
              accent={selectedTeam?.id === t.id}
            />
          );
        })}
      </svg>

      {/* ── AIRS CORE node ── */}
      <div
        className="cn-node-wrapper"
        style={nodeWrapperStyle(CORE.x, isTeamView ? -55 : CORE.y)}
      >
        <CoreNode onClick={onSelectCore} />
      </div>

      {/* ── BOD Hub node ── */}
      <div
        className="cn-node-wrapper"
        style={nodeWrapperStyle(BOD_HUB.x, isTeamView ? -18 : BOD_HUB.y)}
      >
        <BodHubNode expanded={bodExpanded} onClick={onSelectBod} />
      </div>

      {/* ── Level 2: BOD expanded members (clean 2x2 grid, no team clutter) ── */}
      {isBodView && bodExpanded && crewData.board.map((p, i) => {
        const pos = BOD_EXPANDED_POSITIONS[p.id];
        if (!pos) return null;
        return (
          <div
            key={p.id}
            className="cn-node-wrapper cn-node-wrapper--animated"
            style={nodeWrapperStyle(pos.x, pos.y)}
          >
            <BodMemberNode
              person={p}
              index={i}
              onClick={() => onSelectPerson(p)}
            />
          </div>
        );
      })}

      {/* ── Level 3: Active selected team node ── */}
      {isTeamView && selectedTeam && (
        <div
          className="cn-node-wrapper cn-node-wrapper--animated"
          style={nodeWrapperStyle(0, 20)}
        >
          <TeamNode
            team={selectedTeam}
            active={true}
            dimmed={false}
            onClick={() => {}}
          />
        </div>
      )}

      {/* ── Level 1: 7 Team nodes (Overview mode) ── */}
      {!isTeamView && !bodExpanded && crewData.teams.map((t) => {
        const tp = TEAM_POSITIONS[t.id];
        if (!tp) return null;
        return (
          <div
            key={t.id}
            className="cn-node-wrapper"
            style={nodeWrapperStyle(tp.x, tp.y)}
          >
            <TeamNode
              team={t}
              active={false}
              dimmed={false}
              onClick={() => onSelectTeam(t)}
            />
          </div>
        );
      })}
    </div>
  );
}

// ── Team Detail Strip (shown below constellation in team view) ─────────────
function TeamDetailStrip({
  team,
  onSelectPerson,
  reduced,
}: {
  team: Team;
  onSelectPerson: (p: Person) => void;
  reduced?: boolean;
}) {
  return (
    <div
      className={`cn-team-detail ${reduced ? 'no-anim' : ''}`}
      aria-label={`${team.name} hierarchy`}
    >
      <div className="cn-team-detail__header">
        <span className="cn-team-detail__name">{team.name}</span>
      </div>

      <div className="cn-team-detail__hierarchy">
        {/* Lead */}
        {team.lead ? (
          <div className="cn-hierarchy-level">
            <PersonNode person={team.lead} level="lead" onClick={() => onSelectPerson(team.lead!)} />
          </div>
        ) : (
          <div className="cn-hierarchy-level">
            <div className="cn-node cn-node--person cn-node--lead cn-node--ghost">
              <span className="cn-node__level-badge">Team Lead</span>
              <span className="cn-node__pending">DATA PENDING</span>
            </div>
          </div>
        )}

        {/* Connector */}
        {(team.lead || team.coLead) && <div className="cn-hierarchy-connector" aria-hidden="true" />}

        {/* Co-Lead */}
        {team.coLead ? (
          <div className="cn-hierarchy-level">
            <PersonNode person={team.coLead} level="colead" onClick={() => onSelectPerson(team.coLead!)} />
          </div>
        ) : team.lead && (
          <div className="cn-hierarchy-level">
            <div className="cn-node cn-node--person cn-node--colead cn-node--ghost">
              <span className="cn-node__level-badge">Co-Lead</span>
              <span className="cn-node__pending">DATA PENDING</span>
            </div>
          </div>
        )}

        {/* Members */}
        {team.members && team.members.length > 0 && (
          <>
            <div className="cn-hierarchy-connector" aria-hidden="true" />
            <div className="cn-hierarchy-level cn-hierarchy-level--members">
              {team.members.map((m, i) => (
                <PersonNode key={m.id} person={m} level="member" index={i} onClick={() => onSelectPerson(m)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Positioning helper ────────────────────────────────────────────────────────
function nodeWrapperStyle(x: number, y: number): React.CSSProperties {
  return {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
  };
}

// ── CrewGraph (world-mode holographic overlay) ────────────────────────────────
export function CrewGraph({
  selectedTeam,
  setSelectedTeam,
  setSelectedPerson,
  worldMode = false,
}: {
  selectedTeam: Team | null;
  setSelectedTeam?: (t: Team | null) => void;
  setSelectedPerson?: (p: Person | null) => void;
  worldMode?: boolean;
}) {
  return (
    <div className={`cn-world-overlay ${worldMode ? 'world-mode' : ''}`}>
      <div className="cn-world-canvas">
        <svg className="cn-world-lines" aria-hidden="true" viewBox="-200 -200 400 400">
          <HierarchyLine x1={0} y1={-82} x2={0} y2={-62} accent />
          {crewData.teams.map((t) => {
            const tp = TEAM_POSITIONS[t.id];
            if (!tp) return null;
            const isActive = selectedTeam?.id === t.id;
            const pathD = Math.abs(tp.x) < 2
              ? `M 0 -34 L 0 ${tp.y}`
              : `M 0 -34 C 0 -10, ${tp.x} -10, ${tp.x} ${tp.y}`;
            return (
              <HierarchyLine
                key={t.id}
                pathD={pathD}
                accent={isActive}
                dimmed={!!selectedTeam && !isActive}
              />
            );
          })}
        </svg>

        {/* AIRS CORE */}
        <div className="cn-node-wrapper" style={nodeWrapperStyle(CORE.x, CORE.y)}>
          <div className="cn-node cn-node--core" role="img" aria-label="AIRS CORE">
            <span className="cn-node__title">AIRS CORE</span>
          </div>
        </div>

        {/* BOD */}
        <div className="cn-node-wrapper" style={nodeWrapperStyle(BOD_HUB.x, BOD_HUB.y)}>
          <div className="cn-node cn-node--bod" role="img" aria-label="Board of Directors">
            <span className="cn-node__title">BOARD OF DIRECTORS</span>
          </div>
        </div>

        {/* Teams */}
        {crewData.teams.map((t) => {
          const tp = TEAM_POSITIONS[t.id];
          if (!tp) return null;
          const meta = TEAM_META[t.id] || { code: '', label: t.name };
          const isActive = selectedTeam?.id === t.id;
          const isDimmed = !!selectedTeam && !isActive;
          return (
            <div key={t.id} className="cn-node-wrapper" style={nodeWrapperStyle(tp.x, tp.y)}>
              <button
                className={`cn-node cn-node--team ${isActive ? 'is-active' : ''} ${isDimmed ? 'is-dimmed' : ''}`}
                onClick={() => setSelectedTeam?.(isActive ? null : t)}
                aria-label={t.name}
              >
                <span className="cn-node__sector" aria-hidden="true">{meta.code}</span>
                <span className="cn-node__title">{meta.label}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
