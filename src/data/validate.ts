import type { CrewData, Person, CrewHierarchyLevel } from './crew';
import type { ProjectItem, ProjectCategory } from './projects';
import type { AirsEventItem, EventCategory } from './events';
import type { OfficialLink, OfficialLinkCategory } from './links';
import type { ResearchLab, ResearchPublication, ResearchOpportunity } from './research';

export interface ValidationError {
  entity: string;
  id?: string;
  field?: string;
  message: string;
}

export const OFFICIAL_TEAM_NAMES = [
  'Event Management Team',
  'Marketing Team',
  'PR (Public Relations) Team',
  'Cultural Team',
  'Tech Team',
  'Design Team',
  'Media Team',
] as const;

export const OFFICIAL_BOARD_ROLES = [
  'President',
  'Vice President',
  'Secretary',
  'Treasurer',
] as const;

export const OFFICIAL_HIERARCHY_LEVELS: CrewHierarchyLevel[] = [
  'board',
  'lead',
  'colead',
  'member',
];

export const VALID_PROJECT_CATEGORIES: ProjectCategory[] = [
  'all',
  'ai-ml',
  'software',
  'robotics',
  'open-source',
];

export const VALID_EVENT_CATEGORIES: EventCategory[] = [
  'upcoming',
  'hackathons',
  'workshops',
  'talks',
  'competitions',
  'past',
];

export const VALID_LINK_CATEGORIES: OfficialLinkCategory[] = [
  'website',
  'github',
  'linkedin',
  'instagram',
  'discord',
  'other',
];

function isValidUrl(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates date string. Accepts ISO dates (YYYY-MM-DD, YYYY-MM-DDTHH:mm:ssZ) or parseable date strings.
 */
function isValidDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) return false;
  // Ensure date has at least a 4-digit year component
  return /\b\d{4}\b/.test(dateStr);
}

/**
 * Validates the Crew organizational roster.
 * Checks for ID uniqueness, official team names, board roles, hierarchy levels, and valid links.
 */
export function validateCrew(data: CrewData): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenIds = new Set<string>();

  const checkPerson = (p: Person, expectedLevel: CrewHierarchyLevel, context: string) => {
    if (!p.id || !p.id.trim()) {
      errors.push({ entity: 'Crew Person', field: 'id', message: `Missing required ID in ${context}` });
    } else if (seenIds.has(p.id)) {
      errors.push({ entity: 'Crew Person', id: p.id, field: 'id', message: `Duplicate person ID '${p.id}' found in ${context}` });
    } else {
      seenIds.add(p.id);
    }

    if (!p.role || !p.role.trim()) {
      errors.push({ entity: 'Crew Person', id: p.id, field: 'role', message: `Missing required role for person '${p.id}'` });
    }

    if (!OFFICIAL_HIERARCHY_LEVELS.includes(p.level)) {
      errors.push({ entity: 'Crew Person', id: p.id, field: 'level', message: `Invalid hierarchy level '${p.level}' for person '${p.id}'` });
    } else if (p.level !== expectedLevel) {
      errors.push({
        entity: 'Crew Person',
        id: p.id,
        field: 'level',
        message: `Person '${p.id}' in ${context} has level '${p.level}', expected '${expectedLevel}'`,
      });
    }

    if (p.links) {
      for (const link of p.links) {
        if (link.url && !isValidUrl(link.url)) {
          errors.push({ entity: 'Crew Person', id: p.id, field: 'links', message: `Invalid URL '${link.url}' for person '${p.id}'` });
        }
      }
    }
  };

  // Validate Board
  for (const member of data.board) {
    checkPerson(member, 'board', 'Board of Directors');
    if (!OFFICIAL_BOARD_ROLES.includes(member.role as any)) {
      errors.push({
        entity: 'Board Member',
        id: member.id,
        field: 'role',
        message: `Role '${member.role}' is not one of the official board roles (${OFFICIAL_BOARD_ROLES.join(', ')})`,
      });
    }
  }

  // Validate Teams
  for (const team of data.teams) {
    if (!OFFICIAL_TEAM_NAMES.includes(team.name as any)) {
      errors.push({
        entity: 'Team',
        id: team.id,
        field: 'name',
        message: `Team name '${team.name}' does not match official team structure`,
      });
    }

    if (team.lead) checkPerson(team.lead, 'lead', `${team.name} (Lead)`);
    if (team.coLead) checkPerson(team.coLead, 'colead', `${team.name} (Co-Lead)`);
    for (const member of team.members) {
      checkPerson(member, 'member', `${team.name} (Member)`);
    }
  }

  return errors;
}

/**
 * Validates the Project repository.
 * Checks for ID uniqueness, category validity, URL formats, and verified URL requirements.
 */
