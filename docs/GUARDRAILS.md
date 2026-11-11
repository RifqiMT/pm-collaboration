# TeamCompass — Guardrails

**Purpose:** Technical and business limitations that constrain product development.  
**Audience:** Engineers, PMs, designers, security reviewers  
**Last updated:** 2026-11-11  

Violating a hard guardrail without an approved architecture change is a product defect, not a stretch goal.

---

## 1. Trust & security (business)

| Guardrail | Limitation | Product implication |
| --- | --- | --- |
| **G-SEC-1 Room code access** | The six-character code is the only access control | Do not market as enterprise ACL/SSO product |
| **G-SEC-2 No accounts** | No authentication, authorization roles, or audit identity beyond local person ids | Host privileges are not cryptographically bound to a human |
| **G-SEC-3 Trusted network** | Designed for LAN/VPN/team-owned hosts | Do not expose casually on the public internet without additional controls |
| **G-SEC-4 Operator visibility** | Operator can read file store or Redis document | Brainstorm privacy is peer-to-peer within the room model, not operator-proof |
| **G-SEC-5 Open CORS** | API allows `*` | Convenient for mobile; inappropriate as sole public API hardening |
| **G-SEC-6 No E2E encryption** | Traffic and storage are plaintext to the server | Use TLS at the reverse-proxy layer if deployed beyond localhost |

**Business guideline:** Always communicate the trust model in onboarding and README.

---

## 2. Privacy (product promise boundaries)

| Guardrail | Limitation | Do / Don’t |
| --- | --- | --- |
| **G-PRIV-1 Server-side brainstorm filter** | Privacy depends on `presentRoom` | Do not “fix” privacy only in CSS/UI |
| **G-PRIV-2 Phase gates** | Editing/voting constrained by phase | Do not allow free-form cross-phase edits that break facilitation |
| **G-PRIV-3 Demo data** | Demo rooms contain fictional content | Do not treat demo exports as real retrospectives |
| **G-PRIV-4 Telemetry (future)** | If analytics are added | Do not log private note bodies |

---

## 3. Data & scalability (technical)

| Guardrail | Limitation | Do / Don’t |
| --- | --- | --- |
| **G-DATA-1 Document store** | File JSON locally; Upstash Redis document on Vercel | Do not run two Node writers against one file backend; use Redis on serverless |
| **G-DATA-2 In-process queue + lock** | Soft concurrency (file lock / Redis NX) | Do not assume CRDT or strong multi-region consistency |
| **G-DATA-3 Hobby durability** | Redis free-tier limits; file can be lost with disk | Do not promise enterprise multi-AZ durability without paid ops |
| **G-DATA-4 Hard caps** | See `LIMITS` | Do not raise caps casually without memory/perf review |
| **G-DATA-5 Last write wins** | Concurrent edits on same field | Do not promise CRDT-grade merge |
| **G-DATA-6 Body size ~100KB** | Request cap | Do not accept unbounded drawings/payloads |

---

## 4. Sync & realtime (technical)

| Guardrail | Limitation | Product implication |
| --- | --- | --- |
| **G-SYNC-1 Polling only** | ~1.5s visible / ~8s hidden | “Live” means near-live, not websocket instant |
| **G-SYNC-2 Version ignore** | Stale snapshots dropped | Clients must keep local version discipline |
| **G-SYNC-3 Desired-state ops** | Votes/checks are not toggles | UI must send intended boolean state |
| **G-SYNC-4 Presence approx** | 20s active window | Not a precise online roster |

---

## 5. Domain & scoring (product integrity)

| Guardrail | Limitation | Do / Don’t |
| --- | --- | --- |
| **G-SCORE-1 Core is source of truth** | Formulas live in `@cadence/core` | Do not reimplement RICE/ICE in UI |
| **G-SCORE-2 HIGH_COMPLEXITY = 3.5** | Quadrant heavy cut | Changing it is a product decision + docs/tests update |
| **G-SCORE-3 Impact Intercom scale** | Only 0.25–3 set | Do not invent alternate impact enums without migration |
| **G-SCORE-4 Insight thresholds** | confidence &lt; 0.6; reach &lt; 50 & effort ≥ 3 | Document if changed |
| **G-SCORE-5 Framework familiarity** | RICE / ICE / value÷complexity | Prefer teaching over inventing a fourth opaque score |

