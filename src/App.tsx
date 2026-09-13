import { useEffect, useReducer, useRef, useState } from 'react';
import { byId, districts, type DistrictId } from './data/districts';
import { initialWorld, parseRoute, readProgress, routeHash, worldReducer } from './store/world';
import { createAmbience } from './audio';
import { CityMap } from './components/CityMap';
import { Boot } from './components/Boot';
import { AirsMark, Icon } from './components/Icon';
import { DistrictScene } from './components/DistrictScene';
import { MissionPanel } from './components/MissionPanel';
import { WorldOverlay } from './components/WorldOverlay';

function startWorld() {
  let progress = readProgress(null), introSeen = false;
  try { progress = readProgress(localStorage); introSeen = sessionStorage.getItem('airs-city-intro') === 'complete'; } catch { /* Storage may be disabled in private browsers. */ }
  const state = initialWorld(parseRoute(location.hash), progress);
  return { ...state, introComplete: state.introComplete || introSeen };
}

// Decorative world-building helpers — compute bearing (0=N) and distance (scaled km) from city centre
function getBearing(pos: { x: number; y: number }) {
  const dx = pos.x - 0.5, dy = pos.y - 0.5;
  return (((Math.round(Math.atan2(dx, -dy) * 180 / Math.PI)) + 360) % 360).toString().padStart(3, '0');
}
function getDistance(pos: { x: number; y: number }) {
  const dx = pos.x - 0.5, dy = pos.y - 0.5;
  return (Math.sqrt(dx * dx + dy * dy) * 10).toFixed(1);
}

