# TeamCompass — API Reference

**Base URL:** origin of the web app (e.g. `http://localhost:3000`)  
**Content-Type:** `application/json`  
**CORS:** `Access-Control-Allow-Origin: *`  
**Caching:** `Cache-Control: no-store`  
**Runtime:** Node.js (`force-dynamic`)  
**Last updated:** 2026-11-22 (product requirements + artifact examples)  

---

## 1. Conventions

| Topic | Rule |
| --- | --- |
| Room code | Exactly 6 alphanumeric characters (case-insensitive on join path; stored uppercase) |
| Actor | Participant `id` from create/join; required for ops |
| Success | JSON body with `room` (`RoomView`) and sometimes `participant` |
| Domain error | `CadenceError` → **404** if `code === "missing"`; **503** if `code === "store"`; else **400** |
| Unexpected | **500** |
| OPTIONS | All routes answer **204** for CORS preflight |
| Body size | Cap ~100,000 characters (`http.ts`) |
| Error class | `fail()` duck-types `CadenceError` by `name` + `code` when bundlers duplicate the class |

`RoomView` is the privacy-filtered presentation of a `Room` for a given actor.

---

## 2. Endpoints

### 2.1 Create room

`POST /api/rooms`

**Body**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `kind` | `"retro" \| "planning" \| "refinement" \| "review" \| "roadmap" \| "direction" \| "prd" \| "artifacts"` | Yes | Ritual type. Planning, refinement, and product requirements use the review checklist ops. Direction uses `direction.setFramework` and `direction.setAnswer`. Artifact examples use `artifacts.setArtifact` and `artifacts.setProduct`. |
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
| `retro.setIcebreaker` | `game` (`IcebreakerId`, 21 values incl. `health-check`, `travel-wishlist`, `lineup`) | Host only |
| `retro.setIcebreakerPairs` | `pairs[]` | Host only; This or That |
| `retro.setOrderTitle` | `title` (max 80) | Host only; Lineup. A changed title clears shared lineup orders |
| `retro.answerIcebreaker` | `body`, `round?` — Health Check: six `1–7` ints joined by `,`; Travel Wishlist: 1–5 ISO codes joined by `,`; Lineup: every participant id, once, joined by `,` | Validated per `IcebreakerMode` (`scale` / `map` / `order` / …) |
| `retro.guessIcebreaker` | `targetId`, `index` | Two truths |
| `retro.revealIcebreaker` | — | |
| `retro.setVotesPerPerson` | `count` | 1–10; **not** host-gated |
| `retro.startTimer` | `seconds`, `phase?` | 30–3600; **not** host-gated |
| `retro.clearTimer` | `phase?` | **not** host-gated |
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

### Review, planning, and refinement

These ops apply when the room has a checklist (`review`, `planning`, `refinement`, or `prd`). `review.setDecision` must be one of the decisions for that kind. Planning: `commit` (Forecast), `reshape` (Narrow), `defer` (No goal). Refinement: `ready` (Selectable), `split` (Split), `park` (Return). Review: `ship` (Release), `iterate` (Adapt), `hold` (Hold). Product requirements: `baseline` (Ready for the backlog), `thin` (Thin the MVP), `open` (Still open). Any other value returns 400 with “That decision is not part of this checklist.”

| `type` | Fields | Notes |
| --- | --- | --- |
| `review.setItemDone` | `itemId`, `done` | |
| `review.setItemNote` | `itemId`, `note` | |
| `review.addItem` | `sectionId`, `label` | |
| `review.setSection` | `sectionId` | Shared focus section; must belong to the checklist; same section is a no-op |
| `review.setGoal` | `goal` | |
| `review.addFeedback` | `body`, `kind` | |
| `review.deleteFeedback` | `feedbackId` | |
| `review.setDecision` | `decision` | Kind-scoped |
| `review.setDecisionNotes` | `notes` | |

### Artifact examples

These ops apply when `kind` is `artifacts`. Prose is derived from catalogs; the room only stores the selected artifact and product.

| `type` | Fields |
| --- | --- |
| `artifacts.setArtifact` | `artifact` (`ArtifactId`, 8 values) |
| `artifacts.setProduct` | `product` (`ArtifactProductId`: `unified-agent` \| `contact-center` \| `cs-data`) |

### Roadmap

| `type` | Fields |
| --- | --- |
| `roadmap.setFramework` | `framework` |
| `roadmap.setObjective` | `objective` |
| `roadmap.addInitiative` | — |
| `roadmap.patchInitiative` | `initiativeId`, `patch` |
| `roadmap.deleteInitiative` | `initiativeId` |

`InitiativePatch` may include title, outcome, assumption, RICE/ICE/value fields, complexity fields, horizon, ownerId.

### Product direction

| `type` | Fields |
| --- | --- |
| `direction.setFramework` | `framework`: `vision-board`, `positioning`, `playing-to-win`, `strategy-kernel`, or `dhm` |
| `direction.setAnswer` | `fieldId`, `value` (max 800). The field must belong to the current framework. |

Switching framework keeps answers already stored. A prompt from another framework returns 400.

---

## 4. Common error codes

| Code | HTTP | Meaning |
| --- | --- | --- |
| `missing` | 404 | Room or entity not found |
| `store` | 503 | Persistence unavailable (lock busy, remote misconfigured, missing `cadence_store`, etc.) |
| `actor` | 400 | Not joined / invalid participant |
| `host` | 400 | Host-only operation |
| `phase` | 400 | Wrong retro phase |
| `private` | 400 | Note still private |
| `votes` | 400 | Vote budget exhausted |
| `limit` | 400 | Hit a `LIMITS` cap (or body too large) |
| `full` | 400 | Room participant cap |
| `kind` | 400 | Wrong ritual for op / create |
| `code` | 400 | Invalid / exhausted room code |
| `template` | 400 | Unknown retro template |
| `column` | 400 | Column not on this board |
| `section` | 400 | Checklist section missing |
| `duplicate` | 400 | Note already converted to an action |
| `owner` | 400 | Assignee not in the room |
| `game` | 400 | Icebreaker game mismatch |
| `guess` | 400 | Two-truths guess rules |
| `group` | 400 | Discuss group invalid / empty |
| `round` | 400 | Icebreaker pair/round invalid |
| `impact` | 400 | Impact not on Intercom scale |
| `op` | 400 | Unknown or malformed op |
| `json` | 400 | Request body not valid JSON |
| `text` / `choice` / `type` / `range` | 400 | Validation |

---

## 5. Client integration notes

1. Persist `personId` + name locally; reuse as `hostId` / join `id`.  
2. After each op, replace local room if returned `version` is newer.  
3. Poll GET with `actorId` to refresh presence and privacy-correct views.  
4. Mobile must set API base to the machine running `@cadence/web`, not `localhost` on the phone itself (unless simulator).  
5. Treat **503** `store` as retryable (lock contention or cold remote).  

Implementation: `apps/web/src/app/api/rooms/**`, `apps/web/src/server/{http,store,persistence}.ts`, `packages/core/src/room.ts`.
