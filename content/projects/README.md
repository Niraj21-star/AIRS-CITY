# Projects Submission Template

This document defines the schema and submission format for ingesting student engineering builds into **Project Garage** (`src/data/projects.ts`).

---

## 1. Valid Categories

Projects must specify one of the valid categories from `ProjectCategory`:

- `'ai-ml'` — Machine learning models, pipelines, and evaluation runs
- `'software'` — Web platforms, desktop tools, and infrastructure
- `'robotics'` — Autonomous hardware, microcontrollers, and kinematics
- `'open-source'` — Public libraries, developer tooling, and community frameworks

---

## 2. Associated District IDs

Every build is canonically affiliated with an AIRS City district via `districtId`:

- `'garage'` — Project Garage (PG-03) (Primary software/hardware builds)
- `'research'` — Research District (RD-02) (Experimental and frontier implementations)
- `'arena'` — Event Arena (EA-04) (Hackathon or event engineering)
- `'hq'` — AIRS HQ (HQ-01) (Core organizational platforms)
- `'crew'` — Crew HQ (CQ-05) (Internal community tools)

---

## 3. Field Specifications

| Field | Type | Required? | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Yes** | Unique project identifier (e.g., `PG-SW-01`) |
| `name` | `string` | **Yes** | Official title of the project |
| `category` | `ProjectCategory` | **Yes** | One of: `'ai-ml'`, `'software'`, `'robotics'`, `'open-source'` |
| `districtId` | `DistrictId` | **Yes** | One of: `'garage'`, `'research'`, `'arena'`, `'hq'`, `'crew'` |
| `shortDesc` | `string` | **Yes** | 1-2 sentence executive summary |
| `status` | `string` | **Yes** | `'ACTIVE'` \| `'IN_DEVELOPMENT'` \| `'VERIFIED'` \| `'ARCHIVED'` |
| `problem` | `string` | No | What specific problem or limitation does this solve? |
| `solution` | `string` | No | What did the team build and how does it work? |
| `technology` | `string[]` | No | Tech stack list (e.g., `['Python', 'PyTorch', 'FastAPI']`) |
| `contributors` | `string[]` | No | List of student contributor names or roster IDs |
| `outcomes` | `string[]` | No | Measured results, benchmarks, or milestones |
| `repositoryUrl` | `string` | No | Official public GitHub or GitLab repository link |
| `demoUrl` | `string` | No | Live web deployment or interactive demonstration link |
| `imageUrl` | `string` | No | Relative path or URL to project architecture screenshot |
| `verified` | `boolean` | No | Set to `true` once reviewed by the Project Lead |
| `verificationSource`| `string` | No | Review reference (e.g., `"Project Showcase Evaluation"`) |
| `verifiedAt` | `string` | No | Verification date (`YYYY-MM-DD`) |

---

## 4. Submission Template

```typescript
// Insert into airsProjects in src/data/projects.ts
{
  id: "<PROJECT_ID>",
  districtId: "<DISTRICT_ID>",
  name: "<PROJECT_NAME>",
  category: "<PROJECT_CATEGORY>",
  shortDesc: "<ONE_SENTENCE_EXECUTIVE_SUMMARY>",
  status: "ACTIVE",
  problem: "<DESCRIPTION_OF_PROBLEM_ADDRESSED>",
  solution: "<TECHNICAL_SOLUTION_OVERVIEW>",
  technology: ["<TOOL_1>", "<TOOL_2>", "<TOOL_3>"],
  contributors: ["<CONTRIBUTOR_A>", "<CONTRIBUTOR_B>"],
  outcomes: ["<OUTCOME_1>", "<OUTCOME_2>"],
  repositoryUrl: "https://github.com/AIRS-Student-Organization/<REPO_NAME>",
  demoUrl: "https://<PROJECT_SUBDOMAIN>.airs.org",
  verified: true,
  verificationSource: "<OFFICIAL_REVIEW_DOCUMENT>",
  verifiedAt: "<YYYY-MM-DD>"
}
```

*Rule: If a project is only partially documented, leave optional fields undefined. Missing fields will render honest empty slots in the project dossier.*