export function validateProjects(projects: ProjectItem[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenIds = new Set<string>();

  for (const proj of projects) {
    if (!proj.id || !proj.id.trim()) {
      errors.push({ entity: 'Project', field: 'id', message: 'Project is missing required ID' });
    } else if (seenIds.has(proj.id)) {
      errors.push({ entity: 'Project', id: proj.id, field: 'id', message: `Duplicate project ID '${proj.id}'` });
    } else {
      seenIds.add(proj.id);
    }

    if (!VALID_PROJECT_CATEGORIES.includes(proj.category)) {
      errors.push({
        entity: 'Project',
        id: proj.id,
        field: 'category',
        message: `Invalid project category '${proj.category}'`,
      });
    }

    if (proj.repositoryUrl && !isValidUrl(proj.repositoryUrl)) {
      errors.push({ entity: 'Project', id: proj.id, field: 'repositoryUrl', message: `Invalid repository URL '${proj.repositoryUrl}'` });
    }

    if (proj.demoUrl && !isValidUrl(proj.demoUrl)) {
      errors.push({ entity: 'Project', id: proj.id, field: 'demoUrl', message: `Invalid demo URL '${proj.demoUrl}'` });
    }

    if (proj.verified && !proj.repositoryUrl && !proj.demoUrl) {
      errors.push({ entity: 'Project', id: proj.id, field: 'verified', message: `Verified project '${proj.id}' requires at least a repositoryUrl or demoUrl` });
    }
  }

  return errors;
}

/**
 * Validates the Events repository.
 * Checks for ID uniqueness, category validity, date formatting, and URLs.
 */
export function validateEvents(events: AirsEventItem[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenIds = new Set<string>();

  for (const event of events) {
    if (!event.id || !event.id.trim()) {
      errors.push({ entity: 'Event', field: 'id', message: 'Event is missing required ID' });
    } else if (seenIds.has(event.id)) {
      errors.push({ entity: 'Event', id: event.id, field: 'id', message: `Duplicate event ID '${event.id}'` });
    } else {
      seenIds.add(event.id);
    }

    if (!VALID_EVENT_CATEGORIES.includes(event.category)) {
      errors.push({
        entity: 'Event',
        id: event.id,
        field: 'category',
        message: `Invalid event category '${event.category}'`,
      });
    }

    if (event.date && !isValidDate(event.date)) {
      errors.push({ entity: 'Event', id: event.id, field: 'date', message: `Malformed event date '${event.date}'. Use YYYY-MM-DD or standard ISO date format` });
    }

    if (event.registrationUrl && !isValidUrl(event.registrationUrl)) {
      errors.push({ entity: 'Event', id: event.id, field: 'registrationUrl', message: `Invalid registration URL '${event.registrationUrl}'` });
    }

    if (event.eventUrl && !isValidUrl(event.eventUrl)) {
      errors.push({ entity: 'Event', id: event.id, field: 'eventUrl', message: `Invalid event URL '${event.eventUrl}'` });
    }
  }

  return errors;
}

/**
 * Validates external official links.
 * Enforces that verified=true requires a valid, non-empty URL.
 */
export function validateLinks(links: OfficialLink[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenIds = new Set<string>();

  for (const link of links) {
    if (!link.id || !link.id.trim()) {
      errors.push({ entity: 'OfficialLink', field: 'id', message: 'Link is missing required ID' });
    } else if (seenIds.has(link.id)) {
      errors.push({ entity: 'OfficialLink', id: link.id, field: 'id', message: `Duplicate link ID '${link.id}'` });
    } else {
      seenIds.add(link.id);
    }

    if (!VALID_LINK_CATEGORIES.includes(link.category)) {
      errors.push({ entity: 'OfficialLink', id: link.id, field: 'category', message: `Invalid link category '${link.category}'` });
    }

    if (link.verified && (!link.url || !isValidUrl(link.url))) {
      errors.push({ entity: 'OfficialLink', id: link.id, field: 'url', message: `Verified link '${link.id}' must have a valid non-empty URL` });
    }
  }

  return errors;
}

/**
 * Validates the Research repository (labs, publications, opportunities).
 */
export function validateResearch(data: {
  labs: ResearchLab[];
  publications: ResearchPublication[];
  opportunities: ResearchOpportunity[];
}): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenLabIds = new Set<string>();
  const seenPubIds = new Set<string>();
  const seenOppIds = new Set<string>();

  for (const lab of data.labs) {
    if (!lab.id || !lab.id.trim()) {
      errors.push({ entity: 'ResearchLab', field: 'id', message: 'Research lab is missing required ID' });
    } else if (seenLabIds.has(lab.id)) {
      errors.push({ entity: 'ResearchLab', id: lab.id, field: 'id', message: `Duplicate lab ID '${lab.id}'` });
    } else {
      seenLabIds.add(lab.id);
    }
    if (!lab.name || !lab.name.trim()) {
      errors.push({ entity: 'ResearchLab', id: lab.id, field: 'name', message: 'Research lab missing name' });
    }
  }

  for (const pub of data.publications) {
    if (!pub.id || !pub.id.trim()) {
      errors.push({ entity: 'ResearchPublication', field: 'id', message: 'Publication missing required ID' });
    } else if (seenPubIds.has(pub.id)) {
      errors.push({ entity: 'ResearchPublication', id: pub.id, field: 'id', message: `Duplicate publication ID '${pub.id}'` });
    } else {
      seenPubIds.add(pub.id);
    }
    if (pub.url && !isValidUrl(pub.url)) {
      errors.push({ entity: 'ResearchPublication', id: pub.id, field: 'url', message: `Invalid publication URL '${pub.url}'` });
    }
  }

  for (const opp of data.opportunities) {
    if (!opp.id || !opp.id.trim()) {
      errors.push({ entity: 'ResearchOpportunity', field: 'id', message: 'Opportunity missing required ID' });
    } else if (seenOppIds.has(opp.id)) {
      errors.push({ entity: 'ResearchOpportunity', id: opp.id, field: 'id', message: `Duplicate opportunity ID '${opp.id}'` });
    } else {
      seenOppIds.add(opp.id);
    }
    if (!['OPEN', 'UPCOMING', 'CLOSED'].includes(opp.status)) {
      errors.push({ entity: 'ResearchOpportunity', id: opp.id, field: 'status', message: `Invalid opportunity status '${opp.status}'` });
    }
  }

  return errors;
}
