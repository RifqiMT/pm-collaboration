# TeamCompass — Product Metrics & OKRs

**Audience:** Product team, engineering leads, facilitators of internal adoption  
**Last updated:** 2026-11-11  
**Note:** TeamCompass MVP does not yet ship an analytics pipeline. Metrics below define what to measure when instrumentation is added, plus qualitative proxies available today from `rooms.json` and meeting outcomes.

---

## 1. Metrics philosophy

| Principle | Meaning |
| --- | --- |
| Ritual completion over vanity | Prefer “decision recorded” / “actions owned” over raw page views |
| Privacy-aware | Prefer aggregate room events; avoid logging private brainstorm bodies |
| Trusted-network context | Metrics assume known teams, not anonymous public SaaS growth |
| Shared formulas | Scoring quality metrics must use `@cadence/core` definitions |

---

## 2. Product metrics catalog

### 2.1 Acquisition & activation

| Metric | Friendly name | Definition | Formula | Target (initial) | Data source (planned / proxy) |
| --- | --- | --- | --- | --- | --- |
| `rooms_created` | Rooms created | Count of rooms created in period | `count(create room)` | Trend ↑ week over week for adopting orgs | API `POST /api/rooms` |
| `rooms_by_kind` | Rooms by ritual | Creates split by kind | `count by kind` | Healthy mix; retro often dominant | create payload `kind` |
| `join_success_rate` | Join success | Successful joins / join attempts | `joins_ok / joins_attempted` | ≥ 95% | API join + client errors |
| `time_to_second_participant` | Time to second person | Seconds from create to second join | `t_second_join - t_create` | Median ≤ 120s in live rituals | room events |
| `demo_room_ratio` | Demo usage share | Demo creates / total creates | `demo_true / creates` | Monitor; high ratio ⇒ onboarding, not production use | create `demo` flag |

### 2.2 Engagement (ritual quality)

| Metric | Friendly name | Definition | Formula | Target | Notes |
| --- | --- | --- | --- | --- | --- |
| `retro_phase_completion` | Retro completion | Retros that reach `summary` | `retros_at_summary / retros_created` | ≥ 70% for scheduled meetings | phase transitions |
| `notes_per_participant` | Notes per person | Cards / participants in brainstorm | `cards / participants` | 2–8 healthy band | exclude demos |
| `vote_utilization` | Vote utilization | Dots placed / dots available | `sum(voteCount) / (participants × votesPerPerson)` approx | 40–90% | avoid forcing 100% |
| `actions_with_owners_rate` | Owned actions rate | Actions with owner / actions | `owned / actions` | ≥ 80% at summary | action list |
| `review_decision_rate` | Decision recorded rate | Reviews with non-null decision | `decided / review_rooms` | ≥ 85% | `decision` field |
| `checklist_required_progress` | Required checklist progress | Required items with ≥1 signer / required items | at decision time | ≥ 80% when shipping | review state |
| `roadmap_scored_share` | Scored initiatives share | Initiatives with non-default meaningful inputs | heuristic or “edited after create” | ≥ 60% in workshops | patches |
| `framework_mix` | Framework mix | Distribution of RICE/ICE/value-complexity | `count by framework` | No forced target | roadmap state |

### 2.3 Reliability & experience

| Metric | Friendly name | Definition | Formula | Target | Source |
| --- | --- | --- | --- | --- | --- |
| `op_error_rate` | Op error rate | Failed ops / total ops | `errors / ops` | &lt; 2% | API logs |
| `store_busy_rate` | Store busy rate | `store` errors / write attempts | ratio | &lt; 0.5% | store |
| `poll_staleness_p95` | Staleness p95 | Age of room version when user notices lag (proxy: poll interval) | instrument client | p95 ≤ 3s visible tab | client RUM |
| `privacy_incident_count` | Privacy incidents | Reports of brainstorm leakage | count | **0** | support / tests |

### 2.4 Platform

| Metric | Friendly name | Definition | Target |
| --- | --- | --- | --- |
| `web_vs_mobile_sessions` | Client mix | Sessions by client | Inform design investment |
| `csv_export_rate` | CSV export rate | Exports / retros reaching summary | ≥ 40% for Maya’s teams |

---

## 3. OKR metrics (product team)

Suggested quarterly OKR set for an adopting product org. Adjust numbers to your baseline after two weeks of measurement.

### Objective 1 — Make rituals finish with outcomes

| Key result | Metric | Target example |
| --- | --- | --- |
| KR1.1 | `retro_phase_completion` | 75% of non-demo retros reach Summary |
| KR1.2 | `actions_with_owners_rate` | 85% of actions have owners at Summary |
| KR1.3 | `review_decision_rate` | 90% of reviews record ship/iterate/hold |

### Objective 2 — Keep brainstorm psychologically safe

| Key result | Metric | Target example |
| --- | --- | --- |
| KR2.1 | Automated privacy regression tests green | 100% of CI runs |
| KR2.2 | `privacy_incident_count` | 0 incidents |
| KR2.3 | Facilitator CSAT on “privacy felt safe” | ≥ 4.5 / 5 quarterly survey |

### Objective 3 — Trustworthy prioritization math

| Key result | Metric | Target example |
| --- | --- | --- |
| KR3.1 | Core scoring unit tests covering RICE/ICE/quadrants | Maintain ≥ current suite; no formula drift |
| KR3.2 | Workshop NPS “scores matched our discussion” | ≥ 4.0 / 5 |
| KR3.3 | `% roadmap rooms using complexity fields intentionally` | ≥ 70% non-default complexity edits |

### Objective 4 — Reliable dual-client collaboration

| Key result | Metric | Target example |
| --- | --- | --- |
| KR4.1 | `op_error_rate` | &lt; 2% |
| KR4.2 | Mobile smoke: create→join→op on LAN | Pass every release |
| KR4.3 | `time_to_second_participant` median | ≤ 2 minutes in live rituals |

---

## 4. Instrumentation guidance (future)

When adding analytics:

1. Emit **room-level events** (`room_created`, `phase_changed`, `decision_set`, `export_csv`) without note bodies.  
2. Hash or omit participant names in telemetry.  
3. Tag `demo: true` rooms and exclude from OKR numerators.  
4. Keep scoring evaluation in core—do not reimplement formulas in the analytics warehouse.  

---

## 5. Qualitative scorecard (usable today)

Until telemetry exists, product can review weekly:

| Question | Pass signal |
| --- | --- |
| Did the retro leave owned actions? | Actions list non-empty with owners |
| Did the review record a decision? | `decision` set |
| Did roadmap discussion use complexity? | Quadrant language used in meeting notes |
| Did anyone report leaked notes? | None |
| Did mobile users join successfully? | No “cannot reach server” blockers |

---

## 6. Related docs

[PRD.md](./PRD.md) · [VARIABLES.md](./VARIABLES.md) · [GUARDRAILS.md](./GUARDRAILS.md)
