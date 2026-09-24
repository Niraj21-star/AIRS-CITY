import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { cityAsset } from '../data/assets';
import { districts } from '../data/districts';
import { airsResearchDomains } from '../data/research';
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
    setPhase(7);
  };

  // Replay sequence safely without reloading or creating duplicate engines
  const handleReplay = () => {
    if (timelineRef.current) timelineRef.current.kill();
    setPhase(0);
  };

  // Progress through teaser sequence using GSAP
  useEffect(() => {
    if (reduced) {
      // Under reduced motion: directly present final actionable state with minimal delay
      const t = setTimeout(() => setPhase(7), 1600);
      return () => clearTimeout(t);
    }

    if (timelineRef.current) timelineRef.current.kill();

    const tl = gsap.timeline();
    timelineRef.current = tl;

    if (phase === 0) {
      // Phase 0: Signal Detected -> Phase 1
      tl.to({}, { duration: 2.2, onComplete: () => setPhase(1) });
    } else if (phase === 1) {
      // Phase 1: Identity & Community -> Phase 2
      tl.to({}, { duration: 3.4, onComplete: () => setPhase(2) });
    } else if (phase === 2) {
      // Phase 2: What AIRS Explores (Research Domains) -> Phase 3
      tl.to({}, { duration: 4.4, onComplete: () => setPhase(3) });
    } else if (phase === 3) {
      // Phase 3: What AIRS Builds (Engineering & Systems) -> Phase 4
      tl.to({}, { duration: 3.4, onComplete: () => setPhase(4) });
    } else if (phase === 4) {
      // Phase 4: The City (Concept) -> Phase 5
      tl.to({}, { duration: 3.2, onComplete: () => setPhase(5) });
    } else if (phase === 5) {
      // Phase 5: Master City Reveal (Map + 5 Districts) -> Phase 6
      tl.to({}, { duration: 4.6, onComplete: () => setPhase(6) });
    } else if (phase === 6) {
      // Phase 6: AIRS LINK (Interface Reveal) -> Phase 7
      tl.to({}, { duration: 3.6, onComplete: () => setPhase(7) });
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
        if (phase < 7) {
          e.preventDefault();
          startSoundtrack();
          setPhase(prev => Math.min(7, prev + 1));
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  const handleStageClick = () => {
    startSoundtrack();
    if (phase < 7) {
      setPhase(prev => Math.min(7, prev + 1));
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
          <span className="teaser-tag">EXPERIENCE TEASER // 001</span>
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

          {phase < 7 && (
            <button
              type="button"
              className="teaser-skip-btn"
              onClick={handleSkip}
              aria-label="Skip directly to city entry"
            >
              SKIP TO ACTION <Icon name="arrow" size={12} />
            </button>
          )}
        </div>
      </header>

      {/* ── Central Cinematic Stage ───────────────────────────────────── */}
      <main className="teaser-stage" onClick={handleStageClick}>
        {/* PHASE 0: SIGNAL DETECTED */}
        {phase === 0 && (
          <div className="teaser-scene scene-system" key="scene-signal">
            <div className="teaser-hud-grid" aria-hidden="true" />
            <div className="teaser-terminal">
              <span className="terminal-header">SYS // PROTOCOL 001</span>
              <span className="terminal-signal">SIGNAL DETECTED</span>
              <div className="terminal-divider" />
              <p className="terminal-log">
                NODE CARRIER ....................... <em>LOCKED</em><br />
                DATASTREAM INTEGRITY ............... <em>99.98%</em><br />
                TRANSMISSION TARGET ................ <em>AIRS ARCHIVE</em>
              </p>
            </div>
            <span className="teaser-hint">TAP OR PRESS SPACE TO ADVANCE</span>
          </div>
        )}

        {/* PHASE 1: IDENTITY */}
        {phase === 1 && (
          <div className="teaser-scene scene-identity" key="scene-identity">
            <div className="teaser-emblem">
              <AirsMark />
            </div>
            <div className="teaser-identity-block">
              <span className="eyebrow teaser-gold-tag">ORGANIZATIONAL MANIFEST</span>
              <h1 className="teaser-statement">
                <span className="statement-sub">AIRS</span>
                <span className="statement-main">ARTIFICIAL INTELLIGENCE<br />RESEARCH SOCIETY</span>
              </h1>
              <p className="teaser-identity-body">
                A community built around research, experimentation, engineering, and ideas.
                Where curiosity becomes working technology.
              </p>
            </div>
          </div>
        )}

        {/* PHASE 2: WHAT AIRS EXPLORES (RESEARCH) */}
        {phase === 2 && (
          <div className="teaser-scene scene-explores" key="scene-explores">
            <div className="teaser-explores-header">
              <span className="eyebrow teaser-blue-tag">CANONICAL RESEARCH ATLAS</span>
              <h2 className="teaser-section-title">WHAT AIRS EXPLORES.</h2>
              <p className="teaser-section-sub">
                Five active inquiry frontiers grounded in real problems:
              </p>
            </div>
            <div className="teaser-domains-grid">
              {airsResearchDomains.map(d => (
                <div key={d.code} className="teaser-domain-card">
                  <div className="teaser-domain-code">{d.code}</div>
                  <div className="teaser-domain-body">
                    <h3 className="teaser-domain-name">{d.name}</h3>
                    <p className="teaser-domain-detail">{d.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHASE 3: WHAT AIRS BUILDS */}
        {phase === 3 && (
          <div className="teaser-scene scene-builds" key="scene-builds">
            <div className="teaser-builds-content">
              <span className="eyebrow teaser-orange-tag">ENGINEERING &amp; SYSTEMS</span>
              <h2 className="teaser-builds-title">
                PROOF BEATS<br />
                <strong>POSSIBILITY.</strong>
              </h2>
              <p className="teaser-builds-body">
                Turning curiosity into prototypes, experiments, open-source software, and shared gatherings.
                Learn deeply. Experiment openly. Build deliberately.
              </p>
              <div className="teaser-builds-foot">
                <span>VERIFIED BUILDS</span>
                <span className="pillar-dot">·</span>
                <span>OPEN DISCOVERY</span>
                <span className="pillar-dot">·</span>
                <span>HONEST LIMITATIONS</span>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 4: THE CITY CONCEPT */}
        {phase === 4 && (
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

        {/* PHASE 5: MASTER CITY REVEAL */}
        {phase === 5 && (
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

        {/* PHASE 6: AIRS LINK REVEAL */}
        {phase === 6 && (
          <div className="teaser-scene scene-link" key="scene-link">
            <div className="teaser-device-silhouette">
              <div className="device-header">
                <span>AIRS · IRIS</span>
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
              <h3>AIRS IRIS</h3>
              <p>The handheld interface to decode, inspect, and navigate the city.</p>
            </div>
          </div>
        )}

        {/* PHASE 7: CLIMAX & FINAL CTA */}
        {phase === 7 && (
          <div className="teaser-scene scene-climax" key="scene-climax">
            <div className="climax-atmosphere" aria-hidden="true" />
            <div className="climax-content">
              <span className="eyebrow climax-eyebrow">AIRS CITY // VERSION 1.0</span>
              <h1 className="climax-title">
                YOU DON'T BROWSE IT.<br />
                <span>YOU EXPLORE IT.</span>
              </h1>
              <p className="climax-sub">
                A LIVING DIGITAL WORLD.<br />
                <strong>STEP INSIDE AIRS CITY.</strong>
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
              <span>AIRS · ARTIFICIAL INTELLIGENCE RESEARCH SOCIETY</span>
              <span>5 DISTRICTS · CONTINUOUS AUDIO · FREE EXPLORATION</span>
            </footer>
          </div>
        )}
      </main>

      {/* ── Progress Indicators at Bottom ────────────────────────────── */}
      <div className="teaser-progress-bar" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(step => (
          <span
            key={step}
            className={`progress-pip ${phase >= step ? 'filled' : ''} ${phase === step ? 'active' : ''}`}
            onClick={() => setPhase(step)}
            title={`Phase ${step + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
