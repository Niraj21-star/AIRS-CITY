import { useEffect, useRef } from 'react';
import { districts, type DistrictId } from '../data/districts';
import { Icon } from './Icon';

export function WorldOverlay({ kind, close, travel, discovered, onOpenTeaser }: { kind: 'index' | 'guide'; close: () => void; travel: (id: DistrictId) => void; discovered: DistrictId[]; onOpenTeaser?: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const el = root.current!;
    const items = () => [...el.querySelectorAll<HTMLElement>('button, a[href]')];
    items()[0]?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const buttons = items(), first = buttons[0], last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    el.addEventListener('keydown', trap);
    return () => { el.removeEventListener('keydown', trap); if (previous.isConnected) previous.focus(); };
  }, []);
  return <div className="world-overlay" role="dialog" aria-modal="true" aria-labelledby="overlay-title" ref={root} onClick={e => { if (e.target === e.currentTarget) close(); }}>
    <section className="overlay-panel"><header><span className="eyebrow">AIRS City / Field guide</span><button className="icon-button" onClick={close} aria-label="Close field guide"><Icon name="close"/></button></header>
      <h2 id="overlay-title">{kind === 'index' ? 'Choose your next discovery.' : "This isn't a website. It's a place."}</h2>
      {kind === 'index' ? <><p>Five districts. Follow your curiosity.</p><nav className="district-index" aria-label="All destinations">{districts.map(d => <button key={d.id} onClick={() => { close(); travel(d.id); }}><span className="index-number">{d.number}</span><Icon name={d.id} size={23}/><span><strong>{d.name}</strong><small>{d.sector} / {discovered.includes(d.id) ? 'Discovered' : 'Unexplored'}</small></span><Icon name="arrow"/></button>)}</nav></> : <><p>Move through the city, enter a district, and uncover its story. Your discoveries stay with you on this device.</p><dl className="controls-guide"><div><dt>Move around</dt><dd>Drag the map. Use + / - to change altitude.</dd></div><div><dt>Choose a district</dt><dd>Select a waypoint, or press 1 to 5. On mobile, tap a district below the map.</dd></div><div><dt>Enter a district</dt><dd>Click a waypoint on desktop, or choose Enter district.</dd></div><div><dt>Find your way back</dt><dd>Use the mini-map or press Escape. Escape closes content before returning to the city.</dd></div><div><dt>Explore with a keyboard</dt><dd>Tab through controls. Enter activates a focused control. District index lists every location.</dd></div></dl><div className="reference-note"><span className="eyebrow">City & System Guide</span><p>AIRS City is an interactive digital environment built for exploration. Districts represent the core domains of artificial intelligence, engineering, creative media, and student collaboration. Waypoints indicate official sectors.</p><p>People, projects, events, and application channels reflect official student initiatives. Full personnel directories and team records update upon official verification.</p></div>{onOpenTeaser && <button className="primary-action" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }} onClick={() => { close(); onOpenTeaser(); }}><Icon name="play" size={14}/>Watch Launch Teaser</button>}<p className="editorial-note">Sound starts off. Reduced-motion preferences are respected. No account or tracking is required.</p></>}
    </section>
  </div>;
}
