# TeamCompass — Deployment (single-process file store)

**Audience:** Operators hosting `@cadence/web`  
**Preferred model:** One Node process + local `rooms.json` (no Redis)  
**Last updated:** 2026-11-11  

Mobile (`@cadence/mobile`) stays on Expo. Point the phone at your web origin after deploy.

---

## 1. Why not Vercel (without Redis)

TeamCompass was built for **one writer** and a local JSON file (`CADENCE_DATA_DIR/rooms.json`).

**Vercel Functions** have no durable shared disk. Without Upstash Redis, create-room fails in production. If you want **local-only storage**, do **not** use Vercel as the API host—use a single long-running Node/Docker host instead.

| Host | Local file store | Notes |
| --- | --- | --- |
| **Local / LAN** | Yes | `npm run dev` / `npm run start` |
| **Render / Fly / Railway / VPS (Docker)** | Yes | Preferred public host for Option A |
| **Vercel Hobby** | No | Needs Redis — see §7 (optional) |

---

## 2. What deploys

| App | Host | Notes |
| --- | --- | --- |
| `@cadence/web` | Single Node/Docker process | UI + room API + file store |
| `@cadence/mobile` | Expo / device | Set server base URL to the HTTPS origin |
| `@cadence/core` | Bundled into web | `transpilePackages` |

---

## 3. Environment (file store)

See [`.env.example`](../.env.example).

| Variable | Recommended | Purpose |
| --- | --- | --- |
| `CADENCE_STORE` | `file` | Force JSON file backend |
| `CADENCE_DATA_DIR` | `/data` (containers) | Directory for `rooms.json` + lock |
| `PORT` | `3000` or platform `$PORT` | HTTP listen port |
| `HOSTNAME` | `0.0.0.0` (containers) | Bind all interfaces |

Do **not** set `UPSTASH_*` for this path.

---

## 4. Docker (recommended)

Repo root includes `Dockerfile` + `.dockerignore`.

```bash
docker build -t teamcompass .
docker run --rm -p 3000:3000 -v teamcompass-data:/data teamcompass
```

Open http://localhost:3000 — rooms persist in the `teamcompass-data` volume.

---

## 5. Render (free Blueprint)

1. Push this repo to GitHub.  
2. [Render](https://render.com) → **New** → **Blueprint** → select the repo (`render.yaml`).  
3. Deploy the `teamcompass` web service (Docker, free plan).  
4. Open the `*.onrender.com` URL; create a room from two browsers.

**Caveat:** Free instances sleep and usually **have no persistent disk**. Rooms may reset after sleep/redeploy. For durable local files, add a persistent disk (paid) or use Fly with a volume / any VPS.

Native Node alternative (no Docker): set build `npm ci && npm run build`, start `npm run start -w @cadence/web -- -H 0.0.0.0`, and `CADENCE_STORE=file`.

---

## 6. Fly.io

```bash
fly apps create teamcompass          # pick a unique name; sync fly.toml app =
fly volumes create cadence_data --region fra --size 1
# uncomment [[mounts]] in fly.toml
fly deploy
```

Without a volume, `/data` is ephemeral. With a volume, `rooms.json` survives Machine restarts.

---

## 7. Optional: Vercel + Supabase (remote store)

Vercel Functions cannot use the local JSON file. Use **Supabase** (or Redis) for rooms.

1. In Supabase → **SQL Editor**, run [`docs/supabase-schema.sql`](./supabase-schema.sql).  
   Keys alone cannot create tables — this SQL step is mandatory.  
2. Vercel project → **Settings → Environment Variables** (Production + Preview):
   - `SUPABASE_URL` = `https://YOUR_PROJECT.supabase.co`
   - `SUPABASE_SECRET_KEY` = `sb_secret_…` (preferred; Settings → API Keys)  
     or `SUPABASE_PUBLISHABLE_KEY` = `sb_publishable_…` (works with the schema’s anon policy)
   - Legacy JWT `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY` still work
   - Optional: `CADENCE_STORE=supabase`
3. Redeploy the Vercel project after changing env vars.  
4. Smoke-test create-room on `/new`.

**Do not commit keys.** If a key was pasted into chat, rotate it in Supabase → Settings → API Keys.

### Optional: Vercel + Redis

Set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` instead (or as well; Supabase wins when both are set).

---

## 8. Mobile

1. Copy the HTTPS origin of your single-process host.  
2. On the phone home screen, set that origin (no path).  
3. Join with the same six-character codes.

---

## 9. Verify

```bash
npm test
npm run build
npm run start
```

Smoke: create room → second client join → op → reload both (data must survive process restart if using a volume/disk).

---

## 10. Trust model

Room code is the only key. CORS is open for mobile. Prefer a trusted network or accept that a public URL is code-gated only. Full limits: [GUARDRAILS.md](./GUARDRAILS.md).
