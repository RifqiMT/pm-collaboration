# Epic E3 — Sprint Review

**Goal:** Walk a shared readiness bar, collect live feedback, and record one release decision.

---

## US-3.1 Use the seeded checklist

**As** Maya / Priya  
**I want** a structured checklist for the increment  
**So that** “ready to show” is explicit  

**Acceptance criteria**

- [ ] New review rooms receive seeded sections and items from `createReviewState`  
- [ ] Required items are marked  
- [ ] Progress reflects required items signed  

**PRD:** FR-REV1 · **Code:** `content.ts`, `review-board.tsx`

---

## US-3.2 Multi-signer checks

**As** Jordan  
**I want** to check an item without undoing someone else’s check on a double tap  
**So that** sign-off is reliable  

**Acceptance criteria**

- [ ] `doneBy` lists participant ids  
- [ ] Setting done uses desired state for the actor  
- [ ] Two people can both appear on the same item  

**PRD:** FR-REV2 · **Code:** `review.setItemDone`

---

## US-3.3 Evidence notes and custom items

**As** Priya  
**I want** notes on items and the ability to add custom lines  
**So that** the checklist matches this sprint’s evidence  

**Acceptance criteria**

- [ ] Item notes save up to limit  
- [ ] Custom items respect per-section cap (30)  

**PRD:** FR-REV3 · **Code:** `review.setItemNote`, `review.addItem`

---

## US-3.4 Sprint goal

**As** Priya  
**I want** a visible sprint goal on the board  
**So that** feedback stays oriented  

**Acceptance criteria**

- [ ] Goal editable and persisted (≤240)  

**PRD:** FR-REV4 · **Code:** `review.setGoal`

---

## US-3.5 Live feedback

**As** Jordan  
**I want** to leave praise, change, or question feedback  
**So that** stakeholders hear the room in real time  

**Acceptance criteria**

- [ ] Feedback stores kind + body + author  
- [ ] Cap of 100 feedback notes  
- [ ] Author can delete their feedback (per product rules in UI/ops)  

**PRD:** FR-REV5 · **Code:** `review.addFeedback`, `review.deleteFeedback`

---

## US-3.6 Release decision

**As** Priya  
**I want** to record ship, iterate, or hold with notes  
**So that** the meeting has a durable outcome  

**Acceptance criteria**

- [ ] Decision is one of ship | iterate | hold | null  
- [ ] Decision notes persist (≤2000)  

**PRD:** FR-REV6 · **Code:** `review.setDecision`, `review.setDecisionNotes`
