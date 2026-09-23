# Research Submissions Template

This document defines the schema and submission format for populating the **AIRS Research Network** (`src/data/research.ts`).

---

## 1. Exploratory Domains vs. Verified Research Records

To protect institutional accuracy, AIRS City strictly distinguishes between:

### A. Exploratory Domains (Conceptual Framework)
The five canonical research domains defined in `districts.ts` (`Machine learning`, `Computer vision`, `Generative AI`, `Autonomous systems`, `Edge intelligence`) represent the organization's **thematic exploration horizons**. They are **not** claims of accredited university research laboratories or peer-reviewed papers.

### B. Verified Research Records (Official Submissions)
Specific laboratory facilities, research groups, published student papers, and open assistantships require verified evidence before publication.

---

## 2. Research Schemas

### Laboratory Registry (`ResearchLab`)
```typescript
interface ResearchLab {
  id: string;            // e.g. "LAB-CV-01"
  name: string;          // Official Lab Name
  domainCode: string;    // e.g. "02" (Computer Vision)
  lead?: string;         // Faculty Advisor or Student Lead
  focus: string;         // Technical research mandate
  verified?: boolean;
  verificationSource?: string;
  verifiedAt?: string;
}
```

### Peer-Reviewed / Pre-print Publications (`ResearchPublication`)
```typescript
interface ResearchPublication {
  id: string;            // e.g. "PUB-2026-01"
  title: string;         // Full paper title
  authors: string[];     // Verified student and faculty co-authors
  venue?: string;        // Conference or journal name (e.g., "CVPR 2026 Student Workshop")
  year?: number;         // e.g. 2026
  domainCode: string;    // e.g. "01"
  url?: string;          // DOI link or ArXiv URL
  verified?: boolean;
  verificationSource?: string;
  verifiedAt?: string;
}
```

### Research Opportunities & Assistantships (`ResearchOpportunity`)
```typescript
interface ResearchOpportunity {
  id: string;            // e.g. "OPP-RL-01"
  title: string;         // Project/role title
  domainCode: string;    // e.g. "03"
  eligibility: string;   // Prerequisites or student year requirements
  status: "OPEN" | "UPCOMING" | "CLOSED";
  verified?: boolean;
  verificationSource?: string;
  verifiedAt?: string;
}
```

---

## 3. Submission Template

```typescript
// Insert into airsPublications in src/data/research.ts
{
  id: "<PUB_ID>",
  title: "<VERIFIED_PAPER_TITLE>",
  authors: ["<AUTHOR_1>", "<AUTHOR_2>"],
  venue: "<CONFERENCE_OR_JOURNAL>",
  year: 2026,
  domainCode: "<DOMAIN_CODE_01_TO_05>",
  url: "https://doi.org/<DOI_IDENTIFIER>",
  verified: true,
  verificationSource: "Faculty Advisor Confirmation",
  verifiedAt: "<YYYY-MM-DD>"
}
```

*Rule: Never fabricate academic papers, preprints, or faculty affiliations. All publication submissions must resolve to an active DOI or valid preprint URL.*
