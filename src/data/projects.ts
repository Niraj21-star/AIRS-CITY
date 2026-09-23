import type { DistrictId } from './districts';

export type ProjectCategory = 'all' | 'ai-ml' | 'software' | 'robotics' | 'open-source';

export interface ProjectItem {
  id: string;
  districtId: DistrictId;
  name: string;
  category: ProjectCategory;
  shortDesc: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'IN_DEVELOPMENT' | 'VERIFIED';
  /** Full project dossier details — to be populated upon verified submission */
  problem?: string;
  solution?: string;
  technology?: string[];
  contributors?: string[];
  outcomes?: string[];
  repositoryUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  /** Optional verification metadata for internal content pipeline */
  verified?: boolean;
  verificationSource?: string;
  verifiedAt?: string;
}

export const categoryLabels: Record<ProjectCategory, string> = {
  'all':         'ALL',
  'ai-ml':       'AI / ML',
  'software':    'SOFTWARE',
  'robotics':    'ROBOTICS',
  'open-source': 'OPEN SOURCE',
};

/**
 * AIRS Projects Repository.
 * Project Garage (PG-03) is the primary home for engineering builds.
 * Provisional scaffolding records removed per Phase 6 content audit.
 * Only verified AIRS student builds will be ingested here.
 */
export const airsProjects: ProjectItem[] = [];
