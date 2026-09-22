import { useEffect, useRef, type Dispatch } from 'react';
import gsap from 'gsap';
import type { Action } from '../store/world';
import { AirsMark } from './Icon';

export function Boot({ ready, reduced, dispatch }: { ready: boolean; reduced: boolean; dispatch: Dispatch<Action> }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ready) return;
    if (reduced) { dispatch({ type: 'INTRO_COMPLETE' }); return; }
    const ctx = gsap.context(() => {
      gsap.timeline()
        // System init text cascades in
        .fromTo('.boot-sys-line', { opacity: 0, x: -7 }, { opacity: 1, x: 0, stagger: 0.1, duration: 0.3, ease: 'power2.out' }, 0)
        // System text fades out as world reveals
        .to('.boot-preload', { opacity: 0, duration: 0.6, ease: 'power2.in' }, 0.95)
        // Identity reveal — slightly delayed from original 0.2 to allow sys text a moment
        .fromTo('.boot-identity', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .9 }, .3)
        // CITY letterpress reveal (original timing preserved)
        .fromTo('.boot-city', { opacity: 0, letterSpacing: '.5em' }, { opacity: 1, letterSpacing: '.25em', duration: 1.2 }, 1.1)
        // Progress bar (original timing preserved)
        .to('.boot-progress i', { scaleX: 1, duration: 2.1, ease: 'power2.inOut' }, .6)
        // Status line (original timing preserved)
        .to('.boot-status', { opacity: 1, duration: .4 }, 1.8)
        // Coordinate block drifts in
        .fromTo('.boot-coords', { opacity: 0 }, { opacity: 1, duration: 0.7 }, 1.5)
        // Initialize button fades in
        .fromTo('.skip-intro', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 2.2);
    }, root);
    return () => ctx.revert();
  }, [ready, reduced, dispatch]);

  const onInitialize = () => {
    if (!root.current) return;
    dispatch({ type: 'AUDIO', enabled: true });
    gsap.to(root.current, { opacity: 0, duration: 1.1, ease: 'power2.inOut', onComplete: () => {
      dispatch({ type: 'INTRO_COMPLETE' });
    } });
  };

  // No timeout guard. Wait for user to click Initialize.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter') onInitialize(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch]);

  return (
    <div className="boot" ref={root} role="dialog" aria-modal="true" aria-label="Entering AIRS City">
      {/* Scan line — decorative */}
      <div className="boot-scanline" aria-hidden="true"/>

      {/* System initialization text — fades out before identity reveals */}
      <div className="boot-preload" aria-hidden="true">
        <span className="boot-sys-line boot-sys-header">AIRS // CITY SYSTEM</span>
        <span className="boot-sys-line boot-sys-sub">Initializing world</span>
        <div className="boot-sys-divider"/>
        <span className="boot-sys-line">City database <span className="boot-fill">.......</span> <em>Online</em></span>
        <span className="boot-sys-line">Geography <span className="boot-fill">...........</span> <em>Locked</em></span>
        <span className="boot-sys-line">Districts <span className="boot-fill">...........</span> <em>05</em></span>
        <span className="boot-sys-line">Signal network <span className="boot-fill">......</span> <em>Online</em></span>
      </div>

      {/* Core identity — unchanged structure */}
      <div className="boot-center">
        <div className="boot-identity"><AirsMark/><span>AIRS</span></div>
        <div className="boot-city">CITY</div>
        <div className="boot-progress"><i/></div>
        <span className="boot-status eyebrow">City online / Welcome, explorer</span>
      </div>

      {/* World coordinate block — fades in during identity reveal */}
      <div className="boot-coords" aria-hidden="true">
        <span>SYS / AC–001</span>
        <span>18.5204° N · 73.8567° E</span>
        <span>World status · Online</span>
      </div>

      {/* Unchanged corner + skip */}
      <span className="boot-corner eyebrow">A world for the curious</span>
      <button className="skip-intro" style={{ opacity: 0 }} onClick={onInitialize} autoFocus>Initialize <span>ENTER</span></button>
    </div>
  );
}
