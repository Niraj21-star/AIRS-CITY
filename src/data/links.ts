export type OfficialLinkCategory =
  | 'website'
  | 'github'
  | 'linkedin'
  | 'instagram'
  | 'discord'
  | 'other';

export interface OfficialLink {
  id: string;
  label: string;
  category: OfficialLinkCategory;
  url: string;
  verified: boolean;
  status: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
  note?: string;
  verificationSource?: string;
  verifiedAt?: string;
}

/**
 * Official AIRS External Links and Channels.
 * Speculative and placeholder URLs removed per Phase 6 audit.
 * Only verified endpoints will be populated.
 */
export const officialLinks: OfficialLink[] = [
  {
    id: 'website',
    label: 'AIRS Official Portal',
    category: 'website',
    url: '',
    verified: false,
    status: 'UNVERIFIED',
    note: 'Official portal URL pending domain confirmation',
  },
  {
    id: 'github',
    label: 'AIRS GitHub Organization',
    category: 'github',
    url: '',
    verified: false,
    status: 'UNVERIFIED',
    note: 'Official organization link pending publication',
  },
  {
    id: 'linkedin',
    label: 'AIRS LinkedIn Page',
    category: 'linkedin',
    url: '',
    verified: false,
    status: 'UNVERIFIED',
    note: 'Official LinkedIn presence pending publication',
  },
  {
    id: 'instagram',
    label: 'AIRS Instagram Channel',
    category: 'instagram',
    url: '',
    verified: false,
    status: 'UNVERIFIED',
    note: 'Official Instagram presence pending publication',
  },
  {
    id: 'discord',
    label: 'AIRS Community Server',
    category: 'discord',
    url: '',
    verified: false,
    status: 'UNVERIFIED',
    note: 'Community access link pending official release',
  },
];
