import { useEffect, useRef, useState, type Dispatch, type CSSProperties } from 'react';
import gsap from 'gsap';
import { byId, originChapters, researchDomains, type DistrictId } from '../data/districts';
import { crewDatabaseEntities } from '../data/crew';
import type { Action, WorldState } from '../store/world';
import { Icon } from './Icon';

export function MissionPanel({ state, dispatch, close, returnToCity, reduced, persistentStorage }: { state: WorldState; dispatch: Dispatch<Action>; close: () => void; returnToCity: () => void; reduced: boolean; persistentStorage: boolean }) {
  const d = byId[state.district!];
  const dialog = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(0);
  const [subRoleIndex, setSubRoleIndex] = useState(0);
  const [view, setView] = useState('origin');
  const [saved, setSaved] = useState(() => { try { return localStorage.getItem('airs-city-recruitment-interest') === 'true'; } catch { return false; } });
  useEffect(() => {
    const el = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    const ctx = gsap.context(() => gsap.from('.content-sheet', { x: reduced ? 0 : 65, opacity: 0, duration: reduced ? .12 : .65, ease: 'power3.out' }), el);
    el.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = [...el.querySelectorAll<HTMLElement>('button:not([disabled]):not([tabindex="-1"]), a[href], [tabindex="0"]')];
      const first = items[0], last = items[items.length - 1];
      if (!items.length) { e.preventDefault(); return; }
      if (e.shiftKey && (document.activeElement === first || document.activeElement === el)) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && (document.activeElement === last || document.activeElement === el)) { e.preventDefault(); first.focus(); }
    };
    el.addEventListener('keydown', trap);
    return () => { ctx.revert(); el.removeEventListener('keydown', trap); if (previous?.isConnected) previous.focus(); };
  }, [reduced]);
  const selectView = (next: string) => { setView(next); setSelected(0); };
  const complete = () => { dispatch({ type: 'COMPLETE_ORIGIN' }); };

  return <div className="content-backdrop" ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="content-title" style={{ '--accent': d.accent } as CSSProperties}>
    <button className="content-outside" onClick={close} aria-label="Close mission and return to district" tabIndex={-1}/>
    <article className="content-sheet">
      {/* System metadata bar — decorative HUD element, aria-hidden so it doesn't affect focus/screen-reader order */}
      <div className="content-sys-bar" aria-hidden="true">
        <span>Mission {d.number}</span>
        <span className="content-sys-status"><span className="status-dot"/>Active</span>
        <span>{d.sector}</span>
      </div>
      <header className="content-header"><div><span className="eyebrow">{d.sector} / {d.name}</span><span className="content-heading" id="content-title">{d.mission}</span></div><button className="icon-button" onClick={close} aria-label="Close content"><Icon name="close"/></button></header>
      <div className="content-body">
        {d.id === 'hq' && <>
          <nav className="chapter-tabs" aria-label="HQ experiences">{['origin', 'leadership', 'recruitment'].map(v => <button key={v} className={view === v ? 'active' : ''} onClick={() => selectView(v)}>{v === 'origin' ? 'Mission 01' : v}</button>)}</nav>
          {view === 'origin' && (state.chapter < 4 ? <>
            <div className="chapter-progress" aria-label={`Chapter ${state.chapter + 1} of 4`}>{originChapters.map((chapter, i) => <button key={chapter.label} className={i <= state.chapter ? 'reached' : ''} onClick={() => dispatch({ type: 'CHAPTER', chapter: i })} aria-label={`Read ${chapter.label}`} aria-current={i === state.chapter ? 'step' : undefined}><span>0{i + 1}</span><i/></button>)}</div>
            <div className="chapter-content" key={state.chapter}><p className="eyebrow">0{state.chapter + 1} / {originChapters[state.chapter].label}</p><h2>{originChapters[state.chapter].title}</h2><p className="chapter-description">{originChapters[state.chapter].text}</p><p className="chapter-footnote"><span className="short-rule"/>{originChapters[state.chapter].foot}</p></div>
            <button className="primary-action" onClick={() => state.chapter === 3 ? complete() : dispatch({ type: 'CHAPTER', chapter: state.chapter + 1 })}>{state.chapter === 3 ? 'Complete mission' : 'Continue the story'}<Icon name="arrow"/></button>
            <p className="editorial-note">AIRS manifesto. Official copy updates as verified records are approved.</p>
          </> : <div className="mission-complete"><span className="complete-emblem"><Icon name="check" size={36}/></span><p className="eyebrow">Mission 01 / Complete</p><h2>Now you know<br/>where it begins.</h2><p>The origin of AIRS, discovered.<br/>Four more districts. Countless possibilities.</p><div className="discovery-award"><Icon name="hq"/><span>About AIRS discovered</span><span>+01</span></div><button className="primary-action" onClick={returnToCity}>Continue exploring<Icon name="arrow"/></button><button className="quiet-button" onClick={close}>Stay at HQ</button></div>)}
          {view === 'leadership' && <EditorialEmpty code="HQ / PEOPLE" title="A city needs people who move it forward." text="Meet the students shaping AIRS. Verified leadership profiles have not been supplied yet; this space is reserved for the real people behind the organization." foot="Leadership roster / Awaiting publication"/>}
          {view === 'recruitment' && <><EditorialEmpty code="HQ / OPEN DOOR" title="Bring your curiosity. Build from there." text="Researcher, builder, designer, or just getting started: there is more than one way to explore technology. Recruitment dates, eligibility, and an official application link are pending official announcement." foot="Applications / Not announced"/><button className="primary-action" onClick={() => { try { localStorage.setItem('airs-city-recruitment-interest', 'true'); setSaved(true); } catch { setSaved(false); } }}>{saved ? 'Saved on this device' : 'Save my interest locally'}<Icon name={saved ? 'check' : 'plus'}/></button><p className="editorial-note" role="status">{saved ? 'This is a local bookmark, not an application. No personal data was collected or sent.' : 'Local bookmark only. No signup, submission, or notification.'}</p></>}
        </>}
        {d.id === 'research' && <><p className="eyebrow">Research atlas / Exploratory domains</p><h2 className="section-statement">The frontier<br/>is not a fixed point.</h2><div className="research-selector" aria-label="Research domains">{researchDomains.map((domain, i) => <button key={domain.code} className={selected === i ? 'active' : ''} aria-expanded={selected === i} onClick={() => setSelected(i)}><span>{domain.code}</span><span>{domain.name}</span><Icon name={selected === i ? 'minus' : 'plus'} size={17}/></button>)}</div><div className="domain-detail" key={selected}><h3>{researchDomains[selected].name}</h3><p>{researchDomains[selected].detail}</p><span className="eyebrow">{researchDomains[selected].tools}</span></div><p className="editorial-note">Domain guide, not a claim of active labs or published research. Verified experiments can be added here.</p></>}
        {d.id === 'garage' && <><p className="eyebrow">Engineering / Build log</p><h2 className="section-statement">Proof beats<br/>possibility.</h2><p className="chapter-description">A place for work you can inspect. Every build follows the problem, the decisions, and the result.</p><div className="build-slot"><span className="build-wireframe" aria-hidden="true"><Icon name="garage" size={65}/></span><div><span className="eyebrow">Build slot 001</span><h3>The next build<br/>belongs here.</h3><span className="availability">Awaiting a verified project</span></div></div><button className="text-action" onClick={() => setSelected(selected ? 0 : 1)}>Inspect the case-study format<Icon name={selected ? 'minus' : 'plus'} size={17}/></button>{selected === 1 && <dl className="case-format">{[['01 / Problem', 'What needed to change?'], ['02 / Solution', 'What did the team build, and why?'], ['03 / Technology', 'Architecture, tools, and trade-offs.'], ['04 / Crew', 'Verified project contributors.'], ['05 / Result', 'Measured outcomes and honest limitations.'], ['06 / Source', 'Official GitHub repository and live demo.']].map(([title, text]) => <div key={title}><dt>{title}</dt><dd>{text}</dd></div>)}</dl>}<p className="editorial-note">No project, team, outcome, repository, or demo has been fabricated.</p></>}
        {d.id === 'arena' && <><nav className="chapter-tabs" aria-label="Arena archives">{['next event', 'archive', 'hall of fame'].map(v => <button key={v} className={view === v || (view === 'origin' && v === 'next event') ? 'active' : ''} onClick={() => selectView(v)}>{v}</button>)}</nav><EditorialEmpty code={view === 'hall of fame' ? 'ARENA / ACHIEVEMENTS' : view === 'archive' ? 'ARENA / MISSION ARCHIVE' : 'ARENA / STANDBY'} title={view === 'hall of fame' ? 'Good work deserves to be remembered.' : view === 'archive' ? 'Every gathering leaves a mark.' : 'The next big moment is still taking shape.'} text={view === 'hall of fame' ? 'A future home for verified competition results, milestones, and the teams that earned them. No achievements have been published yet.' : view === 'archive' ? 'Workshops, hackathons, and shared discoveries will be documented here once confirmed event records are supplied.' : 'Hackathons. Workshops. Competitions. Conversations that lead somewhere unexpected. Official event details and registration will appear when announced.'} foot={view === 'hall of fame' ? 'Hall of fame / Awaiting verified results' : view === 'archive' ? 'Event archive / No entries published' : 'Next event / To be announced'}/></>}
        {d.id === 'crew' && (() => {
          const currentEntity = crewDatabaseEntities[selected] || crewDatabaseEntities[0];
          const currentRole = currentEntity.roles[subRoleIndex] || currentEntity.roles[0];
          return <>
            <p className="eyebrow">Crew database / Organizational directory</p>
            <h2 className="section-statement">Different strengths.<br/>Shared direction.</h2>
            <p className="chapter-description">Official organizational structure of AIRS. Explore the executive council and the 7 specialized teams, their operational mandates, and functional roles.</p>

            <div className="crew-roles" role="tablist" aria-label="AIRS departments and leadership">
              {crewDatabaseEntities.map((entity, i) => (
                <button
                  key={entity.id}
                  role="tab"
                  aria-selected={selected === i}
                  className={selected === i ? 'active' : ''}
                  onClick={() => { setSelected(i); setSubRoleIndex(0); }}
                >
                  <span>{entity.number}</span>
                  <span className="crew-role-label">{entity.name}</span>
                  <span className="crew-role-code">{entity.code}</span>
                  <Icon name="chevron" size={15}/>
                </button>
              ))}
            </div>

            <div className="crew-entity-bar">
              <div className="crew-entity-header">
                <span className="eyebrow">Sector CQ-05 / {currentEntity.code}</span>
                <span className="crew-entity-category">{currentEntity.category}</span>
              </div>
              <h3 className="crew-entity-title">{currentEntity.name}</h3>
              <p className="crew-entity-focus">{currentEntity.focus}</p>
              <div className="crew-competencies">
                {currentEntity.competencies.map(c => (
                  <span key={c} className="crew-tag">{c}</span>
                ))}
              </div>
            </div>

            <div className="crew-subroles-header">
              <span className="eyebrow">Inspect position / Roster tier</span>
            </div>

            <div className="crew-subroles" role="tablist" aria-label={`${currentEntity.name} positions`}>
              {currentEntity.roles.map((r, rIdx) => (
                <button
                  key={r.id}
                  role="tab"
                  aria-selected={subRoleIndex === rIdx}
                  className={`crew-subrole-btn ${subRoleIndex === rIdx ? 'active' : ''}`}
                  onClick={() => setSubRoleIndex(rIdx)}
                >
                  <span className="status-dot"/>
                  <span>{r.role}</span>
                </button>
              ))}
            </div>

            <div className="dossier">
              <div className="dossier-photo">
                <Icon name="crew" size={42}/>
                <span className="dossier-badge">CQ-05 / {currentEntity.code}</span>
                <span className="dossier-subbadge">RECORD PENDING</span>
              </div>
              <div className="dossier-details">
                <div className="dossier-header-row">
                  <div>
                    <p className="eyebrow">{currentEntity.name} / {currentRole.role}</p>
                    <h3>DATA PENDING</h3>
                  </div>
                  <span className="dossier-status-pill">
                    <span className="status-dot"/>AWAITING VERIFIED ROSTER
                  </span>
                </div>

                <div className="dossier-meta-grid">
                  <div>
                    <span className="dossier-meta-k">Designation</span>
                    <span className="dossier-meta-v">{currentRole.role}</span>
                  </div>
                  <div>
                    <span className="dossier-meta-k">Department</span>
                    <span className="dossier-meta-v">{currentEntity.name}</span>
                  </div>
                  <div>
                    <span className="dossier-meta-k">Hierarchy Level</span>
                    <span className="dossier-meta-v">
                      {currentRole.level === 'board' ? 'Executive Council' : currentRole.level === 'lead' ? 'Department Leadership' : currentRole.level === 'colead' ? 'Department Co-Lead' : 'Core Roster'}
                    </span>
                  </div>
                </div>

                {currentRole.responsibilities && (
                  <div className="dossier-block">
                    <span className="dossier-meta-k">Role Mandate & Responsibilities</span>
                    <p>{currentRole.responsibilities}</p>
                  </div>
                )}

                {currentRole.expertise && currentRole.expertise.length > 0 && (
                  <div className="dossier-block">
                    <span className="dossier-meta-k">Functional Focus Areas</span>
                    <div className="dossier-tags">
                      {currentRole.expertise.map(exp => (
                        <span key={exp}>{exp}</span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="dossier-policy-note">Real students, not placeholders. Verified names, official bios, and approved credentials will populate this dossier upon verified roster submission.</p>
              </div>
            </div>

            <p className="editorial-note">Official AIRS organizational structure. No names, identities, memberships, or affiliations have been invented.</p>
          </>;
        })()}
      </div>
      <footer className="content-footer"><span><span className="status-dot"/>{persistentStorage ? 'Discovery saved on this device' : 'Progress kept for this visit'}</span><button onClick={close}>Back to {d.id === 'hq' ? 'HQ' : 'district'}<Icon name="back" size={15}/></button></footer>
    </article>
  </div>;
}

function EditorialEmpty({ code, title, text, foot }: { code: string; title: string; text: string; foot: string }) {
  return <div className="editorial-empty"><p className="eyebrow">{code}</p><h2>{title}</h2><p className="chapter-description">{text}</p><div className="empty-status"><span className="status-dot"/>{foot}</div></div>;
}