---

## 6. Facilitation model (business)

| Guardrail | Limitation | Implication |
| --- | --- | --- |
| **G-FAC-1 Host authority** | Phase, icebreaker, discuss mode | Product assumes a facilitator role |
| **G-FAC-2 Section isolation** | Each retro section shows its work | Resist “show everything always” feature requests |
| **G-FAC-3 Summary is terminal collection** | No timer/stopwatch on Summary | Keep Summary for export/review, not timed work |
| **G-FAC-4 One ritual per room** | `kind` fixed at create | No multi-ritual mashup room without redesign |

---

## 7. Platform & packaging (technical)

| Guardrail | Limitation | Implication |
| --- | --- | --- |
| **G-PLAT-1 Mobile outside workspaces** | Root npm scripts don’t run mobile | Document separate Expo workflow |
| **G-PLAT-2 Mobile needs API URL** | Phone ≠ server | Always configure LAN/emulator base URL |
| **G-PLAT-3 Brand vs package name** | UI TeamCompass / packages `@cadence` | Avoid renaming packages casually mid-release |
| **G-PLAT-4 Node ≥ 20** | Engines field | Don’t target older Node without testing |
| **G-PLAT-5 Light theme only** | No dark tokens shipped | Don’t half-implement dark mode |
| **G-PLAT-6 Prefer single-process host** | File store needs one Node writer + disk | Prefer Docker/Render/Fly/VPS; do not use Vercel Functions for file-only store |
| **G-PLAT-7 Vercel optional** | Functions need Redis if used | Redis is optional escape hatch only — not the preferred path |

---

## 8. Performance (engineering)

| Guardrail | Rule |
| --- | --- |
| **G-PERF-1** | Do not add per-keystroke full-room writes; keep SharedField commit semantics |
| **G-PERF-2** | Do not lower visible poll below ~1s without load evidence (store lock contention) |
| **G-PERF-3** | Raising `LIMITS.cards` / participants requires memory and file-size benchmarks |
| **G-PERF-4** | Drawing/GIF limits exist to protect JSON size—respect them |

Aligned with org Performance Guardrail: no silent regressions on critical paths without measurement.

---

## 9. Compliance & documentation

| Guardrail | Rule |
| --- | --- |
| **G-DOC-1** | Behavior changes update PRODUCT / VARIABLES / CHANGELOG |
| **G-DOC-2** | New requirements update PRD + Traceability Matrix |
| **G-DOC-3** | Do not document unshipped features as available |

---

## 10. Allowed evolution paths (approved directions)

These are **not** current features; they are the sanctioned ways out of hard limits:

1. Move beyond single Redis document to per-room keys / SQL + stronger transactions (Hobby path already uses Upstash)  
2. Add optional room passphrase or expiring codes  
3. Add SSE/WebSocket fan-out while keeping core ops identical  
4. Add auth if moving to multi-tenant SaaS (changes trust model entirely)  
5. Align package names to TeamCompass under a versioned rename plan  

Until one of these is approved and implemented, build **within** the guardrails above.

---

## 11. Quick checklist for new PRs

- [ ] Does this weaken brainstorm privacy?  
- [ ] Does this assume multiple server instances?  
- [ ] Does this duplicate scoring math outside core?  
- [ ] Does this raise limits without a rationale?  
- [ ] Does this contradict the trusted-network trust model in user-facing copy?  
- [ ] Are docs/tests updated?

Related: [ARCHITECTURE.md](./ARCHITECTURE.md) · [VARIABLES.md](./VARIABLES.md) · [PRD.md](./PRD.md)
