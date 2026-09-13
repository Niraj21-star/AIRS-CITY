export type DistrictId = 'hq' | 'research' | 'garage' | 'arena' | 'crew';
export type Point = { x: number; y: number };
export type District = {
  id: DistrictId;
  name: string;
  sector: string;
  number: string;
  accent: string;
  position: Point;
  category: string;
  description: string;
  objective: string;
  title: [string, string];
  mission: string;
  action: string;
};

// Provisional coordinates follow the brief. Recalibrate against the supplied master map.
export const districts: District[] = [
  { id: 'hq', name: 'AIRS HQ', sector: 'HQ-01', number: '01', accent: '#edbb77', position: { x: .51, y: .32 }, category: 'The beginning of everything', description: 'A shared home for uncommon ideas. Meet the thinking behind AIRS.', objective: 'Discover the origin of AIRS.', title: ['Every great idea', 'starts somewhere.'], mission: 'The origin', action: 'Begin mission' },
  { id: 'research', name: 'Research District', sector: 'RD-02', number: '02', accent: '#91c3e1', position: { x: .745, y: .43 }, category: 'Beyond the known', description: 'Ask better questions. Explore the frontier of artificial intelligence.', objective: 'Explore the fields of possibility.', title: ['The next question', 'changes everything.'], mission: 'Beyond the known', action: 'Explore research' },
  { id: 'garage', name: 'Project Garage', sector: 'PG-03', number: '03', accent: '#e89b70', position: { x: .28, y: .49 }, category: 'Less talk. More build.', description: 'Where unfinished ideas become working things. Get your hands on the details.', objective: 'Follow an idea from problem to prototype.', title: ['Ideas are good.', 'Working things are better.'], mission: 'Make it real', action: 'Open build log' },
  { id: 'arena', name: 'Event Arena', sector: 'EA-04', number: '04', accent: '#e9e8de', position: { x: .50, y: .64 }, category: 'Built for the moment', description: 'The meeting point for ambitious minds. Learn, compete, and create together.', objective: 'Find your next challenge.', title: ['Good things happen', 'when we show up.'], mission: 'Meet the moment', action: 'Explore the arena' },
  { id: 'crew', name: 'Crew HQ', sector: 'CQ-05', number: '05', accent: '#a9c1a2', position: { x: .73, y: .72 }, category: 'The people make the place', description: 'Different disciplines. A common curiosity. Find the people behind the possibilities.', objective: 'Find your place in the crew.', title: ['No one builds', 'the future alone.'], mission: 'Find your people', action: 'Access crew database' },
];

export const byId = Object.fromEntries(districts.map(d => [d.id, d])) as Record<DistrictId, District>;

// Editorial prototype copy, not an approved organizational manifesto.
export const originChapters = [
  { label: 'About AIRS', title: 'Curiosity is our starting point.', text: 'AIRS is a student organization for artificial intelligence and technology. A place to explore the questions that interest you, learn alongside other curious minds, and turn that learning into something real.', foot: 'A student-led world of AI & technology.' },
  { label: 'Our mission', title: 'Close the gap between what if and what works.', text: 'Learn by investigating. Build by experimenting. Share what you discover. Our proposed mission is to make ambitious technical exploration accessible, collaborative, and grounded in real problems.', foot: 'Learn deeply. Experiment openly. Build deliberately.' },
  { label: 'Our vision', title: 'Intelligence, with intention.', text: 'Imagine a community where the next breakthrough can begin with anyone. Where technical skill meets critical thinking, and the technology we create is as thoughtful as it is capable.', foot: 'Better questions. Useful technology. Shared progress.' },
  { label: 'The manifesto', title: 'Stay curious. Make something. Bring someone.', text: 'Question the obvious. Respect the evidence. Treat failure as information. Build responsibly. Document the process, not just the result. Leave the door open for the person who is just getting started.', foot: 'The city is not complete. That is the point.' },
];

export const researchDomains = [
  { code: '01', name: 'Machine learning', detail: 'From a strong baseline to a model that generalizes. Explore data quality, evaluation, and the patterns hidden in complex systems.', tools: 'Statistical learning / Neural networks / Evaluation' },
  { code: '02', name: 'Computer vision', detail: 'Teach machines to interpret the visual world. Investigate recognition, segmentation, spatial reasoning, and the limits of what a model can see.', tools: 'Image understanding / Detection / Spatial AI' },
  { code: '03', name: 'Generative AI', detail: 'Move past the prompt. Explore how models create, how retrieval grounds their answers, and how to measure whether the output is actually useful.', tools: 'Language models / Retrieval / Responsible AI' },
  { code: '04', name: 'Autonomous systems', detail: 'Connect perception to action. Investigate planning, control, and robots that can reason about uncertain environments.', tools: 'Robotics / Planning / Simulation' },
  { code: '05', name: 'Edge intelligence', detail: 'Put useful intelligence where the data happens. Explore small models, constrained hardware, privacy, and real-time inference.', tools: 'Embedded systems / Optimization / On-device AI' },
];
