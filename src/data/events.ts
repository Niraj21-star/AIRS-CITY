export type EventCategory = 'upcoming' | 'hackathons' | 'workshops' | 'talks' | 'competitions' | 'past';

export interface AirsEventItem {
  id: string;
  title: string;
  category: EventCategory;
  date?: string;
  time?: string;
  location?: string;
  venue?: string;
  description: string;
  registrationUrl?: string;
  eventUrl?: string;
  recapUrl?: string;
  image?: string;
  status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  tags?: string[];
  /** Optional verification metadata for internal content pipeline */
  verified?: boolean;
  verificationSource?: string;
  verifiedAt?: string;
}

/**
 * AIRS Events Repository.
 * Event Arena (EA-04) is the hub for hackathons, workshops, and competitions.
 */
export const airsEvents: AirsEventItem[] = [
  {
    id: 'vortexa-3-0',
    title: 'VORTEXA 3.0 — 12-Hour Hackathon',
    category: 'upcoming',
    date: '11–12 October 2026',
    time: '9 AM Onwards',
    venue: 'Dr. D. Y. Patil Institute of Technology, Pimpri, Pune',
    description: '12-Hour Hackathon. Domains: AI/ML, Web & App, Sustainable Tech, Open Innovation. Team Size 2-4 members. Prize pool up to ₹1,00,000*. Technology Sponsor: ElevenLabs (1 month FREE ElevenLabs Creator access for all participants! Overall Winning Team: 3 months Pro for each team member). Meals included. Early Bird fee: ₹500/team.',
    registrationUrl: 'https://campusmeet.in/user/user_event-details.php?id=166',
    status: 'UPCOMING',
    tags: ['Hackathon', 'AI/ML', 'Web & App', 'ElevenLabs'],
    verified: true,
  }
];
