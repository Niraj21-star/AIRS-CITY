import { useEffect, useRef, useState, type CSSProperties } from 'react';
import gsap from 'gsap';
import { cityAsset, districtEnvironments } from '../data/assets';
import { byId, districts, type District, type DistrictId } from '../data/districts';
import { Icon } from './Icon';

export function MiniMap({ district, onReturn, discovered }: { district: District; onReturn: () => void; discovered: DistrictId[] }) {
  return <button className="minimap" onClick={onReturn} aria-label={`You are at ${district.name}. Return to city map.`}>
    <span className="minimap-image"><img src={cityAsset.src} alt="" onError={e => { e.currentTarget.hidden = true; }}/><span className="minimap-grid"/>{districts.filter(d => d.id !== district.id).map(d => <span key={d.id} className="minimap-other" style={{ left: `${d.position.x * 100}%`, top: `${d.position.y * 100}%`, opacity: discovered.includes(d.id) ? 1 : .35 }}/>) }
      {/* Radar sweep ring — animates outward from current location */}
      <span className="minimap-radar" style={{ left: `${district.position.x * 100}%`, top: `${district.position.y * 100}%` }}/>
      <span className="minimap-dot" style={{ left: `${district.position.x * 100}%`, top: `${district.position.y * 100}%`, background: district.accent }}/><span className="minimap-n">N</span></span>
    <span className="minimap-caption"><span><span className="status-dot"/>You / {district.sector}</span><Icon name="expand" size={14}/></span>
    <span className="minimap-return">Return to city <span>ESC</span></span>
  </button>;
}

export function DistrictScene({ id, begin, returnToCity, reduced, originComplete, discovered }: { id: DistrictId; begin: () => void; returnToCity: () => void; reduced: boolean; originComplete: boolean; discovered: DistrictId[] }) {
  const d = byId[id];
  const scene = useRef<HTMLElement>(null);
  const image = districtEnvironments[id];
  const [environmentFailed, setEnvironmentFailed] = useState(false);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.scene-reveal', { y: reduced ? 0 : 28, opacity: 0, stagger: reduced ? 0 : .11, duration: reduced ? .15 : .95, ease: 'power3.out', delay: reduced ? 0 : .1 });
    }, scene);
    return () => ctx.revert();
  }, [id, reduced]);
  return <section ref={scene} className={`district-scene scene-${id}`} style={{ '--accent': d.accent } as CSSProperties} aria-labelledby="district-title">
    <div className="district-environment">
      {!environmentFailed && <img src={image || cityAsset.src} onError={() => setEnvironmentFailed(true)} alt={image ? `${d.name} environment` : `${d.name}: temporary close aerial approach using the city reference image. Matching exterior not supplied.`} style={image ? undefined : { width: '210%', height: '210%', left: `${50 - d.position.x * 210}%`, top: `${50 - d.position.y * 210}%` }}/>}
    </div>
    <div className="scene-vignette"/>
    <div className="district-heading scene-reveal"><span className="eyebrow"><span className="status-dot"/>Location discovered / You are here</span><div><span>{d.sector}</span><span className="thin-rule"/><span>{d.name}</span></div></div>
    <div className="environment-reticle" aria-hidden="true"><span/><span/><span/><span/><div><Icon name={id} size={30}/><small>{d.sector}</small></div></div>
    <div className="scene-copy">
      <p className="eyebrow scene-reveal">{d.category}</p>
      <h1 id="district-title" className="scene-reveal" tabIndex={-1}>{d.title[0]}<br/><span>{d.title[1]}</span></h1>
      <div className="mission-brief scene-reveal"><span className="mission-index">{d.number}</span><div><p className="eyebrow">{id === 'hq' && originComplete ? 'Mission complete / Replay available' : id === 'arena' ? 'Upcoming Event' : `Mission ${d.number}`}</p><h2>{id === 'arena' ? 'VORTEXA 3.0' : d.mission}</h2><p>{id === 'arena' ? '12 hours Hackathon • Prize Pool Upto ₹75000' : d.objective}</p></div></div>
      <button className="primary-action scene-reveal" onClick={begin}>{id === 'hq' && originComplete ? 'Revisit the origin' : d.action}<Icon name="arrow"/></button>
    </div>
    <div className="scene-coordinate scene-reveal"><span>Map X {d.position.x.toFixed(3)} / Y {d.position.y.toFixed(3)}</span><span>{environmentFailed ? 'Environment unavailable / Navigation active' : image ? 'Exterior view' : 'Aerial approach / Reference environment'}</span></div>
    <MiniMap district={d} onReturn={returnToCity} discovered={discovered}/>
  </section>;
}
