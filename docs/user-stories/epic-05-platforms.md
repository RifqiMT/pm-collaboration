# Epic E5 — Platforms & Sync

**Goal:** Web and mobile clients share one room document and one rule engine.

---

## US-5.1 Collaborate on the web

**As** any persona  
**I want** the full board experience in the browser  
**So that** facilitation and deep editing work well on a laptop  

**Acceptance criteria**

- [ ] Home, create, and room routes render  
- [ ] Ritual boards load for all three kinds  
- [ ] Skip link and focus styles present  

**PRD:** FR-P1 · **Code:** `apps/web/src/app/**`, components

---

## US-5.2 Collaborate on mobile

**As** Jordan  
**I want** to join and participate from my phone  
**So that** I am not blocked when my laptop is unavailable  

**Acceptance criteria**

- [ ] Home/create/room flows exist in Expo app  
- [ ] Server base URL is configurable  
- [ ] Ops apply through the same API  

**PRD:** FR-P2 · **Code:** `apps/mobile/App.js`, `src/api.js`

---

## US-5.3 Shared domain rules

**As** the product team  
**I want** scoring, privacy, and ops in `@cadence/core`  
**So that** web and mobile cannot diverge on business logic  

**Acceptance criteria**

- [ ] Both clients depend on `@cadence/core`  
- [ ] Vitest covers templates, privacy, votes, scoring, parseOp  

**PRD:** FR-P3, NFR-1 · **Code:** `packages/core`

---

## US-5.4 Poll for freshness

**As** a participant  
**I want** the board to refresh while the tab is open  
**So that** I see others’ edits without a manual reload  

**Acceptance criteria**

- [ ] Web: visible poll ≈ 1.5s; hidden ≈ 8s  
- [ ] Mobile: fixed poll ≈ 2s  
- [ ] Stale (older version) snapshots are ignored  
- [ ] Ops are serialized on the client to reduce races  

**PRD:** FR-P5 · **Code:** `use-room.ts`, `apps/mobile/App.js`

---

## US-5.5 Optimistic text fields

**As** a participant  
**I want** text fields to keep my typing until I commit  
**So that** polling does not clobber mid-edit  

**Acceptance criteria**

- [ ] Commit on blur or Enter (single-line)  
- [ ] Failed save restores previous value  
- [ ] Remote updates apply when not editing  

**PRD:** related NFR UX · **Code:** `shared-field.tsx`
