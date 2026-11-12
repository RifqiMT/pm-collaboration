# TeamCompass — Technology Stack

**Last updated:** 2026-11-12  

---

## 1. Overview

| Layer | Technology | Notes |
| --- | --- | --- |
| Language | TypeScript (core, web), JavaScript (mobile App) | Core is the shared contract |
| Web framework | Next.js **15.5.x** (App Router) | `@cadence/web` |
| UI library | React **19.x** | Web + mobile |
| Mobile | Expo **~58**, React Native **0.88** | `@cadence/mobile` |
| Domain | `@cadence/core` pure TS | Vitest unit tests |
| Storage | JSON file (preferred) / Supabase / Upstash Redis | Auto-select via env |
| Font (web) | Instrument Sans (Google via `next/font`) | `--font-sans` |
| Node | **≥ 20** | Root engines |
| Package manager | npm workspaces | Mobile separate install |

Root package name remains `cadence@0.1.0` while product brand is **TeamCompass**.

---

## 2. Package versions

### Root (`cadence`)

- Workspaces: `packages/core`, `apps/web`  
- Scripts: `dev`, `build`, `test`, `start` → web/core  

### `@cadence/core` `0.1.0`

| Dependency | Role |
| --- | --- |
| typescript ^5.7 | Types |
| vitest ^3.2 | Unit tests |

### `@cadence/web` `0.1.0`

| Dependency | Role |
| --- | --- |
| next ^15.5.4 | App + API routes |
| react / react-dom ^19.1.1 | UI |
| @cadence/core * | Domain |
| @upstash/redis | Optional Redis room store (Vercel alternative to Supabase) |
| vitest ^3.2 | Helper + store tests |

### `@cadence/mobile` `1.0.0`

| Dependency | Role |
| --- | --- |
| expo ~58.0.23 | Runtime |
| react-native 0.88.1 | Native UI |
| react 19.3.0 | UI |
| @react-native-async-storage/async-storage 2.2.0 | Identity persistence |
| @cadence/core file:../../packages/core | Domain |

---

## 3. Scripts

```bash
# From repo root
npm install
npm test                 # core + web vitest
npm run dev              # next dev on :3000
npm run build
npm run start

# Mobile (separate)
cd apps/mobile
npx expo start
```

---

## 4. Runtime environments

| Environment | Guidance |
| --- | --- |
| Local web | `http://localhost:3000` |
| Mobile simulator (same machine) | `http://localhost:3000` |
| Android emulator → host | Often `http://10.0.2.2:3000` |
| Physical device | Host LAN IP, e.g. `http://192.168.1.20:3000` |
| Production-like (local) | Single Node `next start`; backup `rooms.json` if needed |
| Production (preferred) | Docker / Render / Fly single Node + `CADENCE_STORE=file` — see [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Production (optional Vercel) | Functions + **Supabase** (preferred) or Upstash Redis |

---

## 5. Key libraries (by concern)

| Concern | Implementation |
| --- | --- |
| Routing (web) | Next.js App Router (`app/`) |
| Routing (mobile) | In-app screen state in `App.js` (not Expo Router yet) |
| Identity | localStorage / AsyncStorage |
| HTTP | `fetch` |
| Validation / scoring | `@cadence/core` |
| Styling (web) | Global CSS variables + component classes |
| Styling (mobile) | `StyleSheet` + `colors` object |

---

## 6. Data & ops

- Local persistence: `CADENCE_DATA_DIR/rooms.json` (default `apps/web/data`; gitignored)  
- Vercel preferred: Supabase table `cadence_store` via `SUPABASE_URL` + `SUPABASE_SECRET_KEY` (or publishable/legacy keys); run [supabase-schema.sql](./supabase-schema.sql) once  
- Vercel alternative: Upstash Redis keys `cadence:rooms` / `cadence:rooms:lock`  
- Force backend: `CADENCE_STORE=file|supabase|redis`  
- No auth provider (Clerk, Auth0, etc.)  
- Env template: [`.env.example`](../.env.example) · deploy guide: [DEPLOYMENT.md](./DEPLOYMENT.md)  

---

## 7. Quality tooling

| Tool | Use |
| --- | --- |
| Vitest | Domain + selected UI helper tests |
| TypeScript | Core + web |
| Manual / Expo | Mobile verification |

Recommended before merge: `npm test` and a two-browser smoke of create → join → op.

---

## 8. Engineering guidelines

1. Put shared rules in `@cadence/core`, never duplicate formulas in UI.  
2. Keep API routes thin: parse → store → core → present.  
3. Prefer desired-state ops over toggles.  
4. Local file backend: one writer process. Vercel: require Supabase or Redis (see DEPLOYMENT.md).  
5. Document new `LIMITS` and formulas in [VARIABLES.md](./VARIABLES.md).  
6. Preserve brainstorm privacy in `presentRoom` when changing card views.  

See also: [ARCHITECTURE.md](./ARCHITECTURE.md), [GUARDRAILS.md](./GUARDRAILS.md).
