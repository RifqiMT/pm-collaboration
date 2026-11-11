# TeamCompass — Deployment (Vercel Hobby)

**Audience:** Operators deploying `@cadence/web`  
**Plan target:** Vercel **Hobby** (free)  
**Last updated:** 2026-11-11  

Mobile (`@cadence/mobile`) is Expo and is **not** deployed to Vercel. Point the phone app at the production web URL after deploy.

---

## 1. What deploys

| App | Host | Notes |
| --- | --- | --- |
| `@cadence/web` | Vercel Hobby | Next.js UI + room API |
| `@cadence/mobile` | Expo / device | Set server base URL to the Vercel production origin |
| `@cadence/core` | Bundled into web | Transpiled via `next.config.ts` |

---

## 2. Why Redis is required on Vercel

Local `apps/web/data/rooms.json` works for a single Node process. Vercel Functions have an ephemeral, mostly read-only filesystem and scale across instances, so the file store **cannot** be the production backend.

On Hobby, TeamCompass uses **Upstash Redis** (Marketplace free tier) when:

- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set, or  
- `CADENCE_STORE=redis` (then both Upstash vars are required)

Local `npm run dev` keeps the **file** backend unless you set Upstash env vars.

---

## 3. One-time setup

1. Push this monorepo to GitHub (or deploy with Vercel CLI).  
2. In [Vercel](https://vercel.com): **Add New Project** → import the repo.  
3. Project settings:
   - **Root Directory:** `apps/web`  
   - **Framework Preset:** Next.js (from `apps/web/vercel.json`)  
   - **Install / Build:** already set in `apps/web/vercel.json` to run from the monorepo root workspaces  
   - **Node.js:** ≥ 20  
4. **Storage / Integrations:** add **Upstash Redis** to the project (Marketplace). Confirm env vars appear for Production + Preview:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
5. Deploy. Open the production URL, create a room, join from a second browser.

CLI alternative (after `vercel link` from repo root with root directory `apps/web`):

```bash
vercel integration add upstash   # if available in your CLI / dashboard flow
vercel env pull apps/web/.env.local --yes
vercel --prod
```

Do not commit `.env.local` or Redis tokens.

---

## 4. Environment variables

See [`.env.example`](../.env.example).

| Variable | Required on Hobby | Purpose |
| --- | --- | --- |
| `UPSTASH_REDIS_REST_URL` | Yes (prod) | Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Yes (prod) | Redis REST token |
| `CADENCE_STORE` | No | Force `file` or `redis` |
| `CADENCE_DATA_DIR` | No | Override local JSON directory |

---

## 5. Hobby plan constraints (operator checklist)

- Fair use: Hobby is for **personal / non-commercial** use.  
- No durable local disk — Redis is mandatory for rooms.  
- Function duration / invocations / bandwidth are capped; polling (~1.5s) is intentional and counts toward invocations.  
- Runtime logs retained briefly on Hobby.  
- Trust model still applies: room code is the only key; CORS is open for mobile; do not treat a public URL as enterprise-grade ACL.

Full limits: [Vercel Hobby plan](https://vercel.com/docs/plans/hobby) · product guardrails: [GUARDRAILS.md](./GUARDRAILS.md).

---

## 6. Mobile after web is live

1. Deploy web and copy the HTTPS origin (e.g. `https://teamcompass.vercel.app`).  
2. On the phone home screen, set the server to that origin (no trailing path).  
3. Create/join with the same six-character codes.

---

## 7. Verify

```bash
npm test
npm run build
```

Smoke: create room → second client join → phase/op → reload both clients (data must survive).

---

## 8. Rollback / local

- Local without Redis: unset Upstash vars (or `CADENCE_STORE=file`).  
- Production issues: check Vercel runtime logs and Upstash dashboard; redeploy previous deployment from the Vercel UI if needed.
