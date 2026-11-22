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
- **Definitions**: plain-English variables, metrics, and formulas for retrospective, planning, refinement, sprint review, roadmap, product direction, and requirements (`GLOSSARY` — 44 entries / 7 groups; artifact terms under `requirements`). Web `/guide`; mobile Guide screen; linked from home, room chrome, and roadmap scoring help.
- **62 retrospective shapes** across eight shelves (Classic 13 · Film 10 · Series 9 · Anime 5 · Games 9 · Sport 14 · Music 1 · Food 1). Newer themes include TACO, 4Ps, Marie Kondo, KALM, ALC, Digimon, Star Trek, F1, MotoGP, World Cup, Super Mario, Mario Kart, Pac-Man, Pizza, Cricket, Basketball, Field Hockey, Tennis, Volleyball, Table Tennis, Baseball, Rugby, Golf, Olympics, eSports, DOTA, Resident Evil, and Assassin's Creed. Demo seed writes ten theme-specific notes per column.
- **Shape picker** on create: searchable shelves, column-count filters (3 / 4 / 5), A–Z lists, and live column titles/hints before create (web + mobile).
- **Health Check** icebreaker: six statements rated from strongly disagree to strongly agree (1–7). The room sees the spread of answers and averages, not who chose each point. Web and mobile.
- **Travel Wishlist** icebreaker: pick up to five countries on the map from a 175-country catalog. Each selected country shows a rounded flag. Names stay with the wishlist. The summary and CSV use country names. Web interactive map; mobile uses the same country list.
- **Lineup** icebreaker: the host names what the order means. Everyone arranges the people in the room. Saving a new title clears orders already shared. Web and mobile.
- **Sprint planning, backlog refinement, and sprint review** follow the Scrum Guide; each part includes how to run it. Planning: Why / What / How / Sprint Backlog (Forecast, Narrow, or No goal). Refinement: Detail / Split / Size / Order (Selectable, Split, or Return). Review: Sprint Goal / Increment / Stakeholders / Adapt (Release, Adapt, or Hold).
- **Artifact examples**: each example now names the personas it serves and maps stakeholders with RACI (Responsible, Accountable, Consulted, Informed). One person is accountable.
- **Artifact examples**: CS data products is a third example, on the same guest journey. It is the certified dataset for stay-change first-contact resolution, fed by the agent workspace and the contact center. Every artifact has an example.
- **Artifact examples**: stories, acceptance criteria, and backlog lines read as a specification. A story keeps As a / I want / so that together, with estimate and readiness underneath. Acceptance criteria use Given, When, and Then. The stacked gray sentence bars are gone.
- **Artifact examples**: acceptance criteria are written on every example. Stories, features, epics, backlog items, the Sprint forecast, the lean business case, and the Increment each name them in given, when, then form. The Definition of Done stays the quality bar around those criteria.
- **Artifact examples**: a reading room for eight worked artifacts — PRD, Lean Business Case (with WSJF), epic, feature, user stories, Product Backlog, Sprint Backlog, and Increment & Definition of Done. Each example follows Scrum, Agile, or SAFe. Platforms: Unified Agent Platform and Contact Center Platform (same guest journey). Sticky platform/artifact controls and a document-style reader on web.
- **Product requirements**: a checklist for one requirement, in three parts. Product follows Agile (user, outcome, Sprint-sized stories, acceptance criteria). Business follows SAFe (benefit hypothesis, leading indicators, smallest test, cost of delay and job size). Technical follows Scrum and SAFe (Definition of Done, non-functional requirements, enablers, dependencies). The call is Ready for the backlog, Thin the MVP, or Still open. Each part includes how to fill it in. Web and mobile.
- **Product direction example**: a unified agent platform for customer service on a travel marketplace the size of Booking.com, filled across every vision and strategy framework.
- **Product direction**: write a product vision or a product strategy. Frameworks follow the published boards: Roman Pichler's extended Product Vision Board (vision plus competitors, revenue, costs, and channels), Geoffrey Moore's positioning sentence (including the product name), the Playing to Win cascade with where you will not play and what would have to be true, Rumelt's kernel with the crux and what the policy rules out, and Gibson Biddle's DHM locked to a proxy metric and a tactic. Each includes how to fill it in. The room reads the answers back as one statement. Switching framework keeps answers already written. Web and mobile.
- **Retro PPT export** on Summary: consultant-style deck (icebreaker, durations, discuss order, overview, categories, top votes, actions) alongside CSV. Web-first.

### Added — Engineering

