# Epic E1 — Rooms & Presence

**Goal:** Anyone on the trusted network can create or join a ritual room with a short code and a display name.

---

## US-1.1 Create a ritual room

**As** Maya (Facilitator)  
**I want** to create a retrospective, sprint review, or roadmap room  
**So that** my team can join one shared board immediately  

**Acceptance criteria**

- [ ] Choosing a ritual on the home page opens create with that `kind`  
- [ ] Submitting create returns a 6-character code and navigates to `/r/[code]`  
- [ ] Creator is host (`hostId`) and a participant  
- [ ] Optional title and host name are persisted within limits  

**PRD:** FR-R1, FR-R2 · **Code:** `POST /api/rooms`, `new-room-form.tsx`, `createRoom`

---

## US-1.2 Join with a room code

**As** Jordan (Contributor)  
**I want** to enter a six-character code and my name  
**So that** I can collaborate without creating an account  

**Acceptance criteria**

- [ ] Invalid length codes show a clear error  
- [ ] Join adds me to `participants` with a palette color  
- [ ] Re-join with same id updates name/presence rather than duplicating incorrectly  
- [ ] At 40 participants, join fails with a full-room message  

**PRD:** FR-R3, FR-R8 · **Code:** `POST …/join`, `room-app.tsx`, `identity.ts`

---

## US-1.3 Persist identity on device

**As** Jordan  
**I want** my person id and name remembered on this browser/phone  
**So that** the next room I create or join recognizes me  

**Acceptance criteria**

- [ ] Web stores identity in localStorage  
- [ ] Mobile stores identity in AsyncStorage  
- [ ] Create uses stored `hostId` when present  

**PRD:** FR-R4 · **Code:** `identity.ts`, mobile `App.js`

---

## US-1.4 See who is active

**As** Maya  
**I want** to see who is currently in the room  
**So that** I know whether people are still with us  

**Acceptance criteria**

- [ ] Participants with `lastSeen` within 20 seconds show as active  
- [ ] Polling/get/ops refresh `lastSeen` for the actor  

**PRD:** FR-R5 · **Code:** `ACTIVE_MS`, `presentRoom`, `use-room.ts`

---

## US-1.5 Rename room or self

**As** a joined participant  
**I want** to rename the room title or my display name  
**So that** the board matches the meeting context  

**Acceptance criteria**

- [ ] `room.rename` updates title (≤80)  
- [ ] `presence.rename` updates name (≤40)  

**PRD:** FR-R6 · **Code:** `applyOp`, `room-app.tsx`

---

## US-1.6 Create a demo room

**As** Maya  
**I want** optional demo content when creating a room  
**So that** I can explore the product without inventing data  

**Acceptance criteria**

- [ ] `demo: true` seeds participants/content via `fillDemo`  
- [ ] Demo is clearly for exploration, not a real ritual record  

**PRD:** FR-R7 · **Code:** `fillDemo` in `room.ts`, create form
