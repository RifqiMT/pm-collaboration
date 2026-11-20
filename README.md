# TeamCompass

**Helps teams align on direction, review progress, and decide what comes next.**

TeamCompass is a shared collaboration room for six rituals—**retrospective**, **sprint planning**, **backlog refinement**, **sprint review**, **roadmap scoring**, and **product direction**. A team joins with a six-character code and edits one board together. The web app is the full room and hosts the API. The phone app joins the same rooms. There are no accounts.

| | |
| --- | --- |
| **Product brand** | TeamCompass |
| **Engineering packages** | `cadence` monorepo · `@cadence/core` · `@cadence/web` · `@cadence/mobile` |
| **Versions** | web/core `0.1.0` · mobile `1.0.0` |
| **Documentation hub** | [docs/00-INDEX.md](docs/00-INDEX.md) |

---

## Product overview

TeamCompass replaces scattered sticky notes, slides, and spreadsheets with one code-joined board per ritual:

1. **Retrospective** — Icebreaker → private notes → discuss → dot vote → owned actions → summary (CSV + PPT)  
2. **Sprint planning** — Why this Sprint is valuable, what Developers can finish, and how they will do it. The Sprint Goal is the commitment. The items are a forecast.  
3. **Backlog refinement** — Ongoing Product Backlog work: detail, split, Developer sizing, and Product Owner order. Selectable, split, or return.  
4. **Sprint review** — Inspect the Sprint Goal and the Increment with stakeholders, then adapt the Product Backlog: release / adapt / hold  
5. **Roadmap** — Score bets with RICE, ICE, or value÷complexity; complexity sits beside the business outcome  
6. **Product direction** — A product vision or a product strategy, using a professional framework, read back as one statement  

### Product benefits

- **Fast start** — Create a room in seconds; share a short code  
- **Psychological safety** — Brainstorm notes stay private on the server until Discuss  
- **Facilitation control** — Host gates sections, icebreaker, and discussion walk; timers and vote budget are open on web  
- **Clear closure** — Owned actions; planning / refinement / review calls; roadmap quadrants  
- **Honest math** — Shared scoring in `@cadence/core` on web and mobile  
- **Exportable record** — Retro summary downloads as CSV and as a consultant-style PPT  

---

## Features at a glance

| Area | Capabilities |
| --- | --- |
| Rooms | Create/join by code, local identity, presence (20s), optional demo seed, max 40 people |
| Retro | 62 templates (8 shelves + shape search/filters), 21 icebreakers, privacy, discuss walks + raise hand, votes (default 3), actions, web timers 3/5/8 + custom 1–60 min, summary CSV + PPT |
| Planning | Why / What / How / Sprint Backlog (how-to on each). Forecast / Narrow / No goal (`commit` / `reshape` / `defer`) |
| Refinement | Detail / Split / Size / Order (how-to on each). Selectable / Split / Return (`ready` / `split` / `park`) |
| Review | Sprint Goal, Increment, stakeholders, adapt backlog. Release / Adapt / Hold (`ship` / `iterate` / `hold`) |
| Roadmap | RICE / ICE / value÷complexity, complexity index, median & 3.5 guides, quadrants, insights |
| Direction | Extended Product Vision Board, Moore positioning, Playing to Win cascade, Rumelt kernel, and DHM with a metric and a tactic. Each framework includes how to fill it in. |
| Definitions | Plain-English variables, metrics, and formulas (`/guide` web · Guide screen mobile · `GLOSSARY` 33 entries / 6 groups) |
| Platforms | Next.js web + Expo mobile + shared TypeScript core |
| Credit | Developer credit footer (web site-wide; mobile home/create) |

Full product detail: [docs/product.md](docs/product.md) · Requirements: [docs/PRD.md](docs/PRD.md)

---

## Quick start

### Web

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create a room, copy the code, and open it in another browser.

### Phone

The API must be the machine running the web app.

```bash
npm run dev
cd apps/mobile
npx expo start
```

On the phone home screen, set the server to your computer’s address (e.g. `http://192.168.1.20:3000`). A simulator on the same machine can use `http://localhost:3000`. Android emulators often need `http://10.0.2.2:3000`.

**Requirements:** Node.js ≥ 20.

---

## What’s in a room

### Retrospective

The host moves the room through six sections. Each section shows only its own work.

1. **Icebreaker** — Short warm-up (**21** games). On This or That, the host can write the two sides. **Health Check** rates six statements anonymously on a 1–7 scale. **Travel Wishlist** pins up to five countries on a shared map. **Lineup** lets the host name an order, then everyone arranges the people in the room.  
2. **Notes** — Templates grouped as Classic, Film, Series, Anime, Games, Sport, Music, and Food. Sport includes cricket, basketball, field hockey, tennis, volleyball, table tennis, baseball, rugby, golf, and the Olympics. Games include eSports, DOTA, Resident Evil, and Assassin's Creed. Each shape uses the number of columns that theme needs. Search and filters use the name, a column, the column count, or the theme shelf. You see only your notes until Discuss. Column glyphs grow as notes collect.  
3. **Discuss** — Notes revealed; status walk or author walk; raise-hand speaking queue (named notes highlight; anonymous stay unattributed).  
4. **Vote** — Dot budget (default 3; any joined person can set **1–10** on web). Notes are not editable while voting.  
5. **Actions** — Text, owner, done; can start from a note.  
6. **Summary** — Collect notes, dots, actions, icebreaker answers; download **CSV** and **PPT** (icebreaker, durations, discuss order, overview, categories, top votes, actions).  

