# TeamCompass — Changelog

All notable product and engineering changes are recorded here.  
Format inspired by [Keep a Changelog](https://keepachangelog.com/).  
Version labels follow package versions where applicable (`@cadence/core` / `@cadence/web` **0.1.0**, `@cadence/mobile` **1.0.0**).

---

## [Unreleased]

### Added — Product

- **Start from an example** loads a demo session: 10 notes in every column of every retrospective shape, a sprint review with evidence on every checklist item, and a 10-bet roadmap across all four quadrants.  
- **Raise hand** in Discuss: ordered speaking queue; named notes highlight; anonymous authorship stays protected; queue clears on phase change (web + mobile).

### Added — Engineering

- Preferred deploy: **single-process file store** via `Dockerfile`, `render.yaml`, `fly.toml` (no Redis).  
- Optional Vercel path: **Supabase** document store (`cadence_store`) or Upstash Redis via `persistence.ts`.  
- Room store backends: `file` (default) · `supabase` · `redis`.  
- Store vitest coverage for backend selection and file create/join/op durability.  
- Core tests for `retro.raiseHand` / `raisedHands` presentation.

### Documentation

- Enterprise documentation suite under `docs/` (index, PRODUCT, PRD, personas, user stories, variables with relationship charts, metrics/OKRs, design guidelines, traceability matrix, guardrails, architecture, tech stack, API, deployment).  
- **2026-11-12 refresh:** documented raise-hand end-to-end; aligned store backends (`file`/`supabase`/`redis`) and Supabase key precedence; clarified web vs mobile poll/timer differences; corrected accent token notes.

---

## [0.1.0] — 2026-11 — Web & core MVP (product baseline)

### Added — Product

- **TeamCompass** branded collaboration rooms for three rituals: Retrospective, Sprint review, Roadmap.  
- Six-character room codes; no accounts; local identity persistence.  
- Retrospective: 34 templates (classic + pop culture), 18 icebreakers (including host-custom This or That pairs), private brainstorm, discuss walks, dot voting, actions, per-section timers/stopwatches, Summary + CSV export.  
- Sprint review: seeded checklist, multi-signer checks, feedback kinds, ship/iterate/hold decision.  
- Roadmap: RICE, ICE, value÷complexity; complexity index; median + 3.5 guides; quadrants and insights.  
- Demo room seeding for exploration.

### Added — Engineering

- Monorepo with `@cadence/core` domain library (types, ops, privacy presentation, scoring, content, retro export).  
- `@cadence/web` Next.js 15 App Router UI + Node JSON file store API.  
- Polling sync (~1.5s / ~8s), desired-state votes/checks, `CadenceError` codes.  
- Vitest coverage for core room/scoring/export and selected web UI helpers.

### Security / trust

- Documented trusted-network model: room code is the key; single-process JSON store.

---

## [1.0.0] — 2026-11 — Mobile peer client

### Added

- `@cadence/mobile` Expo ~58 / React Native client.  
- Home, create, and room flows for all three rituals against the web API.  
- Configurable API base URL; AsyncStorage identity; shared `@cadence/core` via `file:` dependency.  
- Retro CSV share path; icebreaker and scoring participation on device.

### Notes

- Mobile package version **1.0.0** while web/core remain **0.1.0** (branded product still early).  
- Mobile is not included in root npm workspaces scripts.

---

## Historical development log (narrative)

| Period | Focus | Impact |
| --- | --- | --- |
| Bootstrap | Domain types, room ops, scoring | Shared rules for all clients |
| Web rooms | Next.js UI + API + file store | Facilitators can run live rituals on laptop |
| Ritual depth | Icebreakers, discuss, timers, summary/CSV | Retros become complete facilitated sessions |
| Review & roadmap polish | Multi-signer checklist, quadrants, insights | Decision and prioritization clarity |
| Mobile | Expo peer client | Same rooms from phone |
| 2026-11-11 | Documentation standard | Enterprise-ready product documentation set |

---

## Versioning policy

| Change type | Version expectation |
| --- | --- |
| Docs-only | Changelog Unreleased → dated Docs note; no package bump required |
| Compatible domain/API additions | Minor (when packages leave 0.x) |
| Breaking op/schema/limit changes | Major; update VARIABLES, API, Traceability |
| Mobile-only UX | Mobile package version; note in changelog |

---

## Authors / ownership

Entries should name the area impacted (Product, Core, Web, Mobile, Docs).  
This documentation refresh: **Docs** — product documentation standard pass, 2026-11-11.
