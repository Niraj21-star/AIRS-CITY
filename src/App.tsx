import { lazy, Suspense, useEffect, useReducer, useRef, useState } from 'react';
import { byId, districts, type DistrictId } from './data/districts';
import { initialWorld, parseRoute, readProgress, routeHash, worldReducer } from './store/world';
import { audio } from './audio';
import cityBgmUrl from './assets/audio/Midnight_Over_the_Metropolis.mp3';
import { CityMap } from './components/CityMap';
import { Boot } from './components/Boot';
import { AirsMark, Icon } from './components/Icon';
import { DistrictScene } from './components/DistrictScene';
import { AirsLinkTrigger } from './components/AirsLinkTrigger';
import type { AirsLinkAppId, IntelItem } from './components/AirsLink';

const Teaser = lazy(() => import('./components/Teaser').then(m => ({ default: m.Teaser })));
const AirsLink = lazy(() => import('./components/AirsLink').then(m => ({ default: m.AirsLink })));
const WorldOverlay = lazy(() => import('./components/WorldOverlay').then(m => ({ default: m.WorldOverlay })));
const MissionPanel = lazy(() => import('./components/MissionPanel').then(m => ({ default: m.MissionPanel })));
const DevContentPreview = import.meta.env.DEV
  ? lazy(() => import('./components/DevContentPreview').then(m => ({ default: m.DevContentPreview })))
  : null;

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
  // Fresh page load always opens on #/teaser unless opening developer preview
  const [isTeaser, setIsTeaser] = useState(() => {
    if (import.meta.env.DEV && (location.hash === '#/dev/content' || location.pathname.endsWith('/dev/content'))) {
      return false;
    }
    return true;
  });
  const [isDevPreview, setIsDevPreview] = useState(() => {
    return Boolean(import.meta.env.DEV && (location.hash === '#/dev/content' || location.pathname.endsWith('/dev/content')));
  });
  const routeInitialized = useRef(false);
  const district = state.district ? byId[state.district] : null;
  const modal = !isTeaser && (!!overlay || state.level === 'CONTENT');

  // Sync hash to #/teaser on initial load if teaser is active
  useEffect(() => {
    if (isTeaser && location.hash !== '#/teaser' && !isDevPreview) {
      try {
        history.replaceState(null, '', '#/teaser');
      } catch {
        location.hash = '#/teaser';
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openTeaser = () => {
    location.hash = '#/teaser';
    setIsTeaser(true);
  };

  const handleEnterCityFromTeaser = () => {
    setIsTeaser(false);
    location.hash = '#/city';
    dispatch({ type: 'ROUTE', route: { level: 'CITY', district: null } });
    dispatch({ type: 'INTRO_COMPLETE' });
    try {
      sessionStorage.setItem('airs-city-intro', 'complete');
    } catch {
      // Storage unavailable
    }
    if (!state.audioEnabled && !audio.muted) {
      dispatch({ type: 'AUDIO', enabled: true });
    }
  };
  // ── AIRS LINK device state (UI only — not in world.ts) ────────────────────
  const [airsLinkOpen, setAirsLinkOpen] = useState(false);
  const [, setAirsLinkApp] = useState<AirsLinkAppId>('home');
  const [readIntel, setReadIntel] = useState<Set<string>>(new Set());

  const openAirsLink = () => { setAirsLinkApp('home'); setAirsLinkOpen(true); };
  const closeAirsLink = () => setAirsLinkOpen(false);
  const markIntelRead = (id: string) => {
    setReadIntel(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // Derive Intel Items purely from state
  const derivedIntel: IntelItem[] = [];

  // System status
  derivedIntel.push({
    id: 'sys-active',
    category: 'SYSTEM',
    title: 'AIRS IRIS CONNECTION ACTIVE',
    message: 'Local network synchronization complete.',
    type: 'info'
  });

  // Mission progression
  if (state.originComplete) {
    derivedIntel.push({
      id: 'mission-origin-complete',
      category: 'MISSION',
      title: 'ORIGIN PROTOCOL COMPLETE',
      message: 'HQ mission status: Resolved.',
      districtId: 'hq',
      type: 'success'
    });
  } else if (state.chapter > 0) {
    derivedIntel.push({
      id: `chapter-${state.chapter}`,
      category: 'MISSION',
      title: 'ORIGIN PROTOCOL UPDATED',
      message: `HQ mission status changed. Chapter ${state.chapter + 1} available.`,
      districtId: 'hq',
      type: 'info'
    });
  }

  // Discoveries
  state.discovered.forEach(id => {
    const d = byId[id];
    derivedIntel.push({
      id: `discovery-${id}`,
      category: 'DISCOVERY',
      title: `${d.name.toUpperCase()} DISCOVERED`,
      message: `${d.sector} network access available.`,
      districtId: id,
      type: 'success'
    });
  });

  // Active missions
  if (state.district && (state.level === 'DISTRICT' || state.level === 'CONTENT')) {
    derivedIntel.push({
      id: `active-mission-${state.district}`,
      category: 'MISSION',
      title: 'MISSION ACTIVE',
      message: `${byId[state.district].mission} in progress.`,
      districtId: state.district,
      type: 'info'
    });
  }

  // Current Location
  if (state.district) {
    const d = byId[state.district];
    derivedIntel.push({
      id: `current-location-${state.district}`,
      category: 'SYSTEM',
      title: 'CURRENT LOCATION',
      message: `${d.name.toUpperCase()} / ${d.sector}`,
      districtId: state.district,
      type: 'info'
    });
  }

  // Ensure consistent display order (latest relevant entries visually at top)
  derivedIntel.reverse();

  // Unread badge: unread Intel count
  const airsLinkUnread = derivedIntel.filter(item => !readIntel.has(item.id)).length;

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
    if (isDevPreview) {
      document.title = 'AIRS City | Content Pipeline Preview (DEV ONLY)';
      return;
    }
    if (isTeaser) {
      document.title = 'AIRS City | Launch Teaser';
      return;
    }
    const hash = routeHash(state);
    try {
      if (!routeInitialized.current) { history.replaceState(null, '', hash); routeInitialized.current = true; }
      else if (location.hash !== hash) history.pushState(null, '', hash);
    } catch { /* Embedded previews can disallow History API writes. */ }
    document.title = state.level === 'CITY' ? 'AIRS City | An Interactive Digital World for AIRS' : `${district?.name}${state.level === 'CONTENT' ? ' / ' + district?.mission : ''} | AIRS City`;
  }, [state.level, state.district, isTeaser, isDevPreview]);

  useEffect(() => {
    const update = () => {
      const devRoute = Boolean(import.meta.env.DEV && (location.hash === '#/dev/content' || location.pathname.endsWith('/dev/content')));
      setIsDevPreview(devRoute);
      const teaserRoute = location.hash === '#/teaser' || location.pathname.endsWith('/teaser');
      setIsTeaser(teaserRoute);
      setOverlay(null);
      if (!teaserRoute && !devRoute) {
        dispatch({ type: 'ROUTE', route: parseRoute(location.hash) });
      }
    };
    window.addEventListener('hashchange', update);
    window.addEventListener('popstate', update);
    return () => { window.removeEventListener('hashchange', update); window.removeEventListener('popstate', update); };
  }, []);

  useEffect(() => {
    if (!state.isTransitioning) return;
    if (state.audioEnabled) {
      audio.setBgmVolume(0.45, 0.4);
      audio.cue('travel');
    }
    const timer = setTimeout(() => {
      dispatch({ type: 'ARRIVE' });
      if (state.audioEnabled) {
        audio.setBgmVolume(0.85, 0.8);
        audio.cue('switch');
      }
    }, reduced ? 200 : state.transitionTo === 'city' ? 1850 : 2250);
    return () => clearTimeout(timer);
  }, [state.isTransitioning, state.transitionTo, reduced, state.audioEnabled]);

  useEffect(() => {
    if (state.audioEnabled) {
      void audio.resume().then(() => {
        audio.playBGM(cityBgmUrl);
      }).catch(() => dispatch({ type: 'AUDIO', enabled: false }));
    } else {
      audio.playBGM(null);
    }
  }, [state.audioEnabled]);

  useEffect(() => {
    if (!state.introComplete || state.isTransitioning || state.level === 'CONTENT') return;
    const timer = setTimeout(() => {
      if (state.level === 'DISTRICT') document.querySelector<HTMLElement>('#district-title')?.focus({ preventScroll: true });
      else if (state.discovered.length) document.querySelector<HTMLElement>('.waypoint.selected')?.focus({ preventScroll: true });
    }, 60);
    return () => clearTimeout(timer);
  }, [state.level, state.district, state.introComplete, state.isTransitioning]);

  useEffect(() => {
    const onVisibility = () => { 
      if (document.hidden) {
        audio.setBgmVolume(0, 0.5);
      } else if (state.audioEnabled) {
        void audio.resume().then(() => {
          audio.setBgmVolume(0.85, 0.5);
        }).catch(() => dispatch({ type: 'AUDIO', enabled: false })); 
      }
    };
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
      const enabled = !state.audioEnabled;
      audio.setMute(!enabled);
      dispatch({ type: 'AUDIO', enabled });
    } catch { setNotice('Ambient audio is unavailable in this browser. The city remains fully explorable.'); }
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || (event.target as HTMLElement).matches('input, textarea, select, [contenteditable]')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        // AIRS LINK takes priority — close it before world Escape handling
        if (airsLinkOpen) { closeAirsLink(); return; }
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
  }, [state, modal, overlay, airsLinkOpen]);

  if (isDevPreview && DevContentPreview) {
    return (
      <Suspense fallback={<div className="boot-terminal"><span className="cursor">LOADING CONTENT PREVIEW...</span></div>}>
        <DevContentPreview onExit={() => { location.hash = '#/city'; setIsDevPreview(false); setIsTeaser(false); }} />
      </Suspense>
    );
  }

  if (isTeaser) {
    return (
      <Suspense fallback={<div className="teaser-experience" />}>
        <Teaser
          onEnterCity={handleEnterCityFromTeaser}
          reduced={reduced}
          audioEnabled={state.audioEnabled}
          onToggleAudio={toggleAudio}
        />
      </Suspense>
    );
  }

  return <div className={`airs-world ${state.introComplete ? 'world-ready' : 'world-booting'} ${reduced ? 'reduced-motion' : ''} ${state.isTransitioning ? 'in-transit' : ''}`}>
    <div className="world-shell" inert={modal || !state.introComplete || state.isTransitioning}>
      <a className="skip-link" href="#district-index" onClick={e => { e.preventDefault(); setOverlay('index'); }}>Open accessible district navigation</a>
      <header className="world-header">
        <button className="wordmark" onClick={() => { if (state.level !== 'CITY') travel('city'); }} aria-label="AIRS City, return to city" disabled={state.isTransitioning}><AirsMark/><span>AIRS<span>CITY</span></span></button>
        <div className="header-divider"/><span className="brand-caption">A world for<br/>the curious.</span>
        <div className="header-right"><span className="city-status"><span className="status-dot"/>{district ? district.sector + ' / ONLINE' : 'CITY ONLINE'}</span><span className="header-coordinate">AC / 001</span><button className={`audio-toggle ${state.audioEnabled ? 'enabled' : ''}`} onClick={toggleAudio} aria-label={state.audioEnabled ? 'Mute ambient audio' : 'Enable quiet ambient audio'} aria-pressed={state.audioEnabled}><span className="audio-bars"><i/><i/><i/><i/></span><span>Sound {state.audioEnabled ? 'on' : 'off'}</span></button><button className="icon-button guide-button" onClick={() => setOverlay('guide')} aria-label="Open controls and city guide"><Icon name="help" size={19}/></button></div>
      </header>
      <main id="main-world" aria-busy={state.isTransitioning}>
        <CityMap state={state} dispatch={dispatch} reduced={reduced} travel={travel} onReady={() => setAssetReady(true)} airsLinkOpen={airsLinkOpen}/>
        {district && <div key={district.id} className={`district-layer ${state.isTransitioning ? 'departing' : ''}`} inert={state.isTransitioning}><DistrictScene id={district.id} begin={() => dispatch({ type: 'OPEN_CONTENT' })} returnToCity={() => travel('city')} reduced={reduced} originComplete={state.originComplete} discovered={state.discovered}/></div>}
      </main>
      <footer className="world-footer"><div className="discovery-counter"><span className="discovery-bars">{districts.map(d => <i key={d.id} className={state.discovered.includes(d.id) ? 'filled' : ''}/>)}</span><span><strong>{String(state.discovered.length).padStart(2, '0')}</strong> / 05 <span className="discovered-word">DISTRICTS DISCOVERED</span></span></div><span className="map-instructions">{state.level === 'CITY' ? 'DRAG TO EXPLORE' : 'FOLLOW YOUR CURIOSITY'}<span>+</span>{state.level === 'CITY' ? 'SELECT A WAYPOINT' : 'ESC TO RETURN'}</span><button className="index-button" id="district-index" onClick={() => setOverlay('index')} disabled={state.isTransitioning}><Icon name="map" size={16}/>District index<span className="key-hint">05</span></button></footer>
      <button className="reference-badge" onClick={() => setOverlay('guide')}>AIRS CITY <span>/ SYSTEM GUIDE</span><span className="reference-dot"/></button>

      {/* ── AIRS LINK trigger — persistent bottom-right HUD button ────────── */}
      <AirsLinkTrigger onClick={openAirsLink} unreadCount={airsLinkUnread} />
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
    {state.level === 'CONTENT' && !state.isTransitioning && (
      <Suspense fallback={null}>
        <MissionPanel key={state.district} state={state} dispatch={dispatch} close={() => dispatch({ type: 'CLOSE_CONTENT' })} returnToCity={() => travel('city')} reduced={reduced} persistentStorage={persistentStorage}/>
      </Suspense>
    )} 
    {overlay && (
      <Suspense fallback={null}>
        <WorldOverlay kind={overlay} close={() => setOverlay(null)} travel={travel} discovered={state.discovered} onOpenTeaser={openTeaser}/>
      </Suspense>
    )}
    {/* ── AIRS LINK device (z-index 60, above MissionPanel/WorldOverlay) ── */}
    {airsLinkOpen && state.introComplete && (
      <Suspense fallback={null}>
        <AirsLink
          state={state}
          travel={travel}
          onClose={closeAirsLink}
          reduced={reduced}
          audioEnabled={state.audioEnabled}
          onToggleAudio={toggleAudio}
          intel={derivedIntel}
          readIntel={readIntel}
          markIntelRead={markIntelRead}
        />
      </Suspense>
    )}
    {!state.introComplete && <Boot ready={assetReady} reduced={reduced} dispatch={dispatch}/>}
    <div className="sr-only" role="status" aria-live="polite">{state.isTransitioning ? 'Traveling' : state.level === 'CITY' ? `City map. ${state.discovered.length} of 5 districts discovered.` : `${district?.name}. ${district?.objective}`}</div>
    {notice && <div className="system-notice" role="status"><span>{notice}</span><button aria-label="Dismiss notice" onClick={() => setNotice('')}><Icon name="close" size={15}/></button></div>}
  </div>;
}
