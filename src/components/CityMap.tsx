import { useEffect, useLayoutEffect, useRef, useState, type Dispatch, type CSSProperties } from 'react';
import gsap from 'gsap';
import { byId, districts, type DistrictId } from '../data/districts';
import { cityAsset } from '../data/assets';
import { cameraAt, clampCamera, type Action, type Camera, type WorldState } from '../store/world';
import { Icon } from './Icon';

type Props = { state: WorldState; dispatch: Dispatch<Action>; reduced: boolean; travel: (id: DistrictId) => void; onReady: () => void };

export function CityMap({ state, dispatch, reduced, travel, onReady }: Props) {
  const viewport = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const camera = useRef<Camera>({ x: 0, y: 0, scale: 1 });
  const size = useRef({ width: 1, height: 1, worldWidth: 1, worldHeight: 1 });
  const drag = useRef<{ x: number; y: number; cx: number; cy: number; moved: boolean } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [mapError, setMapError] = useState(false);
  const latest = useRef(state);
  latest.current = state;
  const active = byId[state.selected];

  const apply = () => {
    const { x, y, scale } = camera.current;
    if (world.current) gsap.set(world.current, { x, y, scale, force3D: true, '--marker-scale': 1 / scale });
  };
  const overview = () => {
    const { width, height, worldWidth, worldHeight } = size.current;
    return cameraAt({ x: .5, y: .5 }, width, height, worldWidth, worldHeight, 1);
  };
  const animateCamera = (target: Camera, duration = .8) => {
    gsap.killTweensOf(camera.current);
    gsap.to(camera.current, { ...target, duration: reduced ? .12 : duration, ease: 'power3.inOut', onUpdate: apply, onComplete: () => setZoom(target.scale) });
  };

  useLayoutEffect(() => {
    const measure = () => {
      if (!viewport.current || !world.current) return;
      const width = viewport.current.clientWidth, height = viewport.current.clientHeight;
      const worldHeight = Math.max(height * (width < 760 ? 1.6 : 1.08), width * 1.08 / (cityAsset.width / cityAsset.height));
      const worldWidth = worldHeight * cityAsset.width / cityAsset.height;
      size.current = { width, height, worldWidth, worldHeight };
      world.current.style.width = `${worldWidth}px`;
      world.current.style.height = `${worldHeight}px`;
      gsap.killTweensOf(camera.current);
      const current = latest.current;
      const destination = current.isTransitioning ? current.transitionTo : current.district;
      camera.current = !destination || destination === 'city' ? overview() : cameraAt(byId[destination].position, width, height, worldWidth, worldHeight, 3.8);
      if (current.level === 'CITY' && width < 760 && !current.isTransitioning) camera.current = clampCamera(cameraAt(byId[current.selected].position, width * .63, height * .9, worldWidth, worldHeight, 1), width, height, worldWidth, worldHeight);
      apply();
      setZoom(current.level === 'CITY' ? 1 : 3.8);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport.current!);
    measure();
    return () => { observer.disconnect(); gsap.killTweensOf(camera.current); };
  }, []);

  useEffect(() => {
    if (!state.isTransitioning || !state.transitionTo) return;
    const { width, height, worldWidth, worldHeight } = size.current;
    const target = state.transitionTo === 'city' ? overview() : cameraAt(byId[state.transitionTo].position, width, height, worldWidth, worldHeight, 3.8);
    gsap.killTweensOf(camera.current);
    if (reduced || state.transitionTo === 'city') animateCamera(target, 1.8);
    else {
      const settle = cameraAt(byId[state.transitionTo].position, width, height, worldWidth, worldHeight, 3.92);
      const timeline = gsap.timeline({ onUpdate: apply, onComplete: () => setZoom(target.scale) });
      timeline.to(camera.current, { scale: camera.current.scale * 1.012, duration: .16, ease: 'sine.in' })
        .to(camera.current, { ...settle, duration: 1.72, ease: 'power3.inOut' })
        .to(camera.current, { ...target, duration: .32, ease: 'power2.out' });
      return () => { timeline.kill(); };
    }
  }, [state.isTransitioning, state.transitionTo, reduced]);

  // History navigation can bypass TRAVEL. Synchronize the physical camera as well as the route.
  useEffect(() => {
    if (state.isTransitioning) return;
    const { width, height, worldWidth, worldHeight } = size.current;
    const target = state.level === 'CITY' ? overview() : cameraAt(byId[state.district!].position, width, height, worldWidth, worldHeight, 3.8);
    if (state.level === 'CITY' && width < 760) Object.assign(target, clampCamera(cameraAt(active.position, width * .63, height * .9, worldWidth, worldHeight, 1), width, height, worldWidth, worldHeight));
    animateCamera(target, .5);
  }, [state.level, state.district, state.isTransitioning]);

  useEffect(() => {
    if (state.level !== 'CITY' || state.isTransitioning || size.current.width >= 760) return;
    const { width, height, worldWidth, worldHeight } = size.current;
    animateCamera(clampCamera(cameraAt(active.position, width * .63, height * .9, worldWidth, worldHeight, 1), width, height, worldWidth, worldHeight));
  }, [state.selected]);

  const changeZoom = (direction: number) => {
    const { width, height, worldWidth, worldHeight } = size.current;
    const scale = Math.max(1, Math.min(2.2, camera.current.scale + direction * .4));
    const ratio = scale / camera.current.scale;
    animateCamera(clampCamera({ x: width / 2 - (width / 2 - camera.current.x) * ratio, y: height / 2 - (height / 2 - camera.current.y) * ratio, scale }, width, height, worldWidth, worldHeight), .5);
  };

  const focusWaypoint = (id: DistrictId) => {
    dispatch({ type: 'SELECT', id });
    const { width, height, worldWidth, worldHeight } = size.current;
    if (width < 760 || camera.current.scale > 1.2) animateCamera(clampCamera(cameraAt(byId[id].position, width < 760 ? width * .63 : width, height * .9, worldWidth, worldHeight, camera.current.scale), width, height, worldWidth, worldHeight));
  };

  return <section className={`city ${state.level !== 'CITY' ? 'city-away' : ''} ${state.isTransitioning ? 'city-traveling' : ''}`} aria-label="Interactive AIRS City map" aria-hidden={state.level !== 'CITY'} inert={state.level !== 'CITY' || state.isTransitioning || !state.introComplete}>
    <div className="map-viewport" ref={viewport}
      onPointerDown={e => {
        if ((e.target as HTMLElement).closest('button') || state.isTransitioning) return;
        gsap.killTweensOf(camera.current);
        drag.current = { x: e.clientX, y: e.clientY, cx: camera.current.x, cy: camera.current.y, moved: false };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={e => {
        if (!drag.current) return;
        const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) drag.current.moved = true;
        const { width, height, worldWidth, worldHeight } = size.current;
        Object.assign(camera.current, clampCamera({ x: drag.current.cx + dx, y: drag.current.cy + dy, scale: camera.current.scale }, width, height, worldWidth, worldHeight));
        apply();
      }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      <div className="map-world" ref={world}>
        <img className="master-image" src={cityAsset.src} alt={cityAsset.description} fetchPriority="high" draggable="false" onLoad={onReady} onError={() => { setMapError(true); onReady(); }} />
        <div className="map-grade" />
        <div className="haze" aria-hidden="true"/>
        <svg className="map-grid" viewBox="0 0 1000 654" preserveAspectRatio="none" aria-hidden="true"><defs><pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0H0v100" fill="none" stroke="white" strokeOpacity=".07" strokeWidth=".5"/><path d="M48 50h4m-2-2v4" stroke="white" strokeOpacity=".22" strokeWidth=".6"/></pattern></defs><rect width="1000" height="654" fill="url(#grid)"/></svg>
        {/* District connection lines — positions derived from districts.ts normalized coords × 1000/654 */}
        <svg className="city-connections" viewBox="0 0 1000 654" preserveAspectRatio="none" aria-hidden="true">
          {/* HQ ↔ Research */}
          <line x1="510" y1="209" x2="745" y2="281" stroke="white" strokeOpacity=".065" strokeWidth=".75" strokeDasharray="6 14"/>
          {/* HQ ↔ Garage */}
          <line x1="510" y1="209" x2="280" y2="320" stroke="white" strokeOpacity=".065" strokeWidth=".75" strokeDasharray="6 14"/>
          {/* HQ ↔ Arena */}
          <line x1="510" y1="209" x2="500" y2="419" stroke="white" strokeOpacity=".065" strokeWidth=".75" strokeDasharray="6 14"/>
          {/* Arena ↔ Crew */}
          <line x1="500" y1="419" x2="730" y2="471" stroke="white" strokeOpacity=".06" strokeWidth=".7" strokeDasharray="6 14"/>
          {/* Research ↔ Crew */}
          <line x1="745" y1="281" x2="730" y2="471" stroke="white" strokeOpacity=".055" strokeWidth=".65" strokeDasharray="6 14"/>
          {/* Garage ↔ Arena */}
          <line x1="280" y1="320" x2="500" y2="419" stroke="white" strokeOpacity=".045" strokeWidth=".6" strokeDasharray="6 14"/>
        </svg>
        {/* Per-district ambient glow at district positions */}
        <div className="city-light-scatter" aria-hidden="true"/>
        <div className="geographic-label label-west">West sector</div><div className="geographic-label label-east">East sector</div>
        <div className="waypoints" role="navigation" aria-label="City districts">
          {districts.map(d => <button key={d.id} className={`waypoint ${state.selected === d.id ? 'selected' : ''} ${state.discovered.includes(d.id) ? 'discovered' : ''}`} style={{ left: `${d.position.x * 100}%`, top: `${d.position.y * 100}%`, '--accent': d.accent } as CSSProperties}
            aria-label={`${d.name}, ${d.sector}. ${state.discovered.includes(d.id) ? 'Discovered' : 'Unexplored'}. Select destination.`}
            aria-pressed={state.selected === d.id} onFocus={() => focusWaypoint(d.id)}
            onMouseEnter={() => { if (matchMedia('(hover: hover)').matches) dispatch({ type: 'SELECT', id: d.id }); }}
            onClick={() => { focusWaypoint(d.id); if (matchMedia('(hover: hover) and (min-width: 760px)').matches) travel(d.id); }}>
            <span className="waypoint-symbol"><span className="waypoint-orbit"/><Icon name={state.discovered.includes(d.id) ? 'check' : d.id} size={21}/></span>
            <span className="waypoint-stem"/><span className="waypoint-label"><span className="waypoint-code">{d.sector}<span className="marker-status">{state.discovered.includes(d.id) ? ' / DISCOVERED' : d.id === 'hq' ? ' / START HERE' : ''}</span></span><span className="waypoint-name">{d.name}</span><span className="waypoint-enter">{state.discovered.includes(d.id) ? 'Revisit district' : 'Enter district'} <Icon name="arrow" size={13}/></span></span>
          </button>)}
        </div>
      </div>
    </div>
    <div className="city-vignette" />
    {mapError && <div className="asset-error" role="alert">Map image unavailable. Every district is still accessible through the district index.</div>}
    <div className="compass" aria-hidden="true"><span>N</span><svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="currentColor" opacity=".25"/><path d="m26 11 5 20-5-3-5 3z" fill="currentColor"/><path d="M26 4v4m22 18h-4M26 48v-4M4 26h4" stroke="currentColor"/></svg><small>SECTOR 001</small></div>
    <div className="map-legend" aria-label="Waypoint legend"><span><i className="legend-available"/>Available</span><span><i className="legend-selected"/>Selected</span><span><Icon name="check" size={10}/>Discovered</span></div>
    <div className="map-tools" aria-label="Map camera controls"><button title="Zoom in" aria-label="Zoom in" disabled={zoom >= 2.2} onClick={() => changeZoom(1)}><Icon name="plus"/></button><span>{zoom.toFixed(1)}x</span><button title="Zoom out" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => changeZoom(-1)}><Icon name="minus"/></button><button title="Reset map view" aria-label="Reset map view" onClick={() => animateCamera(overview())}><Icon name="target"/></button></div>
    <div className="city-editorial"><p className="eyebrow"><span className="short-rule"/> World map / Free exploration</p><h1>AIRS CITY<span>.</span></h1><p className="city-tagline">You don't browse. You explore.</p></div>
    <aside className="destination-preview" style={{ '--accent': active.accent } as CSSProperties} aria-label="Selected destination">
      <div className="preview-top"><span className="eyebrow">{state.discovered.includes(active.id) ? 'Location discovered / Revisit' : 'Destination selected / Route available'}</span><span className="preview-number">{active.sector}</span></div>
      <h2>{active.name}<Icon name={active.id} size={23}/></h2><div className="preview-mission"><span>Objective {active.number}</span>{active.mission}</div><p>{active.objective}</p>
      {/* Route metadata — bearing and distance from city origin (decorative, world-building) */}
      <div className="preview-route" aria-hidden="true">
        <span><span className="preview-stat-label">Bearing</span>{(((Math.round(Math.atan2(active.position.x - .5, -(active.position.y - .5)) * 180 / Math.PI)) + 360) % 360).toString().padStart(3, '0')}°</span>
        <span><span className="preview-stat-label">Distance</span>{(Math.sqrt((active.position.x-.5)**2+(active.position.y-.5)**2)*10).toFixed(1)} km</span>
        <span><span className="preview-stat-label">Route</span>{state.discovered.includes(active.id) ? 'Revisit' : 'Available'}</span>
      </div>
      <button className="text-action" onClick={() => travel(active.id)}>Enter district <span className="key-hint">ENTER</span><Icon name="arrow" size={19}/></button>
    </aside>
    <nav className="mobile-districts" aria-label="Select a district">{districts.map(d => <button key={d.id} aria-label={`Select ${d.name}`} aria-pressed={state.selected === d.id} className={state.selected === d.id ? 'active' : ''} style={{ '--accent': d.accent } as CSSProperties} onClick={() => focusWaypoint(d.id)}><Icon name={d.id}/><span>{d.id === 'research' ? 'Research' : d.id === 'garage' ? 'Garage' : d.id === 'arena' ? 'Arena' : d.id === 'crew' ? 'Crew' : 'HQ'}</span></button>)}</nav>
  </section>;
}
