import { crewData } from './crew.ts';
import { airsProjects } from './projects.ts';
import { airsResearchDomains, airsResearchLabs, airsPublications } from './research.ts';
import { airsEvents } from './events.ts';
import { officialLinks } from './links.ts';

export type DomainReadiness = 'EMPTY' | 'PARTIAL' | 'READY';

export interface DomainStatusDetail {
  readiness: DomainReadiness;
  totalConfigured: number;
  verifiedRecords: number;
  notes: string;
}

export interface ContentStatusReport {
  crew: DomainStatusDetail;
  projects: DomainStatusDetail;
  research: DomainStatusDetail;
  events: DomainStatusDetail;
  links: DomainStatusDetail;
}

/**
 * Computes internal content pipeline status across all 5 content pillars.
 * Internal product signals only; not for marketing claims.
 */
export function getContentStatus(): ContentStatusReport {
  // 1. Crew
  const boardCount = crewData.board.length;
  const teamRolesCount = crewData.teams.reduce((acc, t) => {
    return acc + (t.lead ? 1 : 0) + (t.coLead ? 1 : 0) + t.members.length;
  }, 0);
  const totalCrewRoles = boardCount + teamRolesCount;

  const verifiedCrewCount =
    crewData.board.filter(b => b.verified === true || Boolean(b.name)).length +
    crewData.teams.reduce((acc, t) => {
      const leadVerified = t.lead && (t.lead.verified === true || Boolean(t.lead.name)) ? 1 : 0;
      const coLeadVerified = t.coLead && (t.coLead.verified === true || Boolean(t.coLead.name)) ? 1 : 0;
      const membersVerified = t.members.filter(m => m.verified === true || Boolean(m.name)).length;
      return acc + leadVerified + coLeadVerified + membersVerified;
    }, 0);

  const crewReadiness: DomainReadiness =
    verifiedCrewCount === 0 ? 'EMPTY' : verifiedCrewCount >= totalCrewRoles ? 'READY' : 'PARTIAL';

  // 2. Projects
  const totalProjects = airsProjects.length;
  const verifiedProjects = airsProjects.filter(p => p.verified === true).length;
  const projectsReadiness: DomainReadiness =
    totalProjects === 0 ? 'EMPTY' : verifiedProjects === totalProjects ? 'READY' : 'PARTIAL';

  // 3. Research
  const totalDomains = airsResearchDomains.length;
  const verifiedResearchRecords = airsResearchLabs.length + airsPublications.length;
  // Research is PARTIAL because 5 exploratory domains are defined, while labs/publications await data
  const researchReadiness: DomainReadiness =
    totalDomains > 0 && verifiedResearchRecords === 0
      ? 'PARTIAL'
      : verifiedResearchRecords > 0
        ? 'READY'
        : 'EMPTY';

  // 4. Events
  const totalEvents = airsEvents.length;
  const verifiedEvents = airsEvents.filter(e => e.verified === true).length;
  const eventsReadiness: DomainReadiness =
    totalEvents === 0 ? 'EMPTY' : verifiedEvents === totalEvents ? 'READY' : 'PARTIAL';

  // 5. Links
  const totalLinks = officialLinks.length;
  const verifiedLinks = officialLinks.filter(l => l.verified === true).length;
  const linksReadiness: DomainReadiness =
    verifiedLinks === 0 ? 'EMPTY' : verifiedLinks === totalLinks ? 'READY' : 'PARTIAL';

  return {
    crew: {
      readiness: crewReadiness,
      totalConfigured: totalCrewRoles,
      verifiedRecords: verifiedCrewCount,
      notes: `${totalCrewRoles} structural roles configured; real personnel roster pending.`,
    },
    projects: {
      readiness: projectsReadiness,
      totalConfigured: totalProjects,
      verifiedRecords: verifiedProjects,
      notes: totalProjects === 0 ? 'Provisional stubs removed; awaiting verified student projects.' : `${verifiedProjects} verified.`,
    },
    research: {
      readiness: researchReadiness,
      totalConfigured: totalDomains,
      verifiedRecords: verifiedResearchRecords,
      notes: '5 exploratory domains established; labs and publications pending submission.',
    },
    events: {
      readiness: eventsReadiness,
      totalConfigured: totalEvents,
      verifiedRecords: verifiedEvents,
      notes: totalEvents === 0 ? 'No events published; awaiting confirmed schedule.' : `${verifiedEvents} verified.`,
    },
    links: {
      readiness: linksReadiness,
      totalConfigured: totalLinks,
      verifiedRecords: verifiedLinks,
      notes: `${totalLinks} platforms classified; pending live URL verification.`,
    },
  };
}
