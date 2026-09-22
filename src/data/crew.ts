export type CrewHierarchyLevel = 'board' | 'lead' | 'colead' | 'member';

export interface Person {
  id: string;
  name?: string;
  role: string;
  team?: string;
  bio?: string;
  responsibilities?: string;
  expertise?: string[];
  projects?: string[];
  links?: { label: string; url: string }[];
  photo?: string;
  level: CrewHierarchyLevel;
}

export interface Team {
  id: string;
  name: string;
  code?: string;
  category?: string;
  focus?: string;
  competencies?: string[];
  lead?: Person;
  coLead?: Person;
  members: Person[];
}

export interface CrewData {
  board: Person[];
  teams: Team[];
}

export interface CrewDatabaseEntity {
  id: string;
  number: string;
  name: string;
  code: string;
  category: string;
  focus: string;
  competencies: string[];
  roles: Person[];
}

export const crewData: CrewData = {
  board: [
    {
      id: 'board-pres',
      role: 'President',
      level: 'board',
      team: 'Board of Directors',
      responsibilities: 'Leads the overarching strategic vision of AIRS, institutional representation, executive alignment, and major community partnerships.',
      expertise: ['Strategic Governance', 'Institutional Representation', 'Executive Alignment', 'Community Stewardship']
    },
    {
      id: 'board-vp',
      role: 'Vice President',
      level: 'board',
      team: 'Board of Directors',
      responsibilities: 'Directs cross-team operations, monitors initiative execution, oversees inter-departmental workflows, and deputizes executive steering.',
      expertise: ['Operations Management', 'Cross-Team Coordination', 'Program Execution', 'Strategic Roadmaps']
    },
    {
      id: 'board-sec',
      role: 'Secretary',
      level: 'board',
      team: 'Board of Directors',
      responsibilities: 'Maintains official organizational documentation, institutional correspondence, meeting proceedings, and governance compliance.',
      expertise: ['Governance Documentation', 'Meeting Proceedings', 'Policy Administration', 'Institutional Records']
    },
    {
      id: 'board-tres',
      role: 'Treasurer',
      level: 'board',
      team: 'Board of Directors',
      responsibilities: 'Manages financial stewardship, annual budget allocations, event expenditure authorizations, and sponsorship accounting.',
      expertise: ['Financial Stewardship', 'Budget Allocation', 'Sponsorship Management', 'Fiscal Auditing']
    },
  ],
  teams: [
    {
      id: 'team-event',
      name: 'Event Management Team',
      code: 'EVNT',
      category: 'Operations & Stage Production',
      focus: 'End-to-end planning, stagecraft, venue logistics, guest coordination, and seamless event execution across AIRS summits, hackathons, and gatherings.',
      competencies: ['Logistics Planning', 'Venue Operations', 'Stage Production', 'Speaker Liaison', 'Timeline Execution'],
      lead: {
        id: 'event-lead',
        role: 'Team Lead',
        level: 'lead',
        team: 'Event Management',
        responsibilities: 'Heads event production roadmaps, orchestrates cross-functional event runbooks, and manages master timelines.',
        expertise: ['Production Roadmaps', 'Master Scheduling', 'Runbook Design', 'Cross-Team Sync']
      },
      coLead: {
        id: 'event-colead',
        role: 'Co-Lead',
        level: 'colead',
        team: 'Event Management',
        responsibilities: 'Assists in day-of-event coordination, volunteer operations, vendor logistics, and emergency contingencies.',
        expertise: ['Day-of Operations', 'Volunteer Dispatch', 'Logistical Coordination', 'Floor Management']
      },
      members: []
    },
    {
      id: 'team-marketing',
      name: 'Marketing Team',
      code: 'MKTG',
      category: 'Brand & Growth',
      focus: 'Brand storytelling, digital campaign management, student community engagement, and audience reach across campus and digital platforms.',
      competencies: ['Campaign Strategy', 'Audience Reach', 'Social Growth', 'Content Distribution', 'Analytics & Insights'],
      lead: {
        id: 'marketing-lead',
        role: 'Team Lead',
        level: 'lead',
        team: 'Marketing',
        responsibilities: 'Steers marketing strategies, campaign timelines, digital engagement metrics, and community awareness drives.',
        expertise: ['Campaign Strategy', 'Audience Growth', 'Multi-Channel Strategy', 'Brand Reach']
      },
      coLead: {
        id: 'marketing-colead',
        role: 'Co-Lead',
        level: 'colead',
        team: 'Marketing',
        responsibilities: 'Coordinates content distribution schedules, copy editing, analytics tracking, and promotional channel sync.',
        expertise: ['Content Scheduling', 'Editorial Sync', 'Engagement Analytics', 'Promotional Campaigns']
      },
      members: []
    },
    {
      id: 'team-pr',
      name: 'PR (Public Relations) Team',
      code: 'PR',
      category: 'Institutional Liaison',
      focus: 'Institutional communication, industry relations, university department liaisons, media press releases, and partner sponsorships.',
      competencies: ['Institutional Relations', 'Press Releases', 'Sponsor Communication', 'Campus Liaison', 'Public Representation'],
      lead: {
        id: 'pr-lead',
        role: 'Team Lead',
        level: 'lead',
        team: 'PR (Public Relations)',
        responsibilities: 'Leads external partnerships, institutional liaison channels, sponsor onboarding, and press releases.',
        expertise: ['External Partnerships', 'Institutional Liaison', 'Sponsorship Management', 'Public Communications']
      },
      coLead: {
        id: 'pr-colead',
        role: 'Co-Lead',
        level: 'colead',
        team: 'PR (Public Relations)',
        responsibilities: 'Facilitates partner communication, sponsorship follow-ups, and official guest correspondence.',
        expertise: ['Partner Engagement', 'Guest Protocol', 'Sponsorship Follow-up', 'Communications Flow']
      },
      members: []
    },
    {
      id: 'team-cultural',
      name: 'Cultural Team',
      code: 'CLTR',
      category: 'Experience & Community Culture',
      focus: 'Fostering an inclusive, vibrant student community through social initiatives, cultural celebrations, creative activities, and team bonding.',
      competencies: ['Community Building', 'Cultural Events', 'Member Well-being', 'Creative Formats', 'Camaraderie'],
      lead: {
        id: 'cultural-lead',
        role: 'Team Lead',
        level: 'lead',
        team: 'Cultural',
        responsibilities: 'Curates cultural initiatives, member bonding traditions, community engagement formats, and creative gatherings.',
        expertise: ['Cultural Direction', 'Community Experience', 'Tradition Building', 'Member Engagement']
      },
      coLead: {
        id: 'cultural-colead',
        role: 'Co-Lead',
        level: 'colead',
        team: 'Cultural',
        responsibilities: 'Coordinates creative performances, interactive icebreakers, cultural decor, and team activities.',
        expertise: ['Activity Coordination', 'Creative Programming', 'Event Icebreakers', 'Community Cohesion']
      },
      members: []
    },
    {
      id: 'team-tech',
      name: 'Tech Team',
      code: 'TECH',
      category: 'Systems & Engineering',
      focus: 'Developing digital platforms, interactive web experiences, AI/ML prototypes, hackathon infrastructure, and technical workshop curricula.',
      competencies: ['Web Platforms', 'System Architecture', 'AI/ML Engineering', 'Infrastructure & Cloud', 'Developer Tooling'],
      lead: {
        id: 'tech-lead',
        role: 'Team Lead',
        level: 'lead',
        team: 'Tech',
        responsibilities: 'Architects technical systems, manages codebases, guides project tech stacks, and oversees engineering initiatives.',
        expertise: ['Technical Architecture', 'Codebase Management', 'System Scalability', 'Engineering Leadership']
      },
      coLead: {
        id: 'tech-colead',
        role: 'Co-Lead',
        level: 'colead',
        team: 'Tech',
        responsibilities: 'Coordinates code reviews, development sprints, deployment pipelines, and hackathon technical setups.',
        expertise: ['Sprint Coordination', 'CI/CD Pipelines', 'Code Quality', 'Technical Workflows']
      },
      members: []
    },
    {
      id: 'team-design',
      name: 'Design Team',
      code: 'DSGN',
      category: 'Visual & Experience Systems',
      focus: 'Crafting brand identity, UI/UX interaction design, event visual packages, digital posters, merchandise, and motion graphic assets.',
      competencies: ['Visual Identity', 'UI/UX Design', 'Brand Systems', 'Motion Graphics', 'Print & Merch'],
      lead: {
        id: 'design-lead',
        role: 'Team Lead',
        level: 'lead',
        team: 'Design',
        responsibilities: 'Maintains brand guidelines, oversees visual quality across all deliverables, and directs UI/UX systems.',
        expertise: ['Creative Direction', 'Brand Guidelines', 'UI/UX Architecture', 'Visual Quality Control']
      },
      coLead: {
        id: 'design-colead',
        role: 'Co-Lead',
        level: 'colead',
        team: 'Design',
        responsibilities: 'Manages design sprint queues, asset reviews, design system tokens, and collateral exports.',
        expertise: ['Design Systems', 'Asset Pipelines', 'Sprint Management', 'Typography & Tokens']
      },
      members: []
    },
    {
      id: 'team-media',
      name: 'Media Team',
      code: 'MDIA',
      category: 'Production & Visual Storytelling',
      focus: 'Capturing the life of AIRS through cinematic video production, event photography, highlight reels, podcasts, and digital media archives.',
      competencies: ['Cinematography', 'Event Photography', 'Video Editing', 'Audio/Podcast Production', 'Visual Archival'],
      lead: {
        id: 'media-lead',
        role: 'Team Lead',
        level: 'lead',
        team: 'Media',
        responsibilities: 'Directs media coverage plans, video editing pipelines, brand aesthetics for video, and archive integrity.',
        expertise: ['Visual Storytelling', 'Cinematography Direction', 'Production Pipelines', 'Archive Management']
      },
      coLead: {
        id: 'media-colead',
        role: 'Co-Lead',
        level: 'colead',
        team: 'Media',
        responsibilities: 'Coordinates shoot schedules, equipment readiness, camera crew assignments, and post-production timelines.',
        expertise: ['Production Scheduling', 'Equipment Management', 'Post-Production Sync', 'Shoot Direction']
      },
      members: []
    }
  ]
};

