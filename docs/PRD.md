# TeamCompass — Product Requirements Document (PRD)

| Field | Value |
| --- | --- |
| Product | TeamCompass |
| Document version | 1.0 |
| Status | Living — aligned to shipped code 0.1.0 / mobile 1.0.0 |
| Owner | Product team |
| Engineering namespace | `@cadence/*` |
| Last updated | 2026-11-11 |

---

## 1. Problem statement

Sprint rituals often fragment across sticky notes, slides, spreadsheets, and chat. Teams lose:

- a single shared artifact for the meeting  
- private brainstorming that becomes a fair discuss phase  
- a clear release decision after review  
- comparable scores that sit next to complexity and business outcomes  

TeamCompass solves this with one code-joined room per ritual, shared rules on web and phone, and explicit facilitation phases.

---

## 2. Goals

| ID | Goal | Success signal |
| --- | --- | --- |
| G1 | Start a ritual in under one minute | Create → share code → second person joins |
| G2 | Safe private brainstorm then fair discuss | Others’ note bodies never leave server in brainstorm |
| G3 | Leave retros with owned actions and exportable record | Actions assigned; CSV download works |
| G4 | Close reviews with one decision | Ship / iterate / hold + notes recorded |
| G5 | Compare roadmap bets consistently | Same formulas on web and mobile; quadrants readable |
| G6 | Work on laptop and phone against one room | Mobile configured to web API; ops apply |

### Non-goals (current release)

- User accounts, SSO, RBAC, audit logs beyond room JSON  
- Multi-region / multi-instance durable storage  
- Real-time WebSocket sync  
- Billing, orgs, workspaces, permanent history beyond the file store  
- AI facilitation or automated note clustering  
- Public internet multi-tenant hardening  

---

## 3. Users and personas

| Persona | Role in rituals | Doc |
| --- | --- | --- |
| Maya — Facilitator / Scrum Master | Host, phases, timers, icebreaker | [persona-facilitator.md](./personas/persona-facilitator.md) |
| Jordan — Contributor / IC | Notes, votes, checklist, feedback | [persona-contributor.md](./personas/persona-contributor.md) |
| Priya — Stakeholder / Product Lead | Review decision, roadmap scoring | [persona-stakeholder.md](./personas/persona-stakeholder.md) |

---

## 4. Functional requirements

### 4.1 Room lifecycle

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-R1 | User can create a room for retro, review, or roadmap | Must |
| FR-R2 | System issues a unique 6-character room code (ambiguous chars excluded) | Must |
| FR-R3 | User can join with code + display name | Must |
| FR-R4 | Identity persists locally across sessions on the same device | Should |
| FR-R5 | Participants show active/inactive based on 20s lastSeen window | Should |
| FR-R6 | Room title can be renamed by a joined participant | Should |
| FR-R7 | Demo seed data optional at create | Could |
| FR-R8 | Enforce participant and content hard limits with clear errors | Must |

### 4.2 Retrospective

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-RET1 | Host advances through icebreak, brainstorm, discuss, vote, act, summary | Must |
| FR-RET2 | 34 templates available at create | Must |
| FR-RET3 | Brainstorm privacy: only own notes visible until discuss | Must |
| FR-RET4 | Icebreaker games (18) with host selection | Must |
| FR-RET5 | This or That host-custom pairs (1–8) | Should |
| FR-RET6 | Discuss status or author walk | Must |
| FR-RET7 | Dot vote with configurable budget 1–10 (default 3) | Must |
| FR-RET8 | Actions with owner and done; creatable from notes | Must |
| FR-RET9 | Per-section countdown + stopwatch (not on summary) | Should |
| FR-RET10 | Summary view + CSV export of full retro data | Must |
| FR-RET11 | Column glyphs grow with note volume | Could |

### 4.3 Sprint review

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-REV1 | Seeded multi-section checklist with required items | Must |
| FR-REV2 | Multi-signer checks (desired state) | Must |
| FR-REV3 | Item notes and custom items | Should |
| FR-REV4 | Sprint goal field | Must |
| FR-REV5 | Feedback kinds: praise, change, question | Must |
| FR-REV6 | Decision ship / iterate / hold + notes | Must |

