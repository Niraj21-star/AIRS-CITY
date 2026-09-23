import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { cityAsset } from '../data/assets';
import { districts } from '../data/districts';
import { AirsMark, Icon } from './Icon';
import { audio } from '../audio';
import cityBgmUrl from '../assets/audio/Midnight_Over_the_Metropolis.mp3';

interface TeaserProps {
  onEnterCity: () => void;
  reduced: boolean;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export function Teaser({ onEnterCity, reduced, audioEnabled, onToggleAudio }: TeaserProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<number>(0);
  const [hasStartedAudio, setHasStartedAudio] = useState(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Sound unlock on first gesture
  const startSoundtrack = () => {
    if (hasStartedAudio) return;
    setHasStartedAudio(true);
    if (!audio.initialized) audio.init();
    void audio.resume().then(() => {
      audio.playBGM(cityBgmUrl);
    }).catch(e => console.warn('Teaser audio resume failed:', e));
  };

  // Skip directly to final action / climax
  const handleSkip = () => {
    startSoundtrack();
    if (timelineRef.current) timelineRef.current.kill();
    setPhase(6);
  };

  // Replay sequence safely without reloading or creating duplicate engines
  const handleReplay = () => {
    if (timelineRef.current) timelineRef.current.kill();
    setPhase(0);
  };

  // Progress through teaser sequence using GSAP
  useEffect(() => {
    if (reduced) {
      // Under reduced motion: directly present clear sequence with minimal delay
      const t = setTimeout(() => setPhase(6), 1800);
      return () => clearTimeout(t);
    }

    if (timelineRef.current) timelineRef.current.kill();

    const tl = gsap.timeline();
    timelineRef.current = tl;

    if (phase === 0) {
      // Phase 0: Cold start -> Phase 1
      tl.to({}, { duration: 1.8, onComplete: () => setPhase(1) });
    } else if (phase === 1) {
      // Phase 1: System activity -> Phase 2
      tl.to({}, { duration: 2.2, onComplete: () => setPhase(2) });
    } else if (phase === 2) {
      // Phase 2: AIRS Identity -> Phase 3
      tl.to({}, { duration: 2.8, onComplete: () => setPhase(3) });
    } else if (phase === 3) {
      // Phase 3: Manifest -> Phase 4
      tl.to({}, { duration: 3.2, onComplete: () => setPhase(4) });
    } else if (phase === 4) {
      // Phase 4: Master City Reveal -> Phase 5
      tl.to({}, { duration: 4.4, onComplete: () => setPhase(5) });
    } else if (phase === 5) {
      // Phase 5: AIRS LINK Reveal -> Phase 6
      tl.to({}, { duration: 3.6, onComplete: () => setPhase(6) });
    }

    return () => {
      tl.kill();
    };
  }, [phase, reduced]);

  // Keyboard navigation: Enter / Space advances or enters; Escape skips to action
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (phase < 6) {
          e.preventDefault();
          startSoundtrack();
          setPhase(prev => Math.min(6, prev + 1));
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  const handleStageClick = () => {
    startSoundtrack();
    if (phase < 6) {
      setPhase(prev => Math.min(6, prev + 1));
    }
  };

  return (
    <div
      className={`teaser-experience ${reduced ? 'teaser-reduced' : ''}`}
      ref={containerRef}
      role="region"
      aria-label="AIRS City Launch Teaser"
    >
      {/* ── Top cinematic HUD bar ────────────────────────────────────── */}
      <header className="teaser-header">
        <div className="teaser-brand">
          <AirsMark />
          <span>AIRS<span>CITY</span></span>
          <span className="teaser-tag">LAUNCH TEASER // 001</span>
        </div>
        <div className="teaser-controls">
          <button
            type="button"
            className="teaser-audio-btn"
            onClick={() => {
              startSoundtrack();
              onToggleAudio();
            }}
            aria-label={audioEnabled ? 'Mute teaser soundtrack' : 'Enable teaser soundtrack'}
            aria-pressed={audioEnabled}
          >
            <Icon name={audioEnabled ? 'sound' : 'mute'} size={13} />
            <span>SOUND {audioEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {phase < 6 && (
            <button
              type="button"
              className="teaser-skip-btn"
              onClick={handleSkip}
              aria-label="Skip to action and enter city"
            >
              SKIP TO ACTION <Icon name="arrow" size={12} />
            </button>
          )}
        </div>
      </header>

      {/* ── Central Cinematic Stage ───────────────────────────────────── */}
      <main className="teaser-stage" onClick={handleStageClick}>
        {/* PHASE 0 & 1: COLD START & SYSTEM ACTIVITY */}
        {(phase === 0 || phase === 1) && (
          <div className="teaser-scene scene-system" key="scene-system">
            <div className="teaser-hud-grid" aria-hidden="true" />
            <div className="teaser-terminal">
              <span className="terminal-header">SYS // PROTOCOL 001</span>
              <span className="terminal-signal">SIGNAL ACQUISITION IN PROGRESS</span>
              <div className="terminal-divider" />
              <p className="terminal-log">
                AIRS METROPOLIS DATA FEED .......... <em>LOCATED</em><br />
                DISTRICT COORDINATES ............... <em>SYNCHRONIZED</em><br />
                WORLD STATUS ....................... <em>READY FOR REVEAL</em>
              </p>
            </div>
            <span className="teaser-hint">CLICK OR PRESS SPACE TO ADVANCE</span>
          </div>
        )}

        {/* PHASE 2: AIRS IDENTITY */}
        {phase === 2 && (
          <div className="teaser-scene scene-identity" key="scene-identity">
            <div className="teaser-emblem">
              <AirsMark />
            </div>
            <h1 className="teaser-statement">
              <span className="statement-sub">AIRS</span>
              <span className="statement-main">IS BUILDING<br />SOMETHING DIFFERENT.</span>
              <span className="statement-accent">A CITY.</span>
            </h1>
          </div>
        )}

        {/* PHASE 3: MANIFEST */}
        {phase === 3 && (
          <div className="teaser-scene scene-manifest" key="scene-manifest">
            <span className="teaser-badge-label">A DIGITAL WORLD FOR</span>
            <div className="teaser-manifest-pillars">
              <span>RESEARCH</span>
              <span className="pillar-dot">·</span>
              <span>PROJECTS</span>
              <span className="pillar-dot">·</span>
              <span>EVENTS</span>
              <span className="pillar-dot">·</span>
              <span>PEOPLE</span>
            </div>
            <h2 className="teaser-mantra">
              YOU DON'T BROWSE IT.<br />
              <strong>YOU EXPLORE IT.</strong>
            </h2>
          </div>
        )}

        {/* PHASE 4: CITY REVEAL */}
        {phase === 4 && (
          <div className="teaser-scene scene-city" key="scene-city">
            <div className="teaser-city-viewport">
              <img
                src={cityAsset.src}
                alt="AIRS City master map aerial view"
                className="teaser-master-city-img"
              />
              <div className="teaser-city-scan" aria-hidden="true" />
              <div className="teaser-city-grade" />
              {/* Waypoint pings */}
              <div className="teaser-waypoints" aria-hidden="true">
                {districts.map(d => (
                  <div
                    key={d.id}
                    className="teaser-beacon"
                    style={{ left: `${d.position.x * 100}%`, top: `${d.position.y * 100}%` }}
                  >
                    <span className="beacon-ring" />
                    <span className="beacon-dot" />
                    <span className="beacon-tag">{d.sector}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="teaser-city-caption">
              <span className="eyebrow">SECTORS 01 – 05 ONLINE</span>
              <h2>AIRS CITY</h2>
              <p>Five interconnected districts. One unified curiosity.</p>
            </div>
          </div>
        )}

        {/* PHASE 5: AIRS LINK REVEAL */}
        {phase === 5 && (
          <div className="teaser-scene scene-link" key="scene-link">
            <div className="teaser-device-silhouette">
              <div className="device-header">
                <span>AIRS · LINK</span>
                <span className="device-indicator" />
              </div>
              <div className="device-screen-glimpse">
                <span className="glimpse-label">PRIMARY NAVIGATION OS</span>
                <div className="glimpse-dock">
                  <div className="glimpse-app active">
                    <Icon name="map" size={16} />
                    <span>CITY</span>
                  </div>
                  <div className="glimpse-app">
                    <Icon name="research" size={16} />
                    <span>RESEARCH</span>
                  </div>
                  <div className="glimpse-app">
                    <Icon name="garage" size={16} />
                    <span>PROJECTS</span>
                  </div>
                  <div className="glimpse-app">
                    <Icon name="crew" size={16} />
                    <span>CREW</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="teaser-device-copy">
              <span className="eyebrow">PORTABLE OPERATING SYSTEM</span>
              <h3>AIRS LINK</h3>
              <p>Your handheld device for navigation, intel, dossiers, and missions.</p>
            </div>
          </div>
        )}

        {/* PHASE 6: CLIMAX & CTA */}
        {phase === 6 && (
          <div className="teaser-scene scene-climax" key="scene-climax">
            <div className="climax-atmosphere" aria-hidden="true" />
            <div className="climax-content">
              <span className="eyebrow climax-eyebrow">OFFICIAL EXPERIENCE TEASER</span>
              <h1 className="climax-title">
                YOU DON'T BROWSE IT.<br />
                <span>YOU EXPLORE IT.</span>
              </h1>
              <p className="climax-sub">
                THE WORLD IS BEING BUILT.<br />
                <strong>AIRS CITY.</strong>
              </p>

              <div className="climax-actions">
                <button
                  type="button"
                  className="climax-primary-btn"
                  onClick={() => {
                    startSoundtrack();
                    onEnterCity();
                  }}
                  autoFocus
                >
                  ENTER CITY <Icon name="arrow" size={16} />
                </button>
                <button
                  type="button"
                  className="climax-secondary-btn"
                  onClick={handleReplay}
                >
                  REPLAY TEASER
                </button>
              </div>
            </div>

            <footer className="teaser-footer">
              <span>AIRS · ARTIFICIAL INTELLIGENCE & TECHNOLOGY</span>
              <span>5 DISTRICTS · CONTINUOUS AUDIO · FREE EXPLORATION</span>
            </footer>
          </div>
        )}
      </main>

      {/* ── Progress Indicators at Bottom ────────────────────────────── */}
      <div className="teaser-progress-bar" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6].map(step => (
          <span
            key={step}
            className={`progress-pip ${phase >= step ? 'filled' : ''} ${phase === step ? 'active' : ''}`}
            onClick={() => setPhase(step)}
          />
        ))}
      </div>
    </div>
  );
}