export const crewDatabaseEntities: CrewDatabaseEntity[] = [
  {
    id: 'entity-bod',
    number: '01',
    name: 'Board of Directors',
    code: 'BOD',
    category: 'Executive Governance',
    focus: 'Executive governance, strategic steering, institutional alignment, and cross-functional leadership of AIRS.',
    competencies: ['Executive Governance', 'Strategic Direction', 'Institutional Oversight', 'Fiscal Integrity', 'Policy Administration'],
    roles: [
      {
        id: 'board-pres',
        role: 'President',
        level: 'board',
        team: 'Board of Directors',
        responsibilities: 'Leads the overarching strategic vision of AIRS, institutional representation, executive alignment, and major community partnerships.',
        expertise: ['Strategic Governance', 'Institutional Representation', 'Executive Alignment', 'Community Stewardship']
      },
      {
        id: 'board-vp',
        role: 'Vice President',
        level: 'board',
        team: 'Board of Directors',
        responsibilities: 'Directs cross-team operations, monitors initiative execution, oversees inter-departmental workflows, and deputizes executive steering.',
        expertise: ['Operations Management', 'Cross-Team Coordination', 'Program Execution', 'Strategic Roadmaps']
      },
      {
        id: 'board-sec',
        role: 'Secretary',
        level: 'board',
        team: 'Board of Directors',
        responsibilities: 'Maintains official organizational documentation, institutional correspondence, meeting proceedings, and governance compliance.',
        expertise: ['Governance Documentation', 'Meeting Proceedings', 'Policy Administration', 'Institutional Records']
      },
      {
        id: 'board-tres',
        role: 'Treasurer',
        level: 'board',
        team: 'Board of Directors',
        responsibilities: 'Manages financial stewardship, annual budget allocations, event expenditure authorizations, and sponsorship accounting.',
        expertise: ['Financial Stewardship', 'Budget Allocation', 'Sponsorship Management', 'Fiscal Auditing']
      }
    ]
  },
  {
    id: 'team-event',
    number: '02',
    name: 'Event Management Team',
    code: 'EVNT',
    category: 'Operations & Stage Production',
    focus: 'End-to-end planning, stagecraft, venue logistics, guest coordination, and seamless event execution across AIRS summits, hackathons, and gatherings.',
    competencies: ['Logistics Planning', 'Venue Operations', 'Stage Production', 'Speaker Liaison', 'Timeline Execution'],
    roles: [
      {
        id: 'event-lead',
        role: 'Team Lead',
        level: 'lead',
        team: 'Event Management',
        responsibilities: 'Heads event production roadmaps, orchestrates cross-functional event runbooks, and manages master timelines.',
        expertise: ['Production Roadmaps', 'Master Scheduling', 'Runbook Design', 'Cross-Team Sync']
      },
      {
        id: 'event-colead',
        role: 'Co-Lead',
        level: 'colead',
        team: 'Event Management',
        responsibilities: 'Assists in day-of-event coordination, volunteer operations, vendor logistics, and emergency contingencies.',
        expertise: ['Day-of Operations', 'Volunteer Dispatch', 'Logistical Coordination', 'Floor Management']
      },
      {
        id: 'event-member',
        role: 'Members',
        level: 'member',
        team: 'Event Management',
        responsibilities: 'Executes ground logistics, attendee check-in, stage audio/visual cues, and operational support during activations.',
        expertise: ['Ground Execution', 'Attendee Hospitality', 'Stage Support', 'Site Logistics']
      }
    ]
  },
  {
    id: 'team-marketing',
    number: '03',
    name: 'Marketing Team',
    code: 'MKTG',
    category: 'Brand & Growth',
    focus: 'Brand storytelling, digital campaign management, student community engagement, and audience reach across campus and digital platforms.',
    competencies: ['Campaign Strategy', 'Audience Reach', 'Social Growth', 'Content Distribution', 'Analytics & Insights'],
    roles: [
      {
        id: 'marketing-lead',
        role: 'Team Lead',
        level: 'lead',
        team: 'Marketing',
        responsibilities: 'Steers marketing strategies, campaign timelines, digital engagement metrics, and community awareness drives.',
        expertise: ['Campaign Strategy', 'Audience Growth', 'Multi-Channel Strategy', 'Brand Reach']
      },
      {
        id: 'marketing-colead',
        role: 'Co-Lead',
        level: 'colead',
        team: 'Marketing',
        responsibilities: 'Coordinates content distribution schedules, copy editing, analytics tracking, and promotional channel sync.',
        expertise: ['Content Scheduling', 'Editorial Sync', 'Engagement Analytics', 'Promotional Campaigns']
      },
      {
        id: 'marketing-member',
        role: 'Members',
        level: 'member',
        team: 'Marketing',
        responsibilities: 'Conducts campus outreach, drives grassroots participation, and manages community engagement.',
        expertise: ['Campus Outreach', 'Community Engagement', 'Social Distribution', 'Student Networks']
      }
    ]
  },
  {
    id: 'team-pr',
    number: '04',
    name: 'PR (Public Relations) Team',
    code: 'PR',
    category: 'Institutional Liaison',
    focus: 'Institutional communication, industry relations, university department liaisons, media press releases, and partner sponsorships.',
    competencies: ['Institutional Relations', 'Press Releases', 'Sponsor Communication', 'Campus Liaison', 'Public Representation'],
    roles: [
      {
        id: 'pr-lead',
        role: 'Team Lead',
        level: 'lead',
        team: 'PR (Public Relations)',
        responsibilities: 'Leads external partnerships, institutional liaison channels, sponsor onboarding, and press releases.',
        expertise: ['External Partnerships', 'Institutional Liaison', 'Sponsorship Management', 'Public Communications']
      },
      {
        id: 'pr-colead',
        role: 'Co-Lead',
        level: 'colead',
        team: 'PR (Public Relations)',
        responsibilities: 'Facilitates partner communication, sponsorship follow-ups, and official guest correspondence.',
        expertise: ['Partner Engagement', 'Guest Protocol', 'Sponsorship Follow-up', 'Communications Flow']
      },
      {
        id: 'pr-member',
        role: 'Members',
        level: 'member',
        team: 'PR (Public Relations)',
        responsibilities: 'Supports outreach communications, institutional inquiries, and partner hospitality.',
        expertise: ['Outreach Support', 'Communication Drafts', 'Liaison Assistance', 'Partner Hosting']
      }
    ]
  },
  {
    id: 'team-cultural',
    number: '05',
    name: 'Cultural Team',
    code: 'CLTR',
    category: 'Experience & Community Culture',
    focus: 'Fostering an inclusive, vibrant student community through social initiatives, cultural celebrations, creative activities, and team bonding.',
    competencies: ['Community Building', 'Cultural Events', 'Member Well-being', 'Creative Formats', 'Camaraderie'],
    roles: [
      {
        id: 'cultural-lead',
        role: 'Team Lead',
        level: 'lead',
        team: 'Cultural',
        responsibilities: 'Curates cultural initiatives, member bonding traditions, community engagement formats, and creative gatherings.',
        expertise: ['Cultural Direction', 'Community Experience', 'Tradition Building', 'Member Engagement']
      },
      {
        id: 'cultural-colead',
        role: 'Co-Lead',
        level: 'colead',
        team: 'Cultural',
        responsibilities: 'Coordinates creative performances, interactive icebreakers, cultural decor, and team activities.',
        expertise: ['Activity Coordination', 'Creative Programming', 'Event Icebreakers', 'Community Cohesion']
      },
      {
        id: 'cultural-member',
        role: 'Members',
        level: 'member',
        team: 'Cultural',
        responsibilities: 'Facilitates community sessions, creative showcases, and peer networking activities.',
        expertise: ['Event Facilitation', 'Creative Collaboration', 'Social Hosting', 'Member Support']
      }
    ]
  },
  {
    id: 'team-tech',
    number: '06',
    name: 'Tech Team',
    code: 'TECH',
    category: 'Systems & Engineering',
    focus: 'Developing digital platforms, interactive web experiences, AI/ML prototypes, hackathon infrastructure, and technical workshop curricula.',
    competencies: ['Web Platforms', 'System Architecture', 'AI/ML Engineering', 'Infrastructure & Cloud', 'Developer Tooling'],
    roles: [
      {
        id: 'tech-lead',
        role: 'Team Lead',
        level: 'lead',
        team: 'Tech',
        responsibilities: 'Architects technical systems, manages codebases, guides project tech stacks, and oversees engineering initiatives.',
        expertise: ['Technical Architecture', 'Codebase Management', 'System Scalability', 'Engineering Leadership']
      },
      {
        id: 'tech-colead',
        role: 'Co-Lead',
        level: 'colead',
        team: 'Tech',
        responsibilities: 'Coordinates code reviews, development sprints, deployment pipelines, and hackathon technical setups.',
        expertise: ['Sprint Coordination', 'CI/CD Pipelines', 'Code Quality', 'Technical Workflows']
      },
      {
        id: 'tech-member',
        role: 'Members',
        level: 'member',
        team: 'Tech',
        responsibilities: 'Develops web and software features, implements algorithms, and contributes to open-source prototypes.',
        expertise: ['Full-Stack Development', 'Algorithm Implementation', 'Frontend & Backend', 'Open Source Contrib']
      }
    ]
  },
  {
    id: 'team-design',
    number: '07',
    name: 'Design Team',
    code: 'DSGN',
    category: 'Visual & Experience Systems',
    focus: 'Crafting brand identity, UI/UX interaction design, event visual packages, digital posters, merchandise, and motion graphic assets.',
    competencies: ['Visual Identity', 'UI/UX Design', 'Brand Systems', 'Motion Graphics', 'Print & Merch'],
    roles: [
      {
        id: 'design-lead',
        role: 'Team Lead',
        level: 'lead',
        team: 'Design',
        responsibilities: 'Maintains brand guidelines, oversees visual quality across all deliverables, and directs UI/UX systems.',
        expertise: ['Creative Direction', 'Brand Guidelines', 'UI/UX Architecture', 'Visual Quality Control']
      },
      {
        id: 'design-colead',
        role: 'Co-Lead',
        level: 'colead',
        team: 'Design',
        responsibilities: 'Manages design sprint queues, asset reviews, design system tokens, and collateral exports.',
        expertise: ['Design Systems', 'Asset Pipelines', 'Sprint Management', 'Typography & Tokens']
      },
      {
        id: 'design-member',
        role: 'Members',
        level: 'member',
        team: 'Design',
        responsibilities: 'Designs banners, user interfaces, social media graphics, iconography, and event promotional kits.',
        expertise: ['UI Components', 'Vector Graphics', 'Social Creatives', 'Visual Layouts']
      }
    ]
  },
  {
    id: 'team-media',
    number: '08',
    name: 'Media Team',
    code: 'MDIA',
    category: 'Production & Visual Storytelling',
    focus: 'Capturing the life of AIRS through cinematic video production, event photography, highlight reels, podcasts, and digital media archives.',
    competencies: ['Cinematography', 'Event Photography', 'Video Editing', 'Audio/Podcast Production', 'Visual Archival'],
    roles: [
      {
        id: 'media-lead',
        role: 'Team Lead',
        level: 'lead',
        team: 'Media',
        responsibilities: 'Directs media coverage plans, video editing pipelines, brand aesthetics for video, and archive integrity.',
        expertise: ['Visual Storytelling', 'Cinematography Direction', 'Production Pipelines', 'Archive Management']
      },
      {
        id: 'media-colead',
        role: 'Co-Lead',
        level: 'colead',
        team: 'Media',
        responsibilities: 'Coordinates shoot schedules, equipment readiness, camera crew assignments, and post-production timelines.',
        expertise: ['Production Scheduling', 'Equipment Management', 'Post-Production Sync', 'Shoot Direction']
      },
      {
        id: 'media-member',
        role: 'Members',
        level: 'member',
        team: 'Media',
        responsibilities: 'Operates cameras during events, captures candid moments, edits social snippets, and archives raw footage.',
        expertise: ['Camera Operation', 'Event Photography', 'Video Editing', 'Footage Ingestion']
      }
    ]
  }
];
