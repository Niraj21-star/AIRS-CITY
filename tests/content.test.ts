import test from 'node:test';
import assert from 'node:assert/strict';
import { crewData } from '../src/data/crew.ts';
import { airsProjects } from '../src/data/projects.ts';
import { airsEvents } from '../src/data/events.ts';
import { officialLinks } from '../src/data/links.ts';
import { airsResearchDomains, airsResearchLabs, airsPublications, airsOpportunities } from '../src/data/research.ts';
import {
  validateCrew,
  validateProjects,
  validateEvents,
  validateLinks,
  validateResearch,
  VALID_PROJECT_CATEGORIES,
  VALID_EVENT_CATEGORIES,
  VALID_LINK_CATEGORIES,
  OFFICIAL_TEAM_NAMES,
  OFFICIAL_BOARD_ROLES,
} from '../src/data/validate.ts';
import { getContentStatus } from '../src/data/contentStatus.ts';
import { contentManifest, generateContentManifest } from '../src/data/contentManifest.ts';

test('content manifest reflects accurate repository state without fabricated metrics', () => {
  const manifest = generateContentManifest();
  assert.equal(manifest.crew.status, 'pending');
  assert.equal(manifest.crew.verifiedRecords, 0);
  assert.equal(manifest.crew.totalConfigured, 18);

  assert.equal(manifest.projects.status, 'pending');
  assert.equal(manifest.projects.verifiedRecords, 0);
  assert.equal(manifest.projects.totalConfigured, 0);

  assert.equal(manifest.research.status, 'partial');
  assert.equal(manifest.research.verifiedRecords, 5);

  assert.equal(manifest.events.status, 'pending');
  assert.equal(manifest.events.verifiedRecords, 0);

  assert.equal(manifest.links.status, 'pending');
  assert.equal(manifest.links.verifiedRecords, 0);
  assert.equal(manifest.links.totalConfigured, 5);
});

test('content status utility dynamically reports domain readiness signals', () => {
  const status = getContentStatus();
  assert.equal(status.crew.readiness, 'EMPTY');
  assert.equal(status.projects.readiness, 'EMPTY');
  assert.equal(status.research.readiness, 'PARTIAL');
  assert.equal(status.events.readiness, 'EMPTY');
  assert.equal(status.links.readiness, 'EMPTY');
});

test('empty datasets pass validation without throwing or creating false errors', () => {
  assert.deepEqual(validateProjects([]), []);
  assert.deepEqual(validateEvents([]), []);
  assert.deepEqual(validateLinks([]), []);
  assert.deepEqual(validateResearch({ labs: [], publications: [], opportunities: [] }), []);
});

test('current production datasets pass all validation rules with zero errors', () => {
  assert.deepEqual(validateCrew(crewData), []);
  assert.deepEqual(validateProjects(airsProjects), []);
  assert.deepEqual(validateEvents(airsEvents), []);
  assert.deepEqual(validateLinks(officialLinks), []);
  assert.deepEqual(
    validateResearch({
      labs: airsResearchLabs,
      publications: airsPublications,
      opportunities: airsOpportunities,
    }),
    []
  );
});

test('validation catches duplicate person IDs and invalid team names in crew', () => {
  const badCrew = {
    ...crewData,
    board: [
      ...crewData.board,
      { id: 'board-pres', role: 'President', level: 'board' as const },
    ],
  };
  const errors = validateCrew(badCrew);
  assert.ok(errors.some(e => e.message.includes("Duplicate person ID 'board-pres'")));

  const badTeam = {
    board: [],
    teams: [{
      id: 'fake-team',
      name: 'Unapproved Fake Team',
      members: [],
    }],
  };
  const teamErrors = validateCrew(badTeam);
  assert.ok(teamErrors.some(e => e.message.includes('does not match official team structure')));
});

