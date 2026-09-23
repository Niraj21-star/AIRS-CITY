# Events Submission Template

This document defines the schema and submission format for populating the **AIRS Event Calendar & Archive** (`src/data/events.ts`).

---

## 1. Valid Categories

Events must specify one of the valid categories from `EventCategory`:

- `'upcoming'` — Scheduled future gathering or initiative
- `'hackathons'` — Multi-hour or multi-day competitive building events
- `'workshops'` — Practical hands-on technical instruction sessions
- `'talks'` — Guest speaker, faculty, or student presentation sessions
- `'competitions'` — Contests, algorithmic challenges, and tournaments
- `'past'` — Concluded gatherings archived with recaps

---

## 2. Field Specifications

| Field | Type | Required? | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Yes** | Unique event identifier (e.g., `EV-2026-HACK-01`) |
| `title` | `string` | **Yes** | Official event title |
| `category` | `EventCategory` | **Yes** | One of the 6 valid event categories |
| `date` | `string` | No | Event date in `YYYY-MM-DD` format |
| `time` | `string` | No | Start/end times (e.g., `"14:00 - 17:00 EST"`) |
| `venue` | `string` | No | Physical campus hall or virtual platform |
| `location` | `string` | No | City or regional campus location |
| `description` | `string` | **Yes** | Detailed event description and agenda outline |
| `registrationUrl`| `string` | No | Valid URL to official RSVP form or ticketing system |
| `eventUrl` | `string` | No | Official landing page or external link |
| `recapUrl` | `string` | No | Post-event wrap-up, photos, or recording URL |
| `image` | `string` | No | Relative path or URL to approved event promotional graphic |
| `status` | `string` | No | `'UPCOMING'` \| `'ACTIVE'` \| `'COMPLETED'` \| `'CANCELLED'` |
| `tags` | `string[]` | No | Topics (e.g., `['Robotics', 'Hands-On']`) |
| `verified` | `boolean` | No | Set to `true` once confirmed by Event Management Team |
| `verificationSource`| `string` | No | Confirmation source (e.g., `"Event Management Runbook"`) |
| `verifiedAt` | `string` | No | Verification date (`YYYY-MM-DD`) |

---

## 3. Submission Template

```typescript
// Insert into airsEvents in src/data/events.ts
{
  id: "<EVENT_ID>",
  title: "<OFFICIAL_EVENT_TITLE>",
  category: "<EVENT_CATEGORY>",
  date: "<YYYY-MM-DD>",
  time: "<START_TIME> - <END_TIME>",
  venue: "<CAMPUS_BUILDING_OR_ROOM>",
  description: "<DETAILED_EVENT_SYNOPSIS_AND_AGENDA>",
  registrationUrl: "https://<OFFICIAL_REGISTRATION_DOMAIN>/rsvp",
  eventUrl: "https://<OFFICIAL_EVENT_PAGE>",
  status: "UPCOMING",
  tags: ["<TAG_1>", "<TAG_2>"],
  verified: true,
  verificationSource: "Event Management Team Approval",
  verifiedAt: "<YYYY-MM-DD>"
}
```

*Rule: Never publish speculative or unconfirmed dates. If an event is taking shape without a fixed calendar booking, omit the `date` field so it remains on standby.*
