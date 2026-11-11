# Epic E4 — Roadmap Scoring

**Goal:** Score initiatives with familiar frameworks while treating complexity as a first-class lens.

---

## US-4.1 Choose a scoring framework

**As** Priya  
**I want** to switch among RICE, ICE, and value/complexity  
**So that** the workshop matches our prioritization language  

**Acceptance criteria**

- [ ] Framework change recalculates scores via `scoreRoadmap`  
- [ ] Formula help text matches `FRAMEWORKS`  

**PRD:** FR-RM1 · **Code:** `roadmap.setFramework`, `scoring.ts`

---

## US-4.2 Capture outcome and assumption

**As** Priya  
**I want** business outcome and assumption on each initiative  
**So that** score is never divorced from intent  

**Acceptance criteria**

- [ ] Fields patch and display on the card  
- [ ] Length limits enforced  

**PRD:** FR-RM6 (objective) + initiative fields · **Code:** `Initiative`, patch op

---

## US-4.3 Enter RICE / ICE / value inputs

**As** Maya / Priya  
**I want** constrained numeric inputs with Intercom impact options  
**So that** scores stay comparable  

**Acceptance criteria**

- [ ] RICE: reach, impact ∈ {0.25,0.5,1,2,3}, confidence 0–1, effort 0.25–240  
- [ ] ICE: three integers 1–10  
- [ ] Value 1–10; complexity dimensions 1–5  
- [ ] Example `(400×2×0.8)/2 = 320` holds  

**PRD:** FR-RM1, FR-RM2 · **Code:** `scoreInitiative`, `IMPACT_OPTIONS`

---

## US-4.4 Read complexity and quadrants

**As** Priya  
**I want** complexity averaged and plotted against score  
**So that** I can separate do-first work from big bets  

**Acceptance criteria**

- [ ] Complexity index = average of three ratings (2 decimals)  
- [ ] Heavy threshold is 3.5  
- [ ] Strong threshold is median score  
- [ ] Quadrants map to do-first / big-bet / fill-in / reconsider  
- [ ] Insights warn on thin confidence and narrow reach  

**PRD:** FR-RM2–FR-RM4 · **Code:** `HIGH_COMPLEXITY`, `scoreRoadmap`, chart in `roadmap-board.tsx`

---

## US-4.5 Sequence with horizon and owner

**As** Priya  
**I want** now/next/later and an owner on each bet  
**So that** sequencing is explicit after scoring  

**Acceptance criteria**

- [ ] Horizon patches apply  
- [ ] Owner must be a room participant or null  

**PRD:** FR-RM5 · **Code:** `Initiative.horizon`, `ownerId`

---

## US-4.6 Manage initiative list

**As** Priya  
**I want** to add, patch, and delete initiatives up to the room cap  
**So that** the workshop board stays manageable  

**Acceptance criteria**

- [ ] Max 40 initiatives  
- [ ] Blank initiative uses documented defaults  
- [ ] Rank/bar reflect relative scores  

**PRD:** FR-R8 · **Code:** roadmap initiative ops