- Preferred deploy: **single-process file store** via `Dockerfile`, `render.yaml`, `fly.toml` (no Redis).  
- Optional Vercel path: **Supabase** document store (`cadence_store`) or Upstash Redis via `persistence.ts`.  
- Room store backends: `file` (default) · `supabase` · `redis`.  
- Store vitest coverage for backend selection and file create/join/op durability.  
- Core tests for `retro.raiseHand` / `raisedHands` presentation.  
- `packages/core/src/glossary.ts` + `glossary.test.ts` (unique ids; RICE example matches scorer).  
- `RETRO_TEMPLATE_GROUPS`, `searchRetroTemplates`, `retroColumnCounts`, and template coverage tests for all 62 shapes.  
- Shape-finder UI styles (`.shape-finder*`) and glyph coverage for new templates.  
- `IcebreakerMode` extended with `scale`, `map`, and `order`; `HEALTH_CHECK` helpers + `health-check.test.ts`; `countries.ts` (175 countries); `parsePeopleOrder` / `formatPeopleOrder`; health peer anonymization; CSV transforms for health / travel / lineup / show-and-tell.  
- Web icebreaker surfaces: `travel-map.tsx`, `people-order.tsx`, `.health-*` / `.wish-map*` / `.order-*` CSS; mobile Health / Travel / Lineup screens.  
- `retro.setOrderTitle` (host); removed `retro.nextIcebreakerRound` and `retro.focusCard` / `discussedCardId`.  
- `RoomKind` includes `planning`, `refinement`, `direction`, `prd`, and `artifacts` (**8** kinds). Checklist kinds store `ReviewState` via `createChecklistState` (planning / refinement / review / **prd**). Direction stores `DirectionState` (`DIRECTION_FRAMEWORKS` ×5). Artifacts store `ArtifactState` (8 guides × 3 products in `artifacts.ts`). `review.setDecision` is kind-scoped (twelve stored ids). Checklist stopwatch via `checklistStopwatchMs`.  
- `direction.setFramework` / `direction.setAnswer` (field must belong to current framework; answers kept on switch; `LIMITS.directionAnswer` 800). Web `direction-board.tsx` + `.direction-*` CSS; mobile direction screen.  
- `artifacts.setArtifact` / `artifacts.setProduct`; prose via `artifactExample`; web `artifact-board.tsx` + `.artifact-*` CSS; mobile artifacts screen.  
- `retrospectiveDeck` (`retro-deck.ts`) + web `buildRetroPptx` (`pptxgenjs` ^3.12) + `.summary-downloads*` UI; deck/pptx vitest coverage.

### Documentation

- Enterprise documentation suite under `docs/` (index, product, PRD, personas, user stories, variables with relationship charts, metrics/OKRs, design guidelines, traceability matrix, guardrails, architecture, tech stack, API, deployment).  
- **2026-11-12 refresh:** documented raise-hand end-to-end; aligned store backends (`file`/`supabase`/`redis`) and Supabase key precedence; clarified web vs mobile poll/timer differences; corrected accent token notes.  
- **2026-11-16 refresh:** API `store`→503 + full error catalog; web timer Custom 1–60 min and `DOT_PRESETS`; `persistence.ts` lock constants; credit footer inventory; `product.md` link casing; mobile vote-budget chrome gap; `vercel.json` and `sb_*` auth notes.  
- **2026-11-18 refresh:** Definitions/glossary end-to-end (product, PRD FR-P6, stories, VARIABLES §12–13, architecture, design, traceability); clarified vote budget/timers are not host-gated; CSV export columns catalogued.  
- **2026-11-19 refresh:** 62-template shelves + shape picker documented; CSV §13 examples match export writers; glossary timer/dot copy no longer claims host-only; DESIGN shape-finder section; suite stamps updated.  
- **2026-11-19 evening refresh:** documented Health Check + Travel Wishlist end-to-end; aligned remaining “18 icebreakers” → **20**.  
- **2026-11-20 refresh:** documented Lineup; icebreaker count **21**; removed stale next-round / focus-card host claims.  
- **2026-11-20 evening refresh:** planning + refinement checklists; glossary then 31/5; retro PPT deck; epic-06.  
- **2026-11-20 night refresh:** sixth ritual **product direction** (`DIRECTION_FRAMEWORKS`, readback/statement, FR-DIR1–4, epic-07); glossary **33/6**; FR-R1 / VARIABLES / DESIGN / ARCHITECTURE / GUARDRAILS aligned to six kinds.  
- **2026-11-22 refresh:** aligned docs to **8** room kinds (`prd` \| `artifacts`); glossary **44/7**; VARIABLES ChecklistKind + ArtifactState §13d; DESIGN artifact reader + seven guide groups; ARCHITECTURE/INDEX source map; FR-PRD / FR-ART / epic-08/09; documented `review.setSection` and artifact ops; clarified vestigial `icebreakerRound` / always-false `RetroCardView.hidden`.

---

## [0.1.0] — 2026-11 — Web & core MVP (product baseline)

### Added — Product

- **TeamCompass** branded collaboration rooms for three rituals: Retrospective, Sprint review, Roadmap.  
- Six-character room codes; no accounts; local identity persistence.  
- Retrospective: classic + pop templates (expanded later to 62 shapes), 21 icebreakers (including host-custom This or That pairs, a six-question health check, a travel wishlist map, and a host-named lineup), private brainstorm, discuss walks, dot voting, actions, per-section timers/stopwatches, Summary + CSV export.  
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