### 4.4 Roadmap

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-RM1 | Frameworks RICE, ICE, value-complexity | Must |
| FR-RM2 | Complexity as average of technical, dependency, uncertainty | Must |
| FR-RM3 | Score vs complexity chart with 3.5 and median guides | Should |
| FR-RM4 | Quadrants and insight copy | Must |
| FR-RM5 | Horizon now/next/later and owner | Should |
| FR-RM6 | Objective field for the board | Should |

### 4.5 Platforms & API

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-P1 | Web app serves UI and API | Must |
| FR-P2 | Mobile Expo app creates/joins/edits rooms | Must |
| FR-P3 | Shared core package for ops, privacy, scoring | Must |
| FR-P4 | HTTP API: create, get, join, ops | Must |
| FR-P5 | Clients poll for freshness | Must |

---

## 5. Non-functional requirements

| ID | Requirement |
| --- | --- |
| NFR-1 | Domain logic covered by Vitest unit tests in `@cadence/core` |
| NFR-2 | Request body size capped (~100KB) |
| NFR-3 | Store uses file lock + in-process queue; single writer process |
| NFR-4 | Accessible focus styles and skip link on web |
| NFR-5 | Graceful user-facing errors for domain failures (host, phase, votes, etc.) |
| NFR-6 | No secrets in repository; room data path gitignored |
| NFR-7 | Node ≥ 20 for workspaces |

---

## 6. Acceptance criteria (release-level)

1. Two browsers can join the same room and see each other’s allowed edits within a few seconds of polling.  
2. During brainstorm, participant A never receives participant B’s note text from the API.  
3. Host-only ops fail for non-hosts with a clear error.  
4. RICE example `(400 × 2 × 0.8) / 2 = 320` matches `scoreInitiative`.  
5. Complexity ≥ 3.5 with score ≥ median maps to `big-bet`.  
6. Retro CSV export includes notes, votes, actions, icebreaker answers, and section timings.  
7. Mobile can complete create → join → mutate against a LAN-hosted web API.  

Traceability to stories and code: [TRACEABILITY_MATRIX.md](./TRACEABILITY_MATRIX.md).

---

## 7. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Room code leakage | Unauthorized join | Trusted network; short-lived ritual rooms; communicate trust model |
| File store / Hobby Redis | Data loss / free-tier limits | Local: one writer; Vercel: Upstash Redis — see DEPLOYMENT.md |
| Polling lag | Feels “not live” | 1.5s visible poll; version ignore for stale |
| Package name ≠ brand | Confusion | Document Cadence namespace vs TeamCompass brand |
| Mobile API URL misconfig | Cannot join | Clear home-screen server field + README examples |

---

## 8. Milestones (historical → current)

| Milestone | Outcome |
| --- | --- |
| M0 Domain core | Types, room ops, scoring, templates, tests |
| M1 Web rooms | Next.js UI + JSON API + polling |
| M2 Ritual depth | Icebreaker suite, discuss walks, timers, summary/CSV |
| M3 Roadmap & review polish | Quadrants, insights, multi-signer checklist |
| M4 Mobile peer client | Expo app sharing core + API |
| M5 Documentation standard | This PRD set and enterprise docs (2026-11) |

---

## 9. Open decisions (not blocking shipped MVP)

- Persistent durable DB and multi-instance store  
- Optional passwords or expiring rooms  
- WebSocket / SSE push  
- Align npm package names to TeamCompass branding  
- Include mobile in root npm workspaces  

---

## 10. References

- [PRODUCT.md](./PRODUCT.md)  
- [user-stories/](./user-stories/)  
- [VARIABLES.md](./VARIABLES.md)  
- [GUARDRAILS.md](./GUARDRAILS.md)  
- Source: `packages/core`, `apps/web`, `apps/mobile`
