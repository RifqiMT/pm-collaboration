# Epic E2 — Retrospective

**Goal:** Facilitate a complete retro from warm-up through owned actions and exportable summary.

---

## US-2.1 Choose a template

**As** Maya  
**I want** classic and pop-culture column templates  
**So that** the board matches the team’s energy and still maps to keep/stop/try decisions  

**Acceptance criteria**

- [ ] All 34 `RetroTemplateId` values create correct columns  
- [ ] Column hints describe the decision each column represents  

**PRD:** FR-RET2 · **Code:** `content.ts` `RETRO_TEMPLATES`, create form

---

## US-2.2 Run an icebreaker

**As** Maya / Jordan  
**I want** a short warm-up game before notes  
**So that** the team arrives ready to write  

**Acceptance criteria**

- [ ] Host selects among 18 icebreakers  
- [ ] Participants submit answers within game-specific limits  
- [ ] This or That supports host-written pairs (1–8) with distinct sides  
- [ ] Two truths supports guess/reveal flows  

**PRD:** FR-RET4, FR-RET5 · **Code:** `icebreaker-panel.tsx`, icebreaker ops

---

## US-2.3 Write private notes

**As** Jordan  
**I want** to add notes only I can see during brainstorm  
**So that** I can be honest before discuss  

**Acceptance criteria**

- [ ] I can add/edit/move/delete my notes in brainstorm  
- [ ] API responses to others omit my note bodies until Discuss  
- [ ] Anonymous flag is respected in presentation rules  

**PRD:** FR-RET3 · **Code:** `presentRoom`, `retro.addCard*`, `retro-board.tsx`

---

## US-2.4 Discuss by status or author

**As** Maya  
**I want** to walk notes by column or by author  
**So that** discussion stays structured  

**Acceptance criteria**

- [ ] Only host sets `discussionBy`  
- [ ] Focusing a group filters/highlights the walk  
- [ ] Voting and action UI are not mixed into Discuss  

**PRD:** FR-RET6 · **Code:** `retro.setDiscussionBy`, `retro.focusGroup`

---

## US-2.5 Dot vote with a budget

**As** Jordan  
**I want** a fixed number of dots to place  
**So that** prioritization is fair  

**Acceptance criteria**

- [ ] Default votes per person is 3; host can set 1–10  
- [ ] Voting uses desired state (`voting: true|false`)  
- [ ] Exceeding budget returns `votes` error  
- [ ] Lowering budget removes excess newest dots  
- [ ] Notes are not editable during vote phase  

**PRD:** FR-RET7 · **Code:** `retro.vote`, `retro.setVotesPerPerson`

---

## US-2.6 Capture actions with owners

**As** Maya / Jordan  
**I want** actions with owners and done checks, optionally from a note  
**So that** the retro produces follow-through  

**Acceptance criteria**

- [ ] Actions have body, ownerId, done, optional sourceCardId  
- [ ] Cap of 80 actions enforced  
- [ ] Creating from a note that already has an action fails as duplicate  

**PRD:** FR-RET8 · **Code:** action ops, Actions panel

---

## US-2.7 Time each section

**As** Maya  
**I want** a countdown and a stopwatch per section  
**So that** we stay on schedule and can report how long we spent  

**Acceptance criteria**

- [ ] UI presets 3, 5, 8 minutes; custom within server 30–3600s  
- [ ] Stopwatch accrues while the section is active  
- [ ] Summary has no timer/stopwatch controls  

**PRD:** FR-RET9 · **Code:** timers in `RetroState`, `PhaseTimer`

---

## US-2.8 Summary and CSV export

**As** Maya  
**I want** a summary view and CSV download  
**So that** I can share outcomes without retyping  

**Acceptance criteria**

- [ ] Summary lists notes by column, votes, actions, icebreaker answers  
- [ ] CSV includes section stopwatch/countdown seconds  
- [ ] Web download and mobile share paths work  

**PRD:** FR-RET10 · **Code:** `retro-export.ts`, summary UI

---

## US-2.9 Host-gated phase changes

**As** Maya  
**I want** only the host to change sections  
**So that** the meeting does not skip ahead accidentally  

**Acceptance criteria**

- [ ] Non-host `retro.setPhase` fails with `host`  
- [ ] UI disables phase controls for non-hosts  

**PRD:** FR-RET1 · **Code:** `applyRetro`, `retro-board.tsx`
