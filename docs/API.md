# TeamCompass — API Reference

**Base URL:** origin of the web app (e.g. `http://localhost:3000`)  
**Content-Type:** `application/json`  
**CORS:** `Access-Control-Allow-Origin: *`  
**Caching:** `Cache-Control: no-store`  
**Runtime:** Node.js (`force-dynamic`)  
**Last updated:** 2026-11-12  

---

## 1. Conventions

| Topic | Rule |
| --- | --- |
| Room code | Exactly 6 alphanumeric characters (case-insensitive on join path; stored uppercase) |
| Actor | Participant `id` from create/join; required for ops |
| Success | JSON body with `room` (`RoomView`) and sometimes `participant` |
| Domain error | `CadenceError` → **404** if `code === "missing"`, else **400** |
| Unexpected | **500** |
| OPTIONS | All routes answer **204** for CORS preflight |
| Body size | Cap ~100,000 characters (`http.ts`) |

`RoomView` is the privacy-filtered presentation of a `Room` for a given actor.

---

## 2. Endpoints

### 2.1 Create room

`POST /api/rooms`

**Body**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `kind` | `"retro" \| "review" \| "roadmap"` | Yes | Ritual type |
| `title` | string | No | Max 80 |
| `hostName` | string | No | Max 40 |
| `hostId` | string | No | Stable `person_…` id |
| `templateId` | RetroTemplateId | No | Retro only |
| `demo` | boolean | No | Seed demo content |

**Response:** `201` `{ room: RoomView, participant }`

---

### 2.2 Get room

`GET /api/rooms/[code]?actorId=`

| Query | Purpose |
| --- | --- |
| `actorId` | Optional; when present, marks presence and filters privacy for that actor |

**Response:** `200` `{ room: RoomView }`

---

### 2.3 Join room

`POST /api/rooms/[code]/join`

**Body:** `{ id: string, name: string }`

**Response:** `200` `{ room: RoomView, participant }`

Fails with `full` if participants ≥ 40.

---

### 2.4 Apply operation

`POST /api/rooms/[code]/ops`

**Body:** `{ actorId: string, op: Op }`

`op` is validated by `parseOp` in `@cadence/core`.

**Response:** `200` `{ room: RoomView }`

---

## 3. Operation catalog (`Op`)

### Room & presence

| `type` | Fields | Notes |
| --- | --- | --- |
| `room.rename` | `title` | |
| `presence.rename` | `name` | |

### Retrospective — cards & votes

| `type` | Fields | Notes |
| --- | --- | --- |
| `retro.addCard` | `columnId`, `body`, `anonymous` | Brainstorm phase |
| `retro.editCard` | `cardId`, `body` | Own card; phase-gated |
| `retro.moveCard` | `cardId`, `columnId` | |
| `retro.deleteCard` | `cardId` | |
| `retro.vote` | `cardId`, `voting` | Desired state; vote phase |

### Retrospective — facilitation

| `type` | Fields | Notes |
| --- | --- | --- |
| `retro.setPhase` | `phase` | Host only |
| `retro.setIcebreaker` | `game` | Host only |
| `retro.setIcebreakerPairs` | `pairs[]` | Host only; This or That |
| `retro.answerIcebreaker` | `body`, `round?` | |
| `retro.guessIcebreaker` | `targetId`, `index` | Two truths |
| `retro.revealIcebreaker` | — | |
| `retro.nextIcebreakerRound` | `step` | Host only |
| `retro.setVotesPerPerson` | `count` | 1–10 |
| `retro.startTimer` | `seconds`, `phase?` | 30–3600 |
| `retro.clearTimer` | `phase?` | |
| `retro.focusCard` | `cardId \| null` | Discuss |
| `retro.setDiscussionBy` | `by: status\|author` | Host only |
| `retro.focusGroup` | `key` | Column id, author id, or `anonymous` |
| `retro.raiseHand` | `raised` | Discuss only; desired-state speak queue. Cleared on phase change. |

### Retrospective — actions

| `type` | Fields |
| --- | --- |
| `retro.addAction` | `body`, `sourceCardId?` |
| `retro.setActionDone` | `actionId`, `done` |
| `retro.assignAction` | `actionId`, `ownerId` |
| `retro.deleteAction` | `actionId` |

### Review

| `type` | Fields |
| --- | --- |
| `review.setItemDone` | `itemId`, `done` |
| `review.setItemNote` | `itemId`, `note` |
| `review.addItem` | `sectionId`, `label` |
| `review.setGoal` | `goal` |
| `review.addFeedback` | `body`, `kind` |
| `review.deleteFeedback` | `feedbackId` |
| `review.setDecision` | `decision` |
| `review.setDecisionNotes` | `notes` |

### Roadmap

| `type` | Fields |
| --- | --- |
| `roadmap.setFramework` | `framework` |
| `roadmap.setObjective` | `objective` |
| `roadmap.addInitiative` | — |
| `roadmap.patchInitiative` | `initiativeId`, `patch` |
| `roadmap.deleteInitiative` | `initiativeId` |

`InitiativePatch` may include title, outcome, assumption, RICE/ICE/value fields, complexity fields, horizon, ownerId.

---

## 4. Common error codes

| Code | Meaning |
| --- | --- |
| `missing` | Room or entity not found |
| `actor` | Not joined / invalid participant |
| `host` | Host-only operation |
| `phase` | Wrong retro phase |
| `private` | Note still private |
| `votes` | Vote budget exhausted |
| `limit` | Hit a `LIMITS` cap |
| `full` | Room participant cap |
| `kind` | Wrong ritual for op |
| `store` | File lock busy |
| `code` | Invalid / exhausted room code |
| `text` / `choice` / `type` | Validation |

---

## 5. Client integration notes

1. Persist `personId` + name locally; reuse as `hostId` / join `id`.  
2. After each op, replace local room if returned `version` is newer.  
3. Poll GET with `actorId` to refresh presence and privacy-correct views.  
4. Mobile must set API base to the machine running `@cadence/web`, not `localhost` on the phone itself (unless simulator).  

Implementation: `apps/web/src/app/api/rooms/**`, `apps/web/src/server/{http,store}.ts`, `packages/core/src/room.ts`.
