import { researchDomains } from './districts.ts';

export interface ResearchDomain {
  code: string;
  name: string;
  detail: string;
  tools: string;
}

export interface ResearchLab {
  id: string;
  name: string;
  domainCode: string;
  lead?: string;
  focus: string;
  verified?: boolean;
  verificationSource?: string;
  verifiedAt?: string;
}

export interface ResearchPublication {
  id: string;
  title: string;
  authors: string[];
  venue?: string;
  year?: number;
  domainCode: string;
  url?: string;
  verified?: boolean;
  verificationSource?: string;
  verifiedAt?: string;
}

export interface ResearchOpportunity {
  id: string;
  title: string;
  domainCode: string;
  eligibility: string;
  status: 'OPEN' | 'UPCOMING' | 'CLOSED';
  verified?: boolean;
  verificationSource?: string;
  verifiedAt?: string;
}

/**
 * AIRS Research Network Repository.
 * Research District (RD-02) represents exploratory frontier domains.
 */
export const airsResearchDomains: ResearchDomain[] = researchDomains;
export const airsResearchLabs: ResearchLab[] = [];
export const airsPublications: ResearchPublication[] = [];
export const airsOpportunities: ResearchOpportunity[] = [];