test('validation enforces valid crew hierarchy levels', () => {
  const badHierarchy = {
    ...crewData,
    board: [
      { id: 'pres-1', role: 'President', level: 'lead' as any }, // board must have level 'board'
    ],
    teams: [],
  };
  const errors = validateCrew(badHierarchy);
  assert.ok(errors.some(e => e.field === 'level'));
});

test('validation enforces valid project categories and checks repository/demo URLs', () => {
  const badProjects = [
    {
      id: 'P-1',
      districtId: 'garage' as const,
      name: 'Test Project',
      category: 'crypto' as any, // invalid category
      shortDesc: 'Short desc',
      status: 'ACTIVE' as const,
      repositoryUrl: 'not-a-valid-url',
    },
  ];
  const errors = validateProjects(badProjects);
  assert.ok(errors.some(e => e.field === 'category'));
  assert.ok(errors.some(e => e.field === 'repositoryUrl'));
});

test('validation enforces that verified projects require a demo or repository URL', () => {
  const unlinkedVerified = [
    {
      id: 'P-VERIFIED-NO-URL',
      districtId: 'garage' as const,
      name: 'Verified Without Code',
      category: 'software' as const,
      shortDesc: 'A project marked verified but missing code links',
      status: 'VERIFIED' as const,
      verified: true,
    },
  ];
  const errors = validateProjects(unlinkedVerified);
  assert.ok(errors.some(e => e.field === 'verified'));
});

test('validation catches malformed event dates and invalid event categories', () => {
  const badEvent = [
    {
      id: 'EV-1',
      title: 'Bad Date Event',
      category: 'unapproved-category' as any,
      date: 'sometime-next-spring', // malformed date
      description: 'An event with a non-standard date format',
    },
  ];
  const errors = validateEvents(badEvent);
  assert.ok(errors.some(e => e.field === 'category'));
  assert.ok(errors.some(e => e.field === 'date'));

  const goodEvent = [
    {
      id: 'EV-VALID',
      title: 'Valid Scheduled Event',
      category: 'hackathons' as const,
      date: '2026-11-20',
      description: 'A properly formatted event date',
      registrationUrl: 'https://airs.org/rsvp',
    },
  ];
  assert.deepEqual(validateEvents(goodEvent), []);
});

test('validation catches verified links with empty or malformed URLs', () => {
  const badLink = [
    {
      id: 'github',
      label: 'GitHub',
      category: 'github' as const,
      url: '',
      verified: true, // cannot be true with empty url
      status: 'VERIFIED' as const,
    },
  ];
  const errors = validateLinks(badLink);
  assert.ok(errors.some(e => e.field === 'url'));

  const goodLink = [
    {
      id: 'github',
      label: 'GitHub',
      category: 'github' as const,
      url: 'https://github.com/airs-org',
      verified: true,
      status: 'VERIFIED' as const,
    },
  ];
  assert.deepEqual(validateLinks(goodLink), []);
});

test('validation checks research labs, publications, and opportunities', () => {
  const badResearch = {
    labs: [
      { id: 'LAB-1', name: '', domainCode: '01', focus: 'Missing name' },
      { id: 'LAB-1', name: 'Duplicate ID Lab', domainCode: '02', focus: 'Duplicate' },
    ],
    publications: [
      { id: 'PUB-1', title: 'Paper Title', authors: ['A'], domainCode: '01', url: 'invalid-url' },
    ],
    opportunities: [
      { id: 'OPP-1', title: 'Opp Title', domainCode: '01', eligibility: 'All', status: 'UNKNOWN_STATUS' as any },
    ],
  };
  const errors = validateResearch(badResearch);
  assert.ok(errors.some(e => e.entity === 'ResearchLab' && e.field === 'name'));
  assert.ok(errors.some(e => e.entity === 'ResearchLab' && e.message.includes('Duplicate lab ID')));
  assert.ok(errors.some(e => e.entity === 'ResearchPublication' && e.field === 'url'));
  assert.ok(errors.some(e => e.entity === 'ResearchOpportunity' && e.field === 'status'));
});
