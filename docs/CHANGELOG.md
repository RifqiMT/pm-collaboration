# TeamCompass — Changelog

All notable product and engineering changes are recorded here.  
Format inspired by [Keep a Changelog](https://keepachangelog.com/).  
Version labels follow package versions where applicable (`@cadence/core` / `@cadence/web` **0.1.0**, `@cadence/mobile` **1.0.0**).

---

## [Unreleased]

### Added — Product

- **Developer credit footer** on web (all pages) and mobile (home + create): “Developed, managed, and maintained by Rifqi Tjahyono” with LinkedIn, personal-website, [GitHub](https://github.com/RifqiMT/pm-collaboration), and [article](https://rifqi-tjahyono.com/%f0%9f%93%9d-sticky-note-chaos-to-team-clarity-reflect-together-review-progress-and-decide-what-comes-next-%f0%9f%a4%9d%f0%9f%a7%ad/) icon links.  
- **Start from an example** loads a demo session: 10 notes in every column of every retrospective shape, a sprint review with evidence on every checklist item, and a 10-bet roadmap across all four quadrants.  
- **Raise hand** in Discuss: ordered speaking queue; named notes highlight; anonymous authorship stays protected; queue clears on phase change (web + mobile).
- **Definitions**: plain-English variables, metrics, and formulas for the retrospective, sprint review, and roadmap (`GLOSSARY` in `@cadence/core`). Web `/guide`; mobile Guide screen; linked from home, room chrome, and roadmap scoring help.
- **62 retrospective shapes** across eight shelves (Classic 13 · Film 10 · Series 9 · Anime 5 · Games 9 · Sport 14 · Music 1 · Food 1). Newer themes include TACO, 4Ps, Marie Kondo, KALM, ALC, Digimon, Star Trek, F1, MotoGP, World Cup, Super Mario, Mario Kart, Pac-Man, Pizza, Cricket, Basketball, Field Hockey, Tennis, Volleyball, Table Tennis, Baseball, Rugby, Golf, Olympics, eSports, DOTA, Resident Evil, and Assassin's Creed. Demo seed writes ten theme-specific notes per column.
- **Shape picker** on create: searchable shelves, column-count filters (3 / 4 / 5), A–Z lists, and live column titles/hints before create (web + mobile).
- **Health Check** icebreaker: six statements rated from strongly disagree to strongly agree (1–7). The room sees the spread of answers and averages, not who chose each point. Web and mobile.
- **Travel Wishlist** icebreaker: pick up to five countries on the map from a 175-country catalog. Each selected country shows a rounded flag. Names stay with the wishlist. The summary and CSV use country names. Web interactive map; mobile uses the same country list.

### Added — Engineering

- Preferred deploy: **single-process file store** via `Dockerfile`, `render.yaml`, `fly.toml` (no Redis).  
- Optional Vercel path: **Supabase** document store (`cadence_store`) or Upstash Redis via `persistence.ts`.  
- Room store backends: `file` (default) · `supabase` · `redis`.  
- Store vitest coverage for backend selection and file create/join/op durability.  
- Core tests for `retro.raiseHand` / `raisedHands` presentation.  
- `packages/core/src/glossary.ts` + `glossary.test.ts` (unique ids; RICE example matches scorer).  
- `RETRO_TEMPLATE_GROUPS`, `searchRetroTemplates`, `retroColumnCounts`, and template coverage tests for all 62 shapes.  
- Shape-finder UI styles (`.shape-finder*`) and glyph coverage for new templates.  
- `IcebreakerMode` extended with `scale` and `map`; `HEALTH_CHECK` helpers + `health-check.test.ts`; `countries.ts` (175 countries, wishlist parse/format/export); health peer anonymization in `presentRoom`; CSV transforms for health / travel / show-and-tell.  
- Web: `travel-map.tsx`, `world-map-paths.ts`, `public/flags/*.svg` (~175), `.health-*` / `.wish-map*` CSS. Mobile: `HealthCheckMobile` / `TravelWishlistMobile`.

### Documentation

- Enterprise documentation suite under `docs/` (index, product, PRD, personas, user stories, variables with relationship charts, metrics/OKRs, design guidelines, traceability matrix, guardrails, architecture, tech stack, API, deployment).  
- **2026-11-12 refresh:** documented raise-hand end-to-end; aligned store backends (`file`/`supabase`/`redis`) and Supabase key precedence; clarified web vs mobile poll/timer differences; corrected accent token notes.  
- **2026-11-16 refresh:** API `store`→503 + full error catalog; web timer Custom 1–60 min and `DOT_PRESETS`; `persistence.ts` lock constants; credit footer inventory; `product.md` link casing; mobile vote-budget chrome gap; `vercel.json` and `sb_*` auth notes.  
- **2026-11-18 refresh:** Definitions/glossary end-to-end (product, PRD FR-P6, stories, VARIABLES §12–13, architecture, design, traceability); clarified vote budget/timers are not host-gated; CSV export columns catalogued.  
- **2026-11-19 refresh:** 62-template shelves + shape picker documented; CSV §13 examples match export writers; glossary timer/dot copy no longer claims host-only; DESIGN shape-finder section; suite stamps updated.  
- **2026-11-19 evening refresh:** documented Health Check + Travel Wishlist end-to-end (product, VARIABLES body contracts + charts, DESIGN health/map, ARCHITECTURE/INDEX source map, stories AC, guardrail privacy, metrics, TRACEABILITY); restored Shape picker CHANGELOG product bullet; aligned remaining “18 icebreakers” → **20**.

---

## [0.1.0] — 2026-11 — Web & core MVP (product baseline)

### Added — Product

- **TeamCompass** branded collaboration rooms for three rituals: Retrospective, Sprint review, Roadmap.  
- Six-character room codes; no accounts; local identity persistence.  
- Retrospective: classic + pop templates (expanded later to 62 shapes), 20 icebreakers (including host-custom This or That pairs, a six-question health check, and a travel wishlist map), private brainstorm, discuss walks, dot voting, actions, per-section timers/stopwatches, Summary + CSV export.  
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
