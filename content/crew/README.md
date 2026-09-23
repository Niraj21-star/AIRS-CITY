# Crew Roster Ingestion Template

This document defines the schema and submission format for populating the **AIRS Crew Directory** (`src/data/crew.ts`).

---

## 1. Official Organizational Structure

AIRS operates with a fixed, verified organizational hierarchy:

### Executive Council (Board of Directors)
- **President**
- **Vice President**
- **Secretary**
- **Treasurer**

### The 7 Departmental Teams
1. **Event Management Team**
2. **Marketing Team**
3. **PR (Public Relations) Team**
4. **Cultural Team**
5. **Tech Team**
6. **Design Team**
7. **Media Team**

Each team consists of:
- **1 Team Lead** (`level: 'lead'`)
- **1 Co-Lead** (`level: 'colead'`)
- **Members** (`level: 'member'`)

---

## 2. Field Specifications

| Field | Type | Required? | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Yes** | Unique identifier (e.g., `board-pres`, `tech-lead`, `mkt-member-01`) |
| `name` | `string` | No | Real full name of the student. Leave undefined if pending verification. |
| `role` | `string` | **Yes** | Official role title (e.g., `President`, `Team Lead`, `Core Member`) |
| `team` | `string` | No | Department or body name (e.g., `Board of Directors`, `Tech Team`) |
| `level` | `CrewHierarchyLevel` | **Yes** | Exactly one of: `'board'`, `'lead'`, `'colead'`, `'member'` |
| `bio` | `string` | No | 1-2 sentence biographical summary |
| `responsibilities` | `string` | No | Specific role mandate and operational responsibilities |
| `expertise` | `string[]` | No | List of functional tags (e.g., `['React', 'Machine Learning']`) |
| `projects` | `string[]` | No | Associated AIRS project IDs |
| `photo` | `string` | No | Relative path or URL to an approved headshot |
| `links` | `Array<{ label, url }>` | No | Valid personal profile links (GitHub, LinkedIn, Portfolio) |
| `verified` | `boolean` | No | Set to `true` once verified by the executive board |
| `verificationSource` | `string` | No | Audit reference (e.g., `"2026-2027 Election Minutes"`) |
| `verifiedAt` | `string` | No | Verification date (`YYYY-MM-DD`) |

*Rule: Empty or undefined optional fields are completely valid. Do NOT invent filler data; missing fields trigger intentional `DATA PENDING` status.*

---

## 3. Submission Template

```typescript
// Example: Board of Directors Entry
{
  id: "board-pres",
  role: "President",
  level: "board",
  team: "Board of Directors",
  name: "<VERIFIED_STUDENT_NAME>",
  bio: "<APPROVED_EXECUTIVE_BIO>",
  responsibilities: "Leads strategic vision, institutional partnerships, and executive council alignment.",
  expertise: ["Strategic Governance", "Community Stewardship"],
  links: [
    { label: "LinkedIn", url: "https://linkedin.com/in/<HANDLE>" },
    { label: "GitHub", url: "https://github.com/<HANDLE>" }
  ],
  verified: true,
  verificationSource: "Approved Executive Council Minutes",
  verifiedAt: "2026-09-23"
}

// Example: Department Lead Entry
{
  id: "tech-lead",
  role: "Team Lead",
  level: "lead",
  team: "Tech Team",
  name: "<VERIFIED_STUDENT_NAME>",
  bio: "<APPROVED_LEAD_BIO>",
  responsibilities: "Architects software infrastructure and oversees technical builds.",
  expertise: ["TypeScript", "Distributed Systems", "Cloud Infrastructure"],
  links: [
    { label: "GitHub", url: "https://github.com/<HANDLE>" }
  ],
  verified: true,
  verificationSource: "Department Roster Submission",
  verifiedAt: "2026-09-23"
}
```

---

## 4. Ingestion Steps

1. Fill out official records into `src/data/crew.ts`.
2. Run `npm test` to verify no duplicate IDs, invalid roles, or malformed URLs.
3. Verify that all 7 teams match exact naming rules.
