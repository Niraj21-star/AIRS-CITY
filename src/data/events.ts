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
 * Currently empty pending verified event announcements.
 * Real verified events will be appended here.
 */
export const airsEvents: AirsEventItem[] = [];