Each timed section has its own countdown (web presets 3 / 5 / 8 minutes, plus Custom 1–60) and stopwatch. Mobile joins the same phases and raise-hand controls; timer and vote-budget chrome are web-first. PPT export is web-first (`pptxgenjs`).

### Sprint planning

Shared checklist topics **Why / What / How / Sprint Backlog**, each with how-to steps. Sprint Goal field. Multi-signer checks, evidence notes, feedback. Call: **Forecast**, **Narrow**, or **No goal** (stored `commit` / `reshape` / `defer`).

### Backlog refinement

Shared checklist topics **Detail / Split / Size / Order**, each with how-to steps. Focus field for the item being refined. Call: **Selectable**, **Split**, or **Return** (stored `ready` / `split` / `park`).

### Sprint review

Shared checklist topics **Sprint Goal / Increment / Stakeholders / Adapt**, each with how-to steps. Multi-signer checks, live feedback, and one call: **Release**, **Adapt**, or **Hold** (stored `ship` / `iterate` / `hold`).

### Roadmap

Initiatives carry outcome, assumption, score inputs, complexity (technical · dependency · uncertainty), horizon, and owner. High complexity starts at **3.5**. Strong score + high complexity = **big bet**; strong + lower complexity = **do first**.

### Product direction

Pick a vision or strategy framework (Product Vision Board, Moore positioning, Playing to Win, Rumelt kernel, or DHM). Fill the prompts with how-to guidance. Switching frameworks keeps answers. The board reads answers back as one statement.

Scoring and direction variables: [docs/VARIABLES.md](docs/VARIABLES.md) · product detail: [docs/product.md](docs/product.md)

---

## Collaboration model

```mermaid
flowchart LR
  create[Create a room] --> code[Share the 6-character code]
  code --> join[Each person joins with a name]
  join --> edit[Edits are operations on one room]
  edit --> poll[Web ~1.5s/8s · Mobile ~2s]
```

Votes, checks, and raise-hand send the **desired state** (idempotent). During private brainstorm, the server removes other people’s note text before the response leaves. Text fields commit on blur or Enter; failed saves restore previous text.

Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · API: [docs/API.md](docs/API.md)

---

## Trust model

The room code is the only key. There are no accounts. Run TeamCompass on a **trusted network** (or accept that a public URL is code-gated only). Preferred hosting keeps rooms in a local JSON file on **one** Node process (`CADENCE_DATA_DIR/rooms.json`)—Docker / Render / Fly / a VPS. Vercel Functions need **Supabase** (preferred) or Upstash Redis instead of a local file.

Full limitations: [docs/GUARDRAILS.md](docs/GUARDRAILS.md) · Deploy: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## Tech stack

| Layer | Stack |
| --- | --- |
| Domain | TypeScript `@cadence/core`, Vitest |
| Web | Next.js 15, React 19, Instrument Sans, CSS tokens |
| Mobile | Expo ~58, React Native, AsyncStorage |
| Storage | Local JSON file on one process (preferred); Vercel: Supabase or Redis |

Details: [docs/TECH_STACK.md](docs/TECH_STACK.md)

---

## Repository layout

```
pm-collaboration/
├── packages/core     # Room rules, privacy, scoring, content, countries, glossary, export
├── apps/web          # Next.js UI (/guide, travel map, lineup order) + room API + store
├── apps/mobile       # Expo iOS/Android client (home / guide / create / room)
└── docs/             # Product documentation suite (current as of 2026-11-20 — product direction)
```

---

## Documentation suite

| Document | Description |
| --- | --- |
| [docs/00-INDEX.md](docs/00-INDEX.md) | Documentation map |
| [docs/product.md](docs/product.md) | Full product documentation |
| [docs/PRD.md](docs/PRD.md) | Product requirements |
| [docs/personas/](docs/personas/) | User personas |
| [docs/user-stories/](docs/user-stories/) | Epics, stories, acceptance criteria |
| [docs/VARIABLES.md](docs/VARIABLES.md) | Variables, formulas, relationship charts |
| [docs/METRICS.md](docs/METRICS.md) | Product metrics & OKRs |
| [docs/DESIGN_GUIDELINES.md](docs/DESIGN_GUIDELINES.md) | Color palettes, components, themes |
| [docs/TRACEABILITY_MATRIX.md](docs/TRACEABILITY_MATRIX.md) | Requirements → code → tests |
| [docs/GUARDRAILS.md](docs/GUARDRAILS.md) | Technical & business limits |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Historical development log |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design |
| [docs/TECH_STACK.md](docs/TECH_STACK.md) | Packages & environments |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Single-process Docker / Render / Fly (file store) |
| [docs/API.md](docs/API.md) | HTTP & ops catalog |

---

## Deploy (local file store — preferred)

One Node process, no Redis:

```bash
docker build -t teamcompass .
docker run --rm -p 3000:3000 -v teamcompass-data:/data teamcompass
```

Or use **Render** (`render.yaml`) / **Fly.io** (`fly.toml`). Details: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Avoid Vercel unless you add **Supabase** (or Redis)—Functions cannot keep a shared `rooms.json`. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) §7.

---

## Limits (summary)

- 40 people · 180 retro notes · 80 actions · 40 initiatives · 100 feedback notes  
- Room code = access control  
- One Node process owns the data file (Docker volume / disk for durability)  
- Last write wins on the same field  

---

## Testing

```bash
npm test   # @cadence/core + @cadence/web vitest suites
npm run build
```

Traceability of coverage: [docs/TRACEABILITY_MATRIX.md](docs/TRACEABILITY_MATRIX.md)

---

## Changelog

See [docs/CHANGELOG.md](docs/CHANGELOG.md) for historical development logs and version notes.
