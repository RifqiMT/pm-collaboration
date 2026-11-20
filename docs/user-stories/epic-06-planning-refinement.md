# Epic E6 — Sprint planning and backlog refinement

**Goal:** Leave planning with a commitment, and leave refinement with a ready call, using the same checklist habits as the sprint review.

---

## US-6.1 Plan the sprint on a shared checklist

**As** Maya / Jordan  
**I want** a seeded checklist for the goal, the slice, the capacity, and the commitment  
**So that** the room leaves with one planning call  

**Acceptance criteria**

- [ ] A planning room walks Why, What, How, and the Sprint Backlog, and each part shows how to do it  
- [ ] The Sprint Goal is the commitment. The selected items are a forecast  
- [ ] The room can record Forecast, Narrow, or No goal  
- [ ] Release, Adapt, and Hold are rejected on this checklist  

**PRD:** FR-PLN1, FR-PLN4 · **Code:** `content.ts`, `room.ts`, `review-board.tsx`, `App.js`

---

## US-6.2 Refine the backlog on a shared checklist

**As** Maya / Priya  
**I want** a seeded checklist for the outcome, the slice, and readiness  
**So that** the next sprint only pulls work the room has called ready  

**Acceptance criteria**

- [ ] A refinement room walks Detail, Split, Size, and Order, and each part shows how to do it  
- [ ] Developers size the item. The Product Owner orders it  
- [ ] The room can record Selectable, Split, or Return  
- [ ] Forecast and Release are rejected on this checklist  
- [ ] The review still inspects the Increment and adapts the Product Backlog, with its own how-to steps  

**PRD:** FR-REF1, FR-REF4 · **Code:** `createChecklistState`, `checklistRitual`, `ReviewBoard`