export function App() {
  const [state, dispatch] = useReducer(worldReducer, undefined, startWorld);
  const [assetReady, setAssetReady] = useState(false);
  const [overlay, setOverlay] = useState<'index' | 'guide' | null>(null);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [notice, setNotice] = useState('');
  const [persistentStorage, setPersistentStorage] = useState(true);
  const audio = useRef<ReturnType<typeof createAmbience> | null>(null);
  const routeInitialized = useRef(false);
  const district = state.district ? byId[state.district] : null;
  const modal = !!overlay || state.level === 'CONTENT';

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('airs-city-progress-v1', JSON.stringify({ discovered: state.discovered, originComplete: state.originComplete, chapter: state.chapter }));
    } catch { setPersistentStorage(false); setNotice('Device storage is unavailable. Your progress will last for this visit only.'); }
  }, [state.discovered, state.originComplete, state.chapter]);

  useEffect(() => {
    if (state.introComplete) { try { sessionStorage.setItem('airs-city-intro', 'complete'); } catch { /* Intro remains skippable without storage. */ } }
  }, [state.introComplete]);

  useEffect(() => {
    const hash = routeHash(state);
    try {
      if (!routeInitialized.current) { history.replaceState(null, '', hash); routeInitialized.current = true; }
      else if (location.hash !== hash) history.pushState(null, '', hash);
    } catch { /* Embedded previews can disallow History API writes. */ }
    document.title = state.level === 'CITY' ? 'AIRS City | A World for the Curious' : `${district?.name}${state.level === 'CONTENT' ? ' / ' + district?.mission : ''} | AIRS City`;
  }, [state.level, state.district]);

  useEffect(() => {
    const update = () => { setOverlay(null); dispatch({ type: 'ROUTE', route: parseRoute(location.hash) }); };
    window.addEventListener('hashchange', update);
    window.addEventListener('popstate', update);
    return () => { window.removeEventListener('hashchange', update); window.removeEventListener('popstate', update); };
  }, []);

  useEffect(() => {
    if (!state.isTransitioning) return;
    if (state.audioEnabled) audio.current?.cue();
    const timer = setTimeout(() => dispatch({ type: 'ARRIVE' }), reduced ? 200 : state.transitionTo === 'city' ? 1850 : 2250);
    return () => clearTimeout(timer);
  }, [state.isTransitioning, state.transitionTo, reduced]);

  useEffect(() => {
    if (!state.introComplete || state.isTransitioning || state.level === 'CONTENT') return;
    const timer = setTimeout(() => {
      if (state.level === 'DISTRICT') document.querySelector<HTMLElement>('#district-title')?.focus({ preventScroll: true });
      else if (state.discovered.length) document.querySelector<HTMLElement>('.destination-preview .text-action')?.focus({ preventScroll: true });
    }, 60);
    return () => clearTimeout(timer);
  }, [state.level, state.district, state.introComplete, state.isTransitioning]);

  useEffect(() => () => { audio.current?.close(); audio.current = null; }, []);
  useEffect(() => {
    const onVisibility = () => { if (audio.current) void audio.current.enable(state.audioEnabled && !document.hidden).catch(() => dispatch({ type: 'AUDIO', enabled: false })); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [state.audioEnabled]);

  const travel = (id: DistrictId | 'city') => {
    if (state.isTransitioning) return;
    setOverlay(null);
    if (id !== 'city' && state.district === id) { dispatch({ type: 'CLOSE_CONTENT' }); return; }
    dispatch({ type: 'TRAVEL', id });
  };
  const toggleAudio = async () => {
    try {
      audio.current ||= createAmbience();
      const enabled = !state.audioEnabled;
      await audio.current.enable(enabled);
      dispatch({ type: 'AUDIO', enabled });
    } catch { setNotice('Ambient audio is unavailable in this browser. The city remains fully explorable.'); }
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || (event.target as HTMLElement).matches('input, textarea, select, [contenteditable]')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!state.introComplete) dispatch({ type: 'INTRO_COMPLETE' });
        else if (overlay) setOverlay(null);
        else if (state.isTransitioning) return;
        else if (state.level === 'CONTENT') dispatch({ type: 'CLOSE_CONTENT' });
        else if (state.level === 'DISTRICT') travel('city');
      }
      if (!state.introComplete || state.isTransitioning || modal || state.level !== 'CITY') return;
      if (/^[1-5]$/.test(event.key)) { event.preventDefault(); dispatch({ type: 'SELECT', id: districts[Number(event.key) - 1].id }); }
      if (event.key === 'Enter' && !(event.target as HTMLElement).closest('button,a')) travel(state.selected);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, modal, overlay]);

  return <div className={`airs-world ${state.introComplete ? 'world-ready' : 'world-booting'} ${reduced ? 'reduced-motion' : ''} ${state.isTransitioning ? 'in-transit' : ''}`}>
    <div className="world-shell" inert={modal || !state.introComplete || state.isTransitioning}>
      <a className="skip-link" href="#district-index" onClick={e => { e.preventDefault(); setOverlay('index'); }}>Open accessible district navigation</a>
      <header className="world-header">
        <button className="wordmark" onClick={() => { if (state.level !== 'CITY') travel('city'); }} aria-label="AIRS City, return to city" disabled={state.isTransitioning}><AirsMark/><span>AIRS<span>CITY</span></span></button>
        <div className="header-divider"/><span className="brand-caption">A world for<br/>the curious.</span>
        <div className="header-right"><span className="city-status"><span className="status-dot"/>{district ? district.sector + ' / ONLINE' : 'CITY ONLINE'}</span><span className="header-coordinate">AC / 001</span><button className={`audio-toggle ${state.audioEnabled ? 'enabled' : ''}`} onClick={toggleAudio} aria-label={state.audioEnabled ? 'Mute ambient audio' : 'Enable quiet ambient audio'} aria-pressed={state.audioEnabled}><span className="audio-bars"><i/><i/><i/><i/></span><span>Sound {state.audioEnabled ? 'on' : 'off'}</span></button><button className="icon-button guide-button" onClick={() => setOverlay('guide')} aria-label="Open controls and prototype information"><Icon name="help" size={19}/></button></div>
      </header>
      <main id="main-world" aria-busy={state.isTransitioning}>
        <CityMap state={state} dispatch={dispatch} reduced={reduced} travel={travel} onReady={() => setAssetReady(true)}/>
        {district && <div key={district.id} className={`district-layer ${state.isTransitioning ? 'departing' : ''}`} inert={state.isTransitioning}><DistrictScene id={district.id} begin={() => dispatch({ type: 'OPEN_CONTENT' })} returnToCity={() => travel('city')} reduced={reduced} originComplete={state.originComplete} discovered={state.discovered}/></div>}
      </main>
      <footer className="world-footer"><div className="discovery-counter"><span className="discovery-bars">{districts.map(d => <i key={d.id} className={state.discovered.includes(d.id) ? 'filled' : ''}/>)}</span><span><strong>{String(state.discovered.length).padStart(2, '0')}</strong> / 05 <span className="discovered-word">DISTRICTS DISCOVERED</span></span></div><span className="map-instructions">{state.level === 'CITY' ? 'DRAG TO EXPLORE' : 'FOLLOW YOUR CURIOSITY'}<span>+</span>{state.level === 'CITY' ? 'SELECT A WAYPOINT' : 'ESC TO RETURN'}</span><button className="index-button" id="district-index" onClick={() => setOverlay('index')} disabled={state.isTransitioning}><Icon name="map" size={16}/>District index<span className="key-hint">05</span></button></footer>
      <button className="reference-badge" onClick={() => setOverlay('guide')}>Concept build <span>/ Reference scenery</span><span className="reference-dot"/></button>
    </div>
    {state.isTransitioning && <div className="travel-overlay" aria-live="polite">
      <div className="cinema-bar top"/>
      {/* Atmospheric layers — purely decorative, pointer-events:none via CSS */}
      <div className="travel-grid" aria-hidden="true"/>
      <div className="travel-scan-line" aria-hidden="true"/>
      {/* Route data panel — shows for district-bound trips, not city return */}
      {state.transitionTo && state.transitionTo !== 'city' && (
        <div className="travel-data" aria-hidden="true">
          <span><strong>{byId[state.transitionTo].sector} / Route Active</strong></span>
          <span>Bearing {getBearing(byId[state.transitionTo].position)}°</span>
          <span>Distance {getDistance(byId[state.transitionTo].position)} km</span>
        </div>
      )}
      <div className="travel-label"><span className="eyebrow">{state.transitionTo === 'city' ? 'Returning to city' : 'Destination confirmed'}</span><strong>{state.transitionTo === 'city' ? 'AIRS CITY' : byId[state.transitionTo!].name}</strong><span className="travel-progress"><i/></span></div>
      <div className="cinema-bar bottom"/>
    </div>}
    {state.level === 'CONTENT' && !state.isTransitioning && <MissionPanel key={state.district} state={state} dispatch={dispatch} close={() => dispatch({ type: 'CLOSE_CONTENT' })} returnToCity={() => travel('city')} reduced={reduced} persistentStorage={persistentStorage}/>} 
    {overlay && <WorldOverlay kind={overlay} close={() => setOverlay(null)} travel={travel} discovered={state.discovered}/>}
    {!state.introComplete && <Boot ready={assetReady} reduced={reduced} dispatch={dispatch}/>}
    <div className="sr-only" role="status" aria-live="polite">{state.isTransitioning ? 'Traveling' : state.level === 'CITY' ? `City map. ${state.discovered.length} of 5 districts discovered.` : `${district?.name}. ${district?.objective}`}</div>
    {notice && <div className="system-notice" role="status"><span>{notice}</span><button aria-label="Dismiss notice" onClick={() => setNotice('')}><Icon name="close" size={15}/></button></div>}
  </div>;
}
