# Official External Links Verification Template

This document defines the schema and verification standard for managing official AIRS public endpoints and community links (`src/data/links.ts`).

---

## 1. Allowed Platforms

Endpoints must specify one of the valid platform identifiers:

- `'website'` — Institutional portal or primary landing site
- `'github'` — Official student organization GitHub organization
- `'linkedin'` — Verified institutional LinkedIn page
- `'instagram'` — Official public media broadcast channel
- `'discord'` — Student community discussion and project server
- `'other'` — Official partners or university portals

---

## 2. Field Specifications

| Field | Type | Required? | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Yes** | Platform key (e.g., `'github'`, `'linkedin'`) |
| `label` | `string` | **Yes** | Human-readable title for UI |
| `category` | `OfficialLinkCategory` | **Yes** | One of the 6 allowed platforms |
| `url` | `string` | **Yes** | Live URL. Set to empty string `""` if unverified. |
| `verified` | `boolean` | **Yes** | `true` only if verified live and managed by AIRS |
| `status` | `string` | **Yes** | `'VERIFIED'` \| `'UNVERIFIED'` \| `'PENDING'` |
| `note` | `string` | No | Operational status note |
| `verificationSource`| `string` | No | Method of confirmation (e.g., `"Domain DNS Registry"`) |
| `verifiedAt` | `string` | No | Last verified date (`YYYY-MM-DD`) |

---

## 3. Strict Verification Rule

- **No Speculative URLs**: Never insert plausible guessed URLs (such as `https://github.com/airs-org`).
- **Unverified Default**: Any platform without an active, verified URL must have `url: ""` and `verified: false`.
- **Validation Enforcement**: The automated test suite rejects any record with `verified: true` and an empty or invalid URL.

---

## 4. Submission Template

```typescript
// Insert into officialLinks in src/data/links.ts
{
  id: "<PLATFORM_ID>",
  label: "<OFFICIAL_PLATFORM_NAME>",
  category: "<PLATFORM_CATEGORY>",
  url: "https://<OFFICIAL_AND_VERIFIED_URL>",
  verified: true,
  status: "VERIFIED",
  note: "<OPERATIONAL_NOTE>",
  verificationSource: "<OFFICIAL_VERIFICATION_SOURCE>",
  verifiedAt: "<YYYY-MM-DD>"
}
```
