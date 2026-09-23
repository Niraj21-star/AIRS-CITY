import { useState } from 'react';
import { getContentStatus } from '../data/contentStatus';
import { contentManifest } from '../data/contentManifest';
import {
  validateCrew,
  validateProjects,
  validateEvents,
  validateLinks,
  validateResearch,
  type ValidationError,
} from '../data/validate';
import { crewData } from '../data/crew';
import { airsProjects } from '../data/projects';
import { airsEvents } from '../data/events';
import { officialLinks } from '../data/links';
import { airsResearchDomains, airsResearchLabs, airsPublications, airsOpportunities } from '../data/research';

export function DevContentPreview({ onExit }: { onExit: () => void }) {
  const [activeTab, setActiveTab] = useState<'manifest' | 'crew' | 'projects' | 'research' | 'events' | 'links' | 'validation'>('manifest');
  const status = getContentStatus();

  // Run validation
  const validationResults = {
    crew: validateCrew(crewData),
    projects: validateProjects(airsProjects),
    events: validateEvents(airsEvents),
    links: validateLinks(officialLinks),
    research: validateResearch({
      labs: airsResearchLabs,
      publications: airsPublications,
      opportunities: airsOpportunities,
    }),
  };

  const totalErrors = Object.values(validationResults).reduce((acc, errs) => acc + errs.length, 0);

  return (
    <div className="dev-preview-overlay" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: '#030712',
      color: '#f9fafb',
      fontFamily: 'monospace',
      padding: '24px',
      overflowY: 'auto',
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1f2937',
        paddingBottom: '16px',
        marginBottom: '20px',
      }}>
        <div>
          <span style={{ color: '#22d3ee', fontSize: '11px', letterSpacing: '0.15em' }}>INTERNAL DEV PREVIEW // NOT IN PRODUCTION BUILD</span>
          <h1 style={{ fontSize: '20px', margin: '4px 0 0 0', fontWeight: 600 }}>AIRS Content Command Center</h1>
        </div>
        <button
          onClick={onExit}
          style={{
            background: '#111827',
            border: '1px solid #374151',
            color: '#f3f4f6',
            padding: '6px 14px',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          Exit to City
        </button>
      </header>

      {/* Navigation tabs */}
      <nav style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['manifest', 'crew', 'projects', 'research', 'events', 'links', 'validation'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? '#22d3ee' : '#111827',
              color: activeTab === tab ? '#030712' : '#9ca3af',
              border: '1px solid #374151',
              padding: '6px 12px',
              cursor: 'pointer',
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '12px',
            }}
          >
            {tab} {tab === 'validation' && `(${totalErrors} errors)`}
          </button>
        ))}
      </nav>

      {/* Main Tab Content */}
      {activeTab === 'manifest' && (
        <section>
          <h2 style={{ fontSize: '16px', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>Content Readiness Manifest</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
            {Object.entries(status).map(([domain, detail]) => (
              <div key={domain} style={{ background: '#111827', border: '1px solid #1f2937', padding: '16px', borderRadius: '4px' }}>
                <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' }}>{domain}</span>
                <div style={{
                  display: 'inline-block',
                  marginLeft: '8px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  fontWeight: 700,
                  backgroundColor: detail.readiness === 'READY' ? '#065f46' : detail.readiness === 'PARTIAL' ? '#854d0e' : '#374151',
                  color: detail.readiness === 'READY' ? '#34d399' : detail.readiness === 'PARTIAL' ? '#fde047' : '#9ca3af',
                }}>
                  {detail.readiness}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, margin: '12px 0 4px 0' }}>
                  {detail.verifiedRecords} <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 400 }}>/ {detail.totalConfigured} verified</span>
                </div>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{detail.notes}</p>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '14px', marginTop: '24px' }}>Live Manifest JSON</h3>
          <pre style={{ background: '#090d16', border: '1px solid #1e293b', padding: '16px', overflowX: 'auto', fontSize: '12px', color: '#38bdf8' }}>
            {JSON.stringify(contentManifest, null, 2)}
          </pre>
        </section>
      )}

      {activeTab === 'crew' && (
        <section>
          <h2 style={{ fontSize: '16px', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>Crew Roster Pipeline</h2>
          <p style={{ color: '#9ca3af', fontSize: '13px' }}>Board of Directors: 4 roles. Operational Teams: 7 teams (21 positions). Total slots: 25.</p>
          <div style={{ background: '#111827', padding: '16px', borderRadius: '4px' }}>
            <h4 style={{ color: '#22d3ee', margin: '0 0 12px 0' }}>Board of Directors</h4>
            {crewData.board.map(b => (
              <div key={b.id} style={{ borderBottom: '1px solid #1f2937', padding: '8px 0', fontSize: '13px' }}>
                <span style={{ fontWeight: 600 }}>{b.role}</span>: {b.name || <em style={{ color: '#eab308' }}>DATA PENDING</em>}
              </div>
            ))}
            <h4 style={{ color: '#22d3ee', margin: '20px 0 12px 0' }}>The 7 Teams</h4>
            {crewData.teams.map(t => (
              <div key={t.id} style={{ borderBottom: '1px solid #1f2937', padding: '8px 0', fontSize: '13px' }}>
                <strong style={{ color: '#38bdf8' }}>{t.name}</strong> ({t.code}) — Lead: {t.lead?.name || <em style={{ color: '#eab308' }}>DATA PENDING</em>}, Co-Lead: {t.coLead?.name || <em style={{ color: '#eab308' }}>DATA PENDING</em>}, Members: {t.members.length} slots
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'projects' && (
        <section>
          <h2 style={{ fontSize: '16px', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>Projects Repository</h2>
          {airsProjects.length === 0 ? (
            <div style={{ background: '#111827', padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
              <strong>NO VERIFIED ENTRIES</strong>
              <p style={{ fontSize: '13px', margin: '6px 0 0 0' }}>Provisional records removed. Awaiting official student submissions via <code>content/projects/</code>.</p>
            </div>
          ) : (
            <div>{airsProjects.map(p => <div key={p.id}>{p.name}</div>)}</div>
          )}
        </section>
      )}

      {activeTab === 'research' && (
        <section>
          <h2 style={{ fontSize: '16px', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>Research Network</h2>
          <div style={{ background: '#111827', padding: '16px', borderRadius: '4px' }}>
            <h4 style={{ color: '#22d3ee', margin: '0 0 8px 0' }}>Exploratory Horizons (5 Canonical Domains)</h4>
            {airsResearchDomains.map(d => (
              <div key={d.code} style={{ padding: '6px 0', borderBottom: '1px solid #1f2937', fontSize: '13px' }}>
                <strong>[{d.code}] {d.name}</strong> — {d.tools}
              </div>
            ))}
            <h4 style={{ color: '#22d3ee', margin: '16px 0 8px 0' }}>Verified Labs & Publications</h4>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
              Labs: {airsResearchLabs.length} | Publications: {airsPublications.length} | Opportunities: {airsOpportunities.length} (honest empty state active)
            </p>
          </div>
        </section>
      )}

      {activeTab === 'events' && (
        <section>
          <h2 style={{ fontSize: '16px', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>Events Calendar</h2>
          {airsEvents.length === 0 ? (
            <div style={{ background: '#111827', padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
              <strong>EVENT ARCHIVE STANDBY</strong>
              <p style={{ fontSize: '13px', margin: '6px 0 0 0' }}>Zero unconfirmed future dates published. Ready for verified schedules via <code>content/events/</code>.</p>
            </div>
          ) : (
            <div>{airsEvents.map(e => <div key={e.id}>{e.title}</div>)}</div>
          )}
        </section>
      )}

      {activeTab === 'links' && (
        <section>
          <h2 style={{ fontSize: '16px', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>Official Links Registry</h2>
          <div style={{ background: '#111827', padding: '16px', borderRadius: '4px' }}>
            {officialLinks.map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1f2937', fontSize: '13px' }}>
                <div>
                  <strong>{l.label}</strong> ({l.category})
                  <div style={{ color: '#9ca3af', fontSize: '11px' }}>{l.note}</div>
                </div>
                <div style={{ color: l.verified ? '#34d399' : '#eab308' }}>
                  {l.verified ? `VERIFIED: ${l.url}` : 'STATUS: UNVERIFIED'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'validation' && (
        <section>
          <h2 style={{ fontSize: '16px', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>Validation Audit</h2>
          {totalErrors === 0 ? (
            <div style={{ background: '#064e3b', color: '#34d399', padding: '16px', borderRadius: '4px' }}>
              All validation suites passed (0 errors across Crew, Projects, Events, Research, and Links).
            </div>
          ) : (
            <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '16px', borderRadius: '4px' }}>
              {totalErrors} validation errors detected. See details below.
            </div>
          )}
        </section>
      )}
    </div>
  );
}
