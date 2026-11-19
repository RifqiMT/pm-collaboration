# TeamCompass Documentation Index

**Product:** TeamCompass  
**Internal package namespace:** `@cadence/*` (historical codename; user-facing brand is TeamCompass)  
**Version:** web/core `0.1.0` · mobile `1.0.0`  
**Last documentation refresh:** 2026-11-19  

This index is the reading map for product, engineering, design, and leadership stakeholders. Every document below is grounded in the current monorepo source of truth.

---

## How to read this set

| Audience | Start here | Then read |
| --- | --- | --- |
| New team member | [README](../README.md) → [PRODUCT](./product.md) | Personas, Guardrails |
| Product / PM | [PRD](./PRD.md) → [User stories](./user-stories/) → [Metrics](./METRICS.md) | Variables, Traceability |
| Engineering | [ARCHITECTURE](./ARCHITECTURE.md) → [TECH_STACK](./TECH_STACK.md) → [API](./API.md) | Guardrails, Variables |
| Design | [DESIGN_GUIDELINES](./DESIGN_GUIDELINES.md) | PRODUCT, Personas |
| Compliance / QA | [TRACEABILITY_MATRIX](./TRACEABILITY_MATRIX.md) → [GUARDRAILS](./GUARDRAILS.md) | CHANGELOG |

---

## Document catalog

| Document | Purpose |
| --- | --- |
| [../README.md](../README.md) | Product overview, benefits, quick start, layout, trust model |
| [product.md](./product.md) | Full product documentation: rituals, logics, collaboration, limits |
| [PRD.md](./PRD.md) | Product requirements, goals, non-goals, acceptance, risks |
| [personas/](./personas/) | Primary and secondary user personas |
| [user-stories/](./user-stories/) | Epics, stories, and acceptance criteria |
| [VARIABLES.md](./VARIABLES.md) | Exhaustive variable catalog with formulas, locations, examples, relationship chart |
| [METRICS.md](./METRICS.md) | Product metrics and OKR metrics for the product team |
| [DESIGN_GUIDELINES.md](./DESIGN_GUIDELINES.md) | Color palettes, tokens, components, motion, web + mobile |
| [TRACEABILITY_MATRIX.md](./TRACEABILITY_MATRIX.md) | Requirements → stories → code → tests |
| [GUARDRAILS.md](./GUARDRAILS.md) | Technical and business limitations for development |
| [CHANGELOG.md](./CHANGELOG.md) | Historical development log |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, privacy, sync, storage |
| [TECH_STACK.md](./TECH_STACK.md) | Packages, versions, scripts, environments |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Single-process Docker/Render/Fly file store; optional Vercel + Supabase/Redis |
| [supabase-schema.sql](./supabase-schema.sql) | Supabase table for Vercel remote store |
| [API.md](./API.md) | HTTP routes and operation catalog |

---

## Source-of-truth map

| Concern | Canonical code |
| --- | --- |
| Domain types & limits | `packages/core/src/types.ts` |
| Room mutations & privacy | `packages/core/src/room.ts` |
| Scoring & quadrants | `packages/core/src/scoring.ts` |
| Templates, shelves, search, icebreakers, review seed | `packages/core/src/content.ts` (`RETRO_TEMPLATES`, `RETRO_TEMPLATE_GROUPS`, `searchRetroTemplates`) |
| Shape picker UI | `apps/web/.../new-room-form.tsx`, mobile create in `App.js`, `.shape-finder*` in `globals.css` |
| Demo seed data | `packages/core/src/demo.ts` |
| In-app Definitions glossary | `packages/core/src/glossary.ts` |
| Retro CSV export | `packages/core/src/retro-export.ts` |
| Web UI & polling | `apps/web/src/components/` |
| Definitions page | `apps/web/src/app/guide/page.tsx` (`/guide`) |
| Mobile Definitions | `Guide` screen in `apps/mobile/App.js` |
| Developer credit | `apps/web/src/components/credit-footer.tsx`, mobile `CreditFooter` in `App.js` |
| Room API & persistence | `apps/web/src/app/api/`, `apps/web/src/server/{store,persistence,http}.ts` |
| Vercel project config | `apps/web/vercel.json` |
| Single-process deploy | `Dockerfile`, `render.yaml`, `fly.toml`, [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Supabase schema (Vercel) | [supabase-schema.sql](./supabase-schema.sql) |
| Design tokens (web) | `apps/web/src/app/globals.css` |
| Mobile client | `apps/mobile/App.js`, `apps/mobile/src/` |

---

## Maintenance rule

When behavior, limits, formulas, or UI copy change in code, update:

1. `VARIABLES.md` and/or `API.md` if contracts change  
2. `product.md` / `PRD.md` if user-visible behavior changes  
3. `TRACEABILITY_MATRIX.md` if requirement coverage moves  
4. `CHANGELOG.md` with date, author area, and impact  
5. This index if new docs are added  

Do not invent shipped features in documentation. Document only what the repository implements.
