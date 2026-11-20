# Epic E2 — Retrospective

**Goal:** Facilitate a complete retro from warm-up through owned actions and exportable summary.

---

## US-2.1 Choose a template

**As** Maya  
**I want** column templates grouped by format and by the kind of story  
**So that** the board matches the team’s energy and still maps to keep/stop/try decisions  

**Acceptance criteria**

- [ ] All 62 `RetroTemplateId` values create correct columns (3, 4, or 5 columns)  
- [ ] Column hints describe the decision each column represents  
- [ ] Eight shelves: Classic, Film, Series, Anime, Games, Sport, Music, Food  
- [ ] Picker lists each shelf A–Z; search matches name, blurb, column title, column count, or shelf  
- [ ] Shelf and column-count filters work on web and mobile create flows  
- [ ] Glyphs cover every template  

**PRD:** FR-RET2 · **Code:** `RETRO_TEMPLATES`, `searchRetroTemplates`, `new-room-form.tsx`, mobile create, `retro-glyphs.tsx`

---

## US-2.2 Run an icebreaker

**As** Maya / Jordan  
**I want** a short warm-up game before notes  
**So that** the team arrives ready to write  

**Acceptance criteria**

- [ ] Host selects among 21 icebreakers  
- [ ] Participants submit answers within game-specific limits  
- [ ] This or That supports host-written pairs (1–8) with distinct sides  
- [ ] Two truths supports guess/reveal flows  
- [ ] Health Check requires six scores from 1–7; peers see anonymized spreads/averages (not named authors); CSV author is Anonymous  
- [ ] Travel Wishlist accepts one to five countries from the shared catalog; web map + flags; CSV/summary use country names  
- [ ] Lineup lets the host name the order, then each person arranges every participant; a new title clears shared orders  

**PRD:** FR-RET4, FR-RET5 · **Code:** `ICEBREAKERS`, `HEALTH_CHECK`, `countries.ts`, `parsePeopleOrder`, `icebreaker-panel.tsx`, `travel-map.tsx`, `people-order.tsx`, `retro.setOrderTitle`, mobile Health/Travel/Lineup screens

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

## US-2.4b Raise hand in Discuss

**As** Jordan  
**I want** to raise my hand during Discuss  
**So that** the room sees a fair speaking queue without exposing anonymous authorship  

**Acceptance criteria**

- [ ] `retro.raiseHand` works only in Discuss (`phase` error otherwise)  
- [ ] Desired-state: raising when already raised is a no-op; lowering removes the id  
- [ ] Queue order is append order in `raisedHands`  
- [ ] Changing phase clears `raisedHands`  
- [ ] Named notes authored by a raised person highlight; anonymous notes highlight only for the raiser’s own card  
- [ ] Web and mobile both expose raise/lower controls  

**PRD:** FR-RET12 · **Code:** `retro.raiseHand`, `handUp()` in `retro-board.tsx` / `App.js`, tests in `room.test.ts`

---

## US-2.5 Dot vote with a budget

**As** Jordan  
**I want** a fixed number of dots to place  
**So that** prioritization is fair  

**Acceptance criteria**

- [ ] Default votes per person is 3; any joined person can set 1–10 on web (not host-gated)  
- [ ] Web UI offers presets 1 / 2 / 3 plus Custom  
- [ ] Voting uses desired state (`voting: true|false`)  
- [ ] Exceeding budget returns `votes` error  
- [ ] Lowering budget removes excess newest dots  
- [ ] Notes are not editable during vote phase  
- [ ] Mobile may omit vote-budget chrome; budget set from web still applies  

**PRD:** FR-RET7 · **Code:** `retro.vote`, `retro.setVotesPerPerson`, `DOT_PRESETS`

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

- [ ] Web UI presets 3, 5, 8 minutes plus Custom whole minutes 1–60  
- [ ] Server still clamps timer seconds to 30–3600  
- [ ] Stopwatch accrues while the section is active  
- [ ] Summary has no timer/stopwatch controls  
- [ ] Mobile may omit timer chrome; server timers still apply if started from web  

**PRD:** FR-RET9 · **Code:** timers in `RetroState`, `PhaseTimer` (web)

---

## US-2.8 Summary, CSV, and PPT export

**As** Maya  
**I want** a summary view with CSV and PPT download  
**So that** I can share outcomes without retyping  

**Acceptance criteria**

- [ ] Summary lists notes by column, votes, actions, icebreaker answers  
- [ ] CSV includes section stopwatch/countdown seconds  
- [ ] Web PPT download builds a deck (icebreaker, durations, discuss order, overview, categories, top votes, actions) via `retrospectiveDeck` + `buildRetroPptx`  
- [ ] Web download and mobile CSV share paths work (PPT is web-first)  

**PRD:** FR-RET10 · **Code:** `retro-export.ts`, `retro-deck.ts`, `lib/retro-pptx.ts`, summary UI (`.summary-downloads*`)

---

## US-2.9 Host-gated phase changes

**As** Maya  
**I want** only the host to change sections  
**So that** the meeting does not skip ahead accidentally  

**Acceptance criteria**

- [ ] Non-host `retro.setPhase` fails with `host`  
- [ ] UI disables phase controls for non-hosts  

**PRD:** FR-RET1 · **Code:** `applyRetro`, `retro-board.tsx`
