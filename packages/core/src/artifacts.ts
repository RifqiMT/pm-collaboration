import type { ArtifactId, ArtifactProductId } from "./types";

export type ArtifactFramework = "Scrum" | "Agile" | "SAFe";

export interface ArtifactGuide {
  id: ArtifactId;
  name: string;
  practice: string;
  frameworks: ArtifactFramework[];
  summary: string;
  how: string[];
}

export interface ArtifactProduct {
  id: ArtifactProductId;
  name: string;
  blurb: string;
}

export interface ArtifactPiece {
  label: string;
  text: string;
}

export interface ArtifactSection {
  title: string;
  pieces: ArtifactPiece[];
}

export interface ArtifactExample {
  headline: string;
  sections: ArtifactSection[];
}

export const ARTIFACT_GUIDES: ArtifactGuide[] = [
  {
    id: "prd",
    name: "PRD",
    practice: "Agile, SAFe, and Scrum",
    frameworks: ["Agile", "SAFe", "Scrum"],
    summary: "One clear requirement: who it helps, why it matters, and what quality bar it must meet — while still leaving room to learn.",
    how: [
      "Keep the page to one requirement. Everything else can wait.",
      "Name the user, the change they need, and how you'll check it (Given / When / Then).",
      "Say why the business cares, what early signal to watch, and the smallest test.",
      "Agree what Done means, plus any limits or enabling work a Sprint would need.",
      "Name who this serves and who is accountable (RACI).",
      "This page feeds the backlog. It does not replace the backlog.",
    ],
  },
  {
    id: "lean-business-case",
    name: "Lean Business Case",
    practice: "SAFe",
    frameworks: ["SAFe"],
    summary: "A short go / no-go brief: what you're testing, what's in or out, and when to stop spending.",
    how: [
      "Start from the epic idea. This brief turns it into a funding decision.",
      "Write in-scope and out-of-scope so the first test stays small.",
      "Estimate cost of delay and job size so you can compare competing bets (WSJF).",
      "Pick early signals you can see soon — not only the final financial result.",
      "Be clear who decides go, no-go, or pivot (RACI).",
      "Go funds the smallest test. No-go or pivot stops spend when signals fail.",
    ],
  },
  {
    id: "epic",
    name: "Epics",
    practice: "SAFe",
    frameworks: ["SAFe"],
    summary: "A big outcome bet, plus the enabling tech work that unlocks the first test.",
    how: [
      "Write who it's for, the need, the approach, the alternative, and how you'll know it worked.",
      "Name the smallest test — and what waits outside that test.",
      "List early signals you can see before the full result.",
      "Write acceptance checks for that smallest test, separate from the hypothesis.",
      "A business epic delivers something users would miss. An enabler unlocks it.",
      "Name personas and who owns the hypothesis (RACI).",
      "Epics span more than one Sprint. Features and stories come out of them — they're not a project plan.",
    ],
  },
  {
    id: "feature",
    name: "Features",
    practice: "SAFe",
    frameworks: ["SAFe"],
    summary: "A mid-size slice users would recognize, with acceptance checks and the stories inside it.",
    how: [
      "A Feature sits between an epic and a user story. Aim to finish it in one Program Increment when you can.",
      "Write the benefit you're testing and how you'll accept the Feature.",
      "Split it into stories teams can finish in Sprints.",
      "Name enabling work the Feature needs, and keep it visible on the backlog.",
      "Product management accepts the Feature. The team builds the stories.",
      "Features describe outcomes people notice. They're not task lists.",
    ],
  },
  {
    id: "user-story",
    name: "User stories",
    practice: "Agile and Scrum",
    frameworks: ["Agile", "Scrum"],
    summary: "Small, user-facing slices with a clear reason and checks a Sprint can finish.",
    how: [
      "Write: As a [user], I want [change], so that [reason].",
      "Add Given / When / Then checks that belong to this story only.",
      "Keep each story valuable on its own and small enough for one Sprint (INVEST).",
      "Name one persona. The Product Owner accepts it. Developers build it.",
      "A story is a conversation. Rewrite it when you learn something new.",
    ],
  },
  {
    id: "product-backlog",
    name: "Product Backlog",
    practice: "Scrum",
    frameworks: ["Scrum"],
    summary: "One ordered list for the product, with a Product Goal above it.",
    how: [
      "Put the Product Goal above the list. Every item should serve that goal.",
      "The Product Owner orders the list. Ready, high-value work sits near the top.",
      "Each refined item needs a description, order, value, size, and Given / When / Then checks.",
      "Refinement adds detail. The list changes as you learn.",
      "Product Owner owns the order. Developers own the size. Stakeholders are consulted or informed.",
      "This is the single source of work — not a release date.",
    ],
  },
  {
    id: "sprint-backlog",
    name: "Sprint Backlog",
    practice: "Scrum",
    frameworks: ["Scrum"],
    summary: "This Sprint's goal, the work pulled in, and the plan for the first days.",
    how: [
      "Keep three parts together: why this Sprint matters, what you pulled in, and how you'll start.",
      "The Sprint Goal is the commitment. Selected items are a forecast.",
      "Developers select and plan. The Product Owner clarifies — they don't assign tasks.",
      "Plan the first days in the room. Later days can emerge at the Daily Scrum.",
      "Developers own the Sprint Backlog. The Product Owner is consulted.",
      "If the goal is at risk, change the plan — don't quietly change the Sprint Goal.",
    ],
  },
  {
    id: "increment",
    name: "Increment & Definition of Done",
    practice: "Scrum",
    frameworks: ["Scrum"],
    summary: "What's finished and usable this Sprint, and the shared quality bar that made it Done.",
    how: [
      "Each item has its own acceptance checks. Definition of Done is the quality bar every Increment must also meet.",
      "An Increment exists once an item meets the Definition of Done.",
      "Developers own the Definition of Done (and any org-wide standard).",
      "Work that isn't Done goes back to the backlog. Don't show it as complete in the Review.",
      "Every Sprint should create at least one usable Increment, even if you don't release it yet.",
      "Developers own Done. Stakeholders inspect the Increment in the Review.",
      "Done is the commitment for the Increment — like Product Goal for the backlog and Sprint Goal for the Sprint Backlog.",
    ],
  },
];

export const ARTIFACT_PRODUCTS: ArtifactProduct[] = [
  {
    id: "unified-agent",
    name: "Unified Agent Platform",
    blurb: "Where agents fix a guest's broken stay in one place.",
  },
  {
    id: "contact-center",
    name: "Contact Center Platform",
    blurb: "How calls reach an agent who can finish the case.",
  },
  {
    id: "cs-data",
    name: "CS data products",
    blurb: "Trusted numbers that show if the stay was fixed on first contact.",
  },
];

const EXAMPLES: Record<ArtifactProductId, Record<ArtifactId, ArtifactExample>> = {
  "unified-agent": {
    prd: {
      headline: "Resolve a disrupted stay in the first conversation.",
      sections: [
        {
          title: "Product",
          pieces: [
            {
              label: "User and job",
              text: "Customer service agents on a travel marketplace the size of Booking.com, resolving a guest's disrupted stay.",
            },
            {
              label: "Outcome",
              text: "The guest hears a resolution in the first conversation because the agent already has the booking, the property status, and one allowed change.",
            },
            {
              label: "Stories in scope",
              text: "One story shows the stay and the property status. A second story offers the allowed change. Flight changes wait outside this requirement.",
            },
            {
              label: "Acceptance criteria",
              text: "Given a disrupted stay, when the agent opens the case, then the booking, the property status, and one allowed change are on the same screen. Given a stay the policy cannot change, when the agent opens the case, then the screen says so and does not offer a change.",
            },
          ],
        },
        {
          title: "Business",
          pieces: [
            {
              label: "Benefit hypothesis",
              text: "Service leads gain a lower cost per stay-change contact if first-contact resolution rises and guest satisfaction holds.",
            },
            {
              label: "Leading indicator",
              text: "Share of stay changes resolved in the first conversation. Review it four weeks after the first market.",
            },
            {
              label: "Smallest test",
              text: "Stay changes in one market, inside the agent desktop. Flights, a guest chatbot, and other brands wait.",
            },
            {
              label: "Order",
              text: "A failed stay has a high cost of delay, and this slice is smaller than a full trip workspace, so it goes first.",
            },
          ],
        },
        {
          title: "Technical",
          pieces: [
            {
              label: "Definition of Done",
              text: "Developers agree the Increment is integrated, tested, and usable in the agent desktop before it is called Done.",
            },
            {
              label: "Constraints",
              text: "The trip timeline loads with the case. Guest data stays inside the service role. The page works with a keyboard.",
            },
            {
              label: "Enabler",
              text: "A property-status feed unlocks the stay-change outcome and is sized for one Sprint.",
            },
            {
              label: "Dependency",
              text: "The property systems owner confirms the status feed before the second story starts.",
            },
          ],
        },
      ],
    },
    "lean-business-case": {
      headline: "Fund the stay-change MVP for the Unified Agent Platform — or stop if first-contact resolution does not move.",
      sections: [
        {
          title: "Decision brief",
          pieces: [
            {
              label: "Epic in view",
              text: "Stay-change resolution in the agent workspace for one travel marketplace market.",
            },
            {
              label: "Outcomes hypothesis",
              text: "If agents resolve a disrupted stay in the first conversation, cost per stay-change contact falls while guest satisfaction holds within four weeks of the first market.",
            },
            {
              label: "Leading indicators",
              text: "First-contact resolution for stay changes, and how often the agent still opens the supplier portal — visible inside the first Program Increment.",
            },
            {
              label: "Go / no-go",
              text: "Go funds the MVP for one market. No-go if staging cannot show live property status without a second tool. Pivot if FCR is flat after four weeks.",
            },
          ],
        },
        {
          title: "Scope",
          pieces: [
            {
              label: "In scope",
              text: "Stay changes, property status on the case, one allowed date change, agent desktop only.",
            },
            {
              label: "Out of scope",
              text: "Flight changes, guest chatbot, multi-brand rollout, and a full trip redesign.",
            },
            {
              label: "MVP features",
              text: "Case shows stay and property status; agent can offer the policy's allowed change; team lead sees an FCR tile for that market.",
            },
            {
              label: "Non-functional needs",
              text: "Keyboard access, role-scoped guest data, and status load with the case open.",
            },
            {
              label: "Acceptance criteria",
              text: "Given a disrupted stay in the pilot market, when the agent opens the case, then the stay, the property status, and one allowed change are on that case, and the team lead can read first-contact resolution for that market.",
            },
          ],
        },
        {
          title: "WSJF signal",
          pieces: [
            {
              label: "User / business value",
              text: "9 — a mis-handled stay damages trust and drives repeat contacts.",
            },
            {
              label: "Time criticality",
              text: "8 — peak travel season amplifies every delayed resolution.",
            },
            {
              label: "Risk reduction / opportunity enablement",
              text: "7 — proves the workspace model before flight and chat slices.",
            },
            {
              label: "Job size",
              text: "5 — one market, two core stories plus an enabler feed that fits a single Sprint.",
            },
            {
              label: "WSJF",
              text: "Cost of delay (9 + 8 + 7 = 24) ÷ job size 5 ≈ 4.8. Sequence ahead of larger trip-workspace bets with lower CoD density.",
            },
          ],
        },
      ],
    },
    epic: {
      headline: "A business epic for the workspace, and the enabler that unlocks the test.",
      sections: [
        {
          title: "Business epic",
          pieces: [
            {
              label: "Hypothesis",
              text: "For customer service agents on a travel marketplace who resolve a disrupted stay, the Unified Agent Platform is a service workspace that shows the booking, the supplier, and the allowed action in one conversation. Unlike a generic helpdesk or a supplier portal, our solution keeps the trip and the resolution on the case the agent already has open. We will know this is true when first-contact resolution for stay changes rises within four weeks of the first market, and guest satisfaction holds.",
            },
            {
              label: "Smallest test",
              text: "Stay changes in one market, inside the agent desktop. Flight changes and a guest chatbot wait.",
            },
            {
              label: "Leading indicators",
              text: "First-contact resolution for stay changes, and how often the agent still opens the supplier portal.",
            },
            {
              label: "Features this epic will spawn",
              text: "Stay on the case, one allowed change, and the first-contact tile for service leads.",
            },
            {
              label: "Acceptance criteria",
              text: "Given a disrupted stay in the first market, when the agent opens the case, then the booking, the property status, and one allowed change are handled without the supplier portal. The epic is accepted when first-contact resolution for stay changes has risen and guest satisfaction has held.",
            },
          ],
        },
        {
          title: "Enabler epic",
          pieces: [
            {
              label: "Hypothesis",
              text: "For agents resolving a disrupted stay, a property-status feed is an enabler that puts the property's current state on the case. Unlike a manual check in the supplier portal, our solution shows that state when the case opens. We will know this is true when a staging case shows a live status without a second tool.",
            },
            {
              label: "Size",
              text: "Sized for one Sprint, and it exists only to unlock the stay-change outcome.",
            },
            {
              label: "Acceptance criteria",
              text: "Given a staging case for a disrupted stay, when the agent opens it, then the property status matches the property system and no second tool is required.",
            },
          ],
        },
      ],
    },
    feature: {
      headline: "Feature: Stay and property status on the open case — finishable in one Program Increment.",
      sections: [
        {
          title: "Feature",
          pieces: [
            {
              label: "Benefit hypothesis",
              text: "Agents stop hunting in the supplier portal when the disrupted stay and property status appear together on the case, so first-contact answers rise.",
            },
            {
              label: "Acceptance criteria",
              text: "Given a disrupted stay case, when the agent opens it, then booking identity, property status, and last update time are visible without leaving the case. Given the status cannot load, when the case opens, then the booking still shows and the status says it is unavailable.",
            },
            {
              label: "PI fit",
              text: "Sized for one ART Program Increment with the property-status enabler already on the architectural runway.",
            },
            {
              label: "Out of this Feature",
              text: "Offering the allowed change and the FCR tile are separate Features that depend on this one.",
            },
          ],
        },
        {
          title: "Story split",
          pieces: [
            {
              label: "Story 1",
              text: "As an agent, I want the disrupted stay on the open case, so that I know which booking I am talking about.",
            },
            {
              label: "Acceptance criteria: story 1",
              text: "Given a disrupted stay, when the agent opens the case, then the booking identity is visible without leaving the case.",
            },
            {
              label: "Story 2",
              text: "As an agent, I want the property status beside that stay, so that I can explain the disruption without the supplier portal.",
            },
            {
              label: "Acceptance criteria: story 2",
              text: "Given the stay is on the case, when the property status loads, then it sits beside that stay with the time it was last updated.",
            },
            {
              label: "Enabler",
              text: "Property-status feed into the case service, sized for one Sprint, required before Story 2 is Done.",
            },
          ],
        },
      ],
    },
    "user-story": {
      headline: "Three INVEST stories a Sprint could pull from the top of the backlog.",
      sections: [
        {
          title: "Stories",
          pieces: [
            {
              label: "Stay on the case",
              text: "As a customer service agent, I want the disrupted stay and the property status on the case I already have open, so that I can answer the guest without opening the supplier portal. Estimate: Developers compare it with the last case-view story. Ready when the status contract is agreed.",
            },
            {
              label: "Acceptance criteria: stay on the case",
              text: "Given a disrupted stay, when the agent opens the case, then the booking and the property status appear together. Given the property status cannot be loaded, when the case opens, then the booking still shows and the status says it is unavailable.",
            },
            {
              label: "One allowed change",
              text: "As a customer service agent, I want one allowed change on that same case, so that the guest leaves with a resolution. Estimate: one Sprint slice after status is visible. Ready when policy rules are written for that market.",
            },
            {
              label: "Acceptance criteria: one allowed change",
              text: "Given the stay is on screen, when the policy allows a date change, then the agent can offer that change and see the confirmation. Given the policy does not allow a change, when the agent opens the case, then no change is offered.",
            },
            {
              label: "First-contact tile",
              text: "As a service team lead, I want first-contact resolution for stay changes on one tile, so that I can tell whether the workspace is working. Estimate: small once events exist. Ready when FCR events are defined.",
            },
            {
              label: "Acceptance criteria: first-contact tile",
              text: "Given the first market is live, when the team lead opens the tile, then it shows the share of stay changes resolved in the first conversation for that market.",
            },
          ],
        },
        {
          title: "Story quality",
          pieces: [
            {
              label: "INVEST check",
              text: "Each story is Independent enough to demo, Negotiable in design, Valuable to a named user, Estimable by Developers, Small for one Sprint, and Testable with given/when/then.",
            },
            {
              label: "Conversation",
              text: "The Product Owner clarifies policy edge cases in refinement. Developers challenge size before Sprint Planning.",
            },
          ],
        },
      ],
    },
    "product-backlog": {
      headline: "Product Goal: a guest with a broken stay hears the resolution in the first conversation.",
      sections: [
        {
          title: "Product Goal",
          pieces: [
            {
              label: "Commitment",
              text: "Within two quarters, an agent on the Unified Agent Platform resolves a disrupted stay in the first conversation for the first market, without leaving the case.",
            },
            {
              label: "How we inspect it",
              text: "First-contact resolution for stay changes and guest satisfaction on those contacts, reviewed every Sprint Review.",
            },
          ],
        },
        {
          title: "Ordered Product Backlog",
          pieces: [
            {
              label: "1. Stay and property status",
              text: "Description: show the disrupted stay and property status on the open case. Order: 1. Value: agent stops searching. Size: Developers compare with the last case-view story. Acceptance criteria: given a disrupted stay, when the agent opens the case, then the booking and the property status are on that case.",
            },
            {
              label: "2. Property-status feed",
              text: "Description: enabler that brings property state onto the case. Order: 2. Value: unlocks item 1. Size: fits one Sprint. Acceptance criteria: given a staging case, when the feed is connected, then the property status matches the property system without a second tool.",
            },
            {
              label: "3. One allowed change",
              text: "Description: offer the policy's allowed change on that case. Order: 3. Value: guest leaves with a resolution. Size: after status is visible. Acceptance criteria: given the stay is on screen and the policy allows a date change, when the agent offers it, then the confirmation appears on that case.",
            },
            {
              label: "4. First-contact tile",
              text: "Description: show the leading indicator to team leads. Order: 4. Value: the team can see if the hypothesis is holding. Acceptance criteria: given the first market is live, when a team lead opens the tile, then it shows the share of stay changes resolved in the first conversation.",
            },
            {
              label: "5. Flight changes",
              text: "Description: later. Order: 5. Value: expands the trip workspace. The smallest test is stays, so this stays below the test. Acceptance criteria are written when this item is refined, not before.",
            },
          ],
        },
      ],
    },
    "sprint-backlog": {
      headline: "Sprint Goal: by Friday, an agent sees the disrupted stay and the property status on the open case.",
      sections: [
        {
          title: "Why this Sprint is valuable",
          pieces: [
            {
              label: "Sprint Goal",
              text: "By Friday, an agent sees the disrupted stay and the property status on the open case — the commitment for this Sprint.",
            },
            {
              label: "Why",
              text: "A guest with a broken stay currently waits while the agent hunts for the property. This Sprint removes that hunt for the first market.",
            },
          ],
            },
            {
          title: "Forecast",
          pieces: [
            {
              label: "Selected items",
              text: "Developers pull the property-status feed and the case view that shows the stay and the status. The allowed-change story stays on the Product Backlog.",
            },
            {
              label: "Acceptance criteria",
              text: "Property-status feed: given a staging case, when the feed is connected, then the status matches the property system. Case view: given a disrupted stay, when the agent opens the case, then the booking and the property status are together. The allowed-change acceptance criteria stay on the Product Backlog with that story.",
            },
            {
              label: "Plan for the first days",
              text: "Day 1: confirm the status contract with the property owner. Day 2: show the status on a staging case. The Daily Scrum looks at the Sprint Goal.",
            },
            {
              label: "Forecast, not a promise",
              text: "The team forecasts these two items. If the status contract slips, Developers narrow the plan and keep the Sprint Goal.",
            },
          ],
        },
      ],
    },
    increment: {
      headline: "Increment: stay and property status are usable on a staging case — and meet the Definition of Done.",
      sections: [
        {
          title: "This Increment",
          pieces: [
            {
              label: "What is Done",
              text: "A staging case for a disrupted stay shows booking identity and live property status in the agent desktop. The property-status feed and case view both meet the Definition of Done.",
            },
            {
              label: "What is not Done",
              text: "Offering the allowed change and the FCR tile are not part of this Increment. They remain on the Product Backlog.",
            },
            {
              label: "Usable now",
              text: "Service leads can inspect the Increment in a Sprint Review on staging even if release to production waits for the next market checklist.",
            },
            {
              label: "Acceptance criteria met",
              text: "The case view meets its acceptance criteria: a disrupted stay shows the booking and the live property status together. The feed meets its acceptance criteria: the status matches the property system without a second tool.",
            },
          ],
        },
        {
          title: "Definition of Done",
          pieces: [
            {
              label: "Quality bar",
              text: "Integrated with the agent desktop build, automated tests green for the case view, accessibility keyboard path verified, and guest data scoped to the service role.",
            },
            {
              label: "Observable",
              text: "Status fetch success and failure are logged. A failed feed does not blank the case.",
            },
            {
              label: "If it is not Done",
              text: "Any item that misses this bar returns to the Product Backlog. It is not presented as complete at the Sprint Review.",
            },
          ],
        },
      ],
    },
  },
  "contact-center": {
    prd: {
      headline: "Offer a stay-change call to an agent who can finish it.",
      sections: [
        {
          title: "Product",
          pieces: [
            {
              label: "User and job",
              text: "Guests who call about a disrupted stay, and the routing leads who decide which agent receives that call.",
            },
            {
              label: "Outcome",
              text: "The call reaches an agent with the stay-change skill on the first try, and that agent opens the trip in the Unified Agent Platform.",
            },
            {
              label: "Stories in scope",
              text: "One story tags agents with the stay-change skill. A second story offers those calls only to tagged agents. Chat waits.",
            },
            {
              label: "Acceptance criteria",
              text: "Given a stay-change voice call, when the platform routes it, then only an agent with that skill is offered the call. Given an agent without that skill, when a stay-change call arrives, then that agent is not offered it, and the decision is logged.",
            },
          ],
        },
        {
          title: "Business",
          pieces: [
            {
              label: "Benefit hypothesis",
              text: "Service leads gain fewer transfers if stay-change calls reach a skilled agent first, and the wait stays inside the service target.",
            },
            {
              label: "Leading indicator",
              text: "Transfer rate on the stay-change voice queue, reviewed two weeks after the rule is live.",
            },
            {
              label: "Smallest test",
              text: "One voice queue, stay changes only. Chat, email, and other skills wait.",
            },
            {
              label: "Order",
              text: "A misrouted guest has a high cost of delay, and a single-queue rule is smaller than a full routing rebuild, so it goes first.",
            },
          ],
        },
        {
          title: "Technical",
          pieces: [
            {
              label: "Definition of Done",
              text: "Developers agree a routed test call is observable, logged, and reversible before the Increment is Done.",
            },
            {
              label: "Constraints",
              text: "The offer reaches an agent within the service target. The routing decision is logged. Guest audio is not stored beyond the contact policy.",
            },
            {
              label: "Enabler",
              text: "A skill catalog for agents, sized for one Sprint, unlocks the routing rule.",
            },
            {
              label: "Dependency",
              text: "The Unified Agent Platform must accept the trip id when the call connects. That handoff is a later story if the catalog is not ready.",
            },
          ],
        },
      ],
    },
    "lean-business-case": {
      headline: "Fund skill-based stay-change routing — or stop if transfers do not fall inside the service target.",
      sections: [
        {
          title: "Decision brief",
          pieces: [
            {
              label: "Epic in view",
              text: "Route stay-change voice calls to agents with the stay-change skill on the Contact Center Platform.",
            },
            {
              label: "Outcomes hypothesis",
              text: "If stay-change calls reach a skilled agent first, transfer rate falls and average speed of answer stays inside the service target within two weeks of go-live.",
            },
            {
              label: "Leading indicators",
              text: "Transfer rate and average speed of answer on the stay-change voice queue — readable in the first Program Increment.",
            },
            {
              label: "Go / no-go",
              text: "Go funds the skill catalog and voice rule for one queue. No-go if leads cannot agree the skill list. Pivot if transfers are flat after two weeks.",
            },
          ],
        },
        {
          title: "Scope",
          pieces: [
            {
              label: "In scope",
              text: "One voice queue, stay-change skill tags, routing offer rule, and a queue tile for wait and transfers.",
            },
            {
              label: "Out of scope",
              text: "Chat and email routing, multi-queue redesign, and trip-id handoff if the agent workspace is not ready.",
            },
            {
              label: "MVP features",
              text: "Skill tag on agent profiles; stay-change calls offered only to that skill; service leads see transfer rate on one tile.",
            },
            {
              label: "Non-functional needs",
              text: "Offer within service target, routing decision logged, reversible rule, no guest audio beyond policy.",
            },
            {
              label: "Acceptance criteria",
              text: "Given a stay-change voice call, when the platform routes it, then only a skilled agent is offered it, the decision is logged, and the team lead can read the transfer rate on that queue.",
            },
          ],
        },
        {
          title: "WSJF signal",
          pieces: [
            {
              label: "User / business value",
              text: "8 — every transfer makes the guest repeat a painful story.",
            },
            {
              label: "Time criticality",
              text: "7 — stay disruptions cluster on travel peaks.",
            },
            {
              label: "Risk reduction / opportunity enablement",
              text: "6 — proves skill routing before chat and email channels.",
            },
            {
              label: "Job size",
              text: "4 — one voice queue, with the skill catalog and routing rule as the whole MVP.",
            },
            {
              label: "WSJF",
              text: "Cost of delay (8 + 7 + 6 = 21) ÷ job size 4 ≈ 5.3. Sequence ahead of broader omnichannel routing work.",
            },
          ],
        },
      ],
    },
    epic: {
      headline: "A business epic for routing, and the enabler that makes the skill real.",
      sections: [
        {
          title: "Business epic",
          pieces: [
            {
              label: "Hypothesis",
              text: "For guests who call about a disrupted stay, the Contact Center Platform is a routing service that offers the call to an agent with the stay-change skill. Unlike one general queue, our solution matches the contact to the skill before the agent answers. We will know this is true when the transfer rate on stay-change calls falls and the wait stays inside the service target.",
            },
            {
              label: "Smallest test",
              text: "Voice only, one queue, stay changes. Chat and email wait.",
            },
            {
              label: "Leading indicators",
              text: "Transfer rate and average speed of answer on that queue.",
            },
            {
              label: "Features this epic will spawn",
              text: "Skill tag, first-offer routing rule, and the queue tile for service leads.",
            },
            {
              label: "Acceptance criteria",
              text: "Given a stay-change voice call, when the platform routes it, then only an agent with that skill is offered the call, and the wait stays inside the service target. The epic is accepted when the transfer rate on that queue has fallen.",
            },
          ],
        },
        {
          title: "Enabler epic",
          pieces: [
            {
              label: "Hypothesis",
              text: "For routing leads, a skill catalog is an enabler that records which agents can handle a stay change. Unlike a spreadsheet beside the queue, our solution is the list the router reads. We will know this is true when a test call is offered only to agents in that catalog.",
            },
            {
              label: "Size",
              text: "Sized for one Sprint. It unlocks the routing rule and does not itself talk to the guest.",
            },
            {
              label: "Acceptance criteria",
              text: "Given a test call for a stay change, when the router reads the catalog, then the call is offered only to agents listed with that skill.",
            },
          ],
        },
      ],
    },
    feature: {
      headline: "Feature: First offer for stay-change voice — finishable in one Program Increment.",
      sections: [
        {
          title: "Feature",
          pieces: [
            {
              label: "Benefit hypothesis",
              text: "Guests reach an agent who can finish the stay change on the first offer, so transfers fall without lengthening wait beyond the service target.",
            },
            {
              label: "Acceptance criteria",
              text: "Given a stay-change voice call, when the platform routes it, then an agent without the stay-change skill is never offered the call, and the decision is logged. Given a skilled agent is available, when the call arrives, then that agent is offered it inside the service target.",
            },
            {
              label: "PI fit",
              text: "Sized for one Program Increment once the skill catalog enabler is on the runway.",
            },
            {
              label: "Out of this Feature",
              text: "Chat routing and trip-id handoff to the Unified Agent Platform are separate Features.",
            },
          ],
        },
        {
          title: "Story split",
          pieces: [
            {
              label: "Story 1",
              text: "As a routing lead, I want agents tagged with the stay-change skill, so that the platform knows who can finish that call.",
            },
            {
              label: "Acceptance criteria: story 1",
              text: "Given an agent profile, when a routing lead adds the stay-change skill, then the agent appears in that skill group.",
            },
            {
              label: "Story 2",
              text: "As a guest with a disrupted stay, I want my call offered only to agents with that skill, so that I do not repeat the problem.",
            },
            {
              label: "Acceptance criteria: story 2",
              text: "Given a stay-change voice call, when the platform routes it, then an agent without that skill is not offered the call, and the decision is logged.",
            },
            {
              label: "Enabler",
              text: "Skill catalog the router reads, sized for one Sprint, required before Story 2 is Done.",
            },
          ],
        },
      ],
    },
    "user-story": {
      headline: "Three INVEST stories that connect the queue to the agent workspace.",
      sections: [
        {
          title: "Stories",
          pieces: [
            {
              label: "Skill tag",
              text: "As a routing lead, I want agents tagged with the stay-change skill, so that the platform knows who can finish that call. Estimate: compared with the last profile change. Ready when the skill name is agreed.",
            },
            {
              label: "Acceptance criteria: skill tag",
              text: "Given an agent profile, when a routing lead adds the stay-change skill, then the agent appears in that skill group. Given the skill is removed, when the profile is saved, then the agent leaves that group.",
            },
            {
              label: "First offer",
              text: "As a guest with a disrupted stay, I want my call offered to an agent who can change the stay, so that I do not repeat the problem to a second person. Estimate: one Sprint after the catalog exists. Ready when the queue is identified.",
            },
            {
              label: "Acceptance criteria: first offer",
              text: "Given a stay-change call, when the platform routes it, then an agent without that skill is not offered the call. Given a skilled agent is available, when the call arrives, then that agent is offered it.",
            },
            {
              label: "Trip on connect",
              text: "As a customer service agent, I want the trip id on the call when I answer, so that the Unified Agent Platform opens the right case. Estimate: depends on the agent workspace. Ready when the handoff contract exists.",
            },
            {
              label: "Acceptance criteria: trip on connect",
              text: "Given the agent accepts a stay-change call, when the call connects, then the Unified Agent Platform opens the case for that trip.",
            },
          ],
        },
        {
          title: "Story quality",
          pieces: [
            {
              label: "INVEST check",
              text: "Each story is Independent enough to demo, Negotiable in design, Valuable to a named user, Estimable by Developers, Small for one Sprint, and Testable with given/when/then.",
            },
            {
              label: "Conversation",
              text: "Routing leads and Developers refine the skill list together. The Product Owner keeps chat routing below the voice MVP.",
            },
          ],
        },
      ],
    },
    "product-backlog": {
      headline: "Product Goal: a stay-change call reaches an agent who can finish it.",
      sections: [
        {
          title: "Product Goal",
          pieces: [
            {
              label: "Commitment",
              text: "Within one quarter, a stay-change voice call on the Contact Center Platform is offered only to agents with that skill, and wait stays inside the service target.",
            },
            {
              label: "How we inspect it",
              text: "Transfer rate and average speed of answer on the stay-change queue, reviewed every Sprint Review.",
            },
          ],
        },
        {
          title: "Ordered Product Backlog",
          pieces: [
            {
              label: "1. Stay-change skill",
              text: "Description: tag agents who can resolve a disrupted stay. Order: 1. Value: the router has a real group to offer. Size: against the last profile change. Acceptance criteria: given an agent profile, when a lead adds the stay-change skill, then the agent appears in that skill group.",
            },
            {
              label: "2. Voice routing rule",
              text: "Description: offer stay-change voice calls only to that skill. Order: 2. Value: the guest reaches the right agent first. Size: after the skill exists. Acceptance criteria: given a stay-change call, when the platform routes it, then an agent without that skill is not offered the call.",
            },
            {
              label: "3. Queue tile",
              text: "Description: show wait and transfer rate for the stay-change queue. Order: 3. Value: the leading indicator is visible to service leads. Acceptance criteria: given the rule is live, when a service lead opens the tile, then it shows wait and transfer rate for that queue.",
            },
            {
              label: "4. Trip id on connect",
              text: "Description: pass the trip into the Unified Agent Platform when the call connects. Order: 4. Value: the agent does not search. Depends on the agent workspace. Acceptance criteria: given the agent accepts the call, when it connects, then the case for that trip opens.",
            },
            {
              label: "5. Chat routing",
              text: "Description: later. Order: 5. Value: same skill model on chat. The smallest test is the voice queue. Acceptance criteria are written when this item is refined, not before.",
            },
          ],
        },
      ],
    },
    "sprint-backlog": {
      headline: "Sprint Goal: by Friday, a stay-change call is offered only to agents with that skill.",
      sections: [
        {
          title: "Why this Sprint is valuable",
          pieces: [
            {
              label: "Sprint Goal",
              text: "By Friday, a stay-change call is offered only to agents with that skill — the commitment for this Sprint.",
            },
            {
              label: "Why",
              text: "A misrouted stay-change call makes the guest tell the story twice. This Sprint removes that misroute on voice.",
            },
          ],
            },
            {
          title: "Forecast",
          pieces: [
            {
              label: "Selected items",
              text: "Developers pull the skill tag and the voice routing rule. Chat routing and the trip-id handoff stay on the Product Backlog.",
            },
            {
              label: "Acceptance criteria",
              text: "Skill tag: given an agent profile, when a lead adds the stay-change skill, then the agent appears in that skill group. Voice rule: given a stay-change call, when the platform routes it, then an agent without that skill is not offered the call. Chat and trip-id acceptance criteria stay on the Product Backlog.",
            },
            {
              label: "Plan for the first days",
              text: "Day 1: agree the skill list with service leads. Day 2: route a test call in staging and read the routing log. The Daily Scrum checks the Sprint Goal.",
            },
            {
              label: "Forecast, not a promise",
              text: "The forecast is these two items. If the skill list is not agreed, Developers narrow to the catalog and keep the Sprint Goal in view.",
            },
          ],
        },
      ],
    },
    increment: {
      headline: "Increment: stay-change voice offers only skilled agents — and meets the Definition of Done.",
      sections: [
        {
          title: "This Increment",
          pieces: [
            {
              label: "What is Done",
              text: "A staging stay-change call is offered only to agents in the skill catalog. The skill tag and voice rule both meet the Definition of Done.",
            },
            {
              label: "What is not Done",
              text: "Chat routing and trip-id handoff are not part of this Increment. They remain on the Product Backlog.",
            },
            {
              label: "Usable now",
              text: "Service leads can inspect a logged test call at the Sprint Review even if production cutover waits for the reversible-rule checklist.",
            },
            {
              label: "Acceptance criteria met",
              text: "The skill tag meets its acceptance criteria: an agent added to the stay-change skill appears in that group. The voice rule meets its acceptance criteria: a stay-change call is offered only to agents in that group, and the decision is logged.",
            },
          ],
        },
        {
          title: "Definition of Done",
          pieces: [
            {
              label: "Quality bar",
              text: "Routing decision logged, rule reversible within one change window, automated offer tests green, and no guest audio stored beyond the contact policy.",
            },
            {
              label: "Observable",
              text: "Offer, accept, and transfer events are queryable for the stay-change queue.",
            },
            {
              label: "If it is not Done",
              text: "Any item that misses this bar returns to the Product Backlog. It is not presented as complete at the Sprint Review.",
            },
          ],
        },
      ],
    },
  },
  "cs-data": {
    prd: {
      headline: "Publish one certified number for stay-change first-contact resolution.",
      sections: [
        {
          title: "Product",
          pieces: [
            {
              label: "User and job",
              text: "Service leads and product managers on a travel marketplace the size of Booking.com, deciding whether the stay-change workspace is working.",
            },
            {
              label: "Outcome",
              text: "They read one certified first-contact resolution number for stay changes, with the definition and the time it was last refreshed.",
            },
            {
              label: "Stories in scope",
              text: "One story publishes the definition. A second story delivers yesterday's dataset for the first market. Cost per contact waits.",
            },
            {
              label: "Acceptance criteria",
              text: "Given the first market is live, when a service lead opens the data product, then first-contact resolution shows with its definition and the time it was refreshed. Given a source event is missing, when the dataset is built, then that day is marked incomplete.",
            },
          ],
        },
        {
          title: "Business",
          pieces: [
            {
              label: "Benefit hypothesis",
              text: "Service leads stop reconciling spreadsheets and can tell, within a week, whether the agent workspace and the routing rule moved first-contact resolution.",
            },
            {
              label: "Leading indicator",
              text: "Share of stay-change reviews that cite the certified dataset instead of a local spreadsheet. Review it three weeks after the first market.",
            },
            {
              label: "Smallest test",
              text: "First-contact resolution for stay changes, one market, one daily refresh. Transfer rate, cost per contact, and other brands wait.",
            },
            {
              label: "Order",
              text: "A disputed metric has a high cost of delay, and one outcome for one market is smaller than a full service warehouse, so it goes first.",
            },
          ],
        },
        {
          title: "Technical",
          pieces: [
            {
              label: "Definition of Done",
              text: "The dataset matches the published definition, lands before the service review, and names its source events from both platforms.",
            },
            {
              label: "Constraints",
              text: "Guest identifiers stay inside the service role. The number is reproducible from the event log. Freshness is visible on the product.",
            },
            {
              label: "Enabler",
              text: "A case-resolved event contract, sized for one Sprint, so the agent workspace and the contact center write the same fact.",
            },
            {
              label: "Dependency",
              text: "Both platforms must emit that event. If the event is not ready, the daily dataset stays on the Product Backlog.",
            },
          ],
        },
      ],
    },
    "lean-business-case": {
      headline: "Fund the stay-change first-contact data product, or stop if leads still reconcile the number by hand.",
      sections: [
        {
          title: "Decision brief",
          pieces: [
            {
              label: "Epic in view",
              text: "A certified data product for first-contact resolution on stay changes, for one travel marketplace market.",
            },
            {
              label: "Outcomes hypothesis",
              text: "If service leads read one certified number, spreadsheet reconciliation falls and the Sprint Review cites that number within three weeks.",
            },
            {
              label: "Leading indicators",
              text: "Share of reviews that cite the certified dataset, and how often it is late for the morning review. Visible in the first Program Increment.",
            },
            {
              label: "Go / no-go",
              text: "Go funds the definition and the daily dataset for one market. No-go if the platforms cannot emit a case-resolved event. Pivot if spreadsheets remain after three weeks.",
            },
          ],
        },
        {
          title: "Scope",
          pieces: [
            {
              label: "In scope",
              text: "The definition of first contact for a stay change, a daily dataset for one market, freshness on the product, and source events from both platforms.",
            },
            {
              label: "Out of scope",
              text: "Cost per contact, a guest-level export, a full service warehouse, and other brands.",
            },
            {
              label: "MVP features",
              text: "A published definition, a daily first-contact dataset, and a freshness stamp the service lead can see.",
            },
            {
              label: "Non-functional needs",
              text: "Reproducible from the event log, guest identifiers scoped to the service role, and a late day marked incomplete.",
            },
            {
              label: "Acceptance criteria",
              text: "Given the first market's events for a closed day, when the dataset is published, then a service lead sees the rate, the definition, and the time it was refreshed.",
            },
          ],
        },
        {
          title: "WSJF signal",
          pieces: [
            {
              label: "User / business value",
              text: "8. A disputed metric delays every decision about the stay-change workspace.",
            },
            {
              label: "Time criticality",
              text: "7. The first market review is already using three different spreadsheets.",
            },
            {
              label: "Risk reduction / opportunity enablement",
              text: "6. Proves the event contract before cost and transfer data products.",
            },
            {
              label: "Job size",
              text: "4. One metric, one market, and one daily refresh, with the definition and the event contract included.",
            },
            {
              label: "WSJF",
              text: "Cost of delay (8 + 7 + 6 = 21) divided by job size 4 is about 5.3. Sequence this ahead of a full service warehouse.",
            },
          ],
        },
      ],
    },
    epic: {
      headline: "A business epic for a trusted stay-change metric, and the event contract that makes it mean one thing.",
      sections: [
        {
          title: "Business epic",
          pieces: [
            {
              label: "Hypothesis",
              text: "For service leads who review a disrupted stay, CS data products are a certified dataset that shows first-contact resolution with one definition. Unlike a spreadsheet each team builds, our solution is owned, refreshed daily, and tied to events both platforms already emit. We will know this is true when the Sprint Review cites that dataset and the local spreadsheets drop.",
            },
            {
              label: "Smallest test",
              text: "One metric, one market, one daily refresh. Cost per contact and transfer rate wait.",
            },
            {
              label: "Leading indicators",
              text: "Reviews that cite the certified dataset, and days the dataset arrives before the service review.",
            },
            {
              label: "Features this epic will spawn",
              text: "Published definition, daily first-contact dataset, and the freshness stamp.",
            },
            {
              label: "Acceptance criteria",
              text: "Given a completed day in the first market, when a service lead opens the data product, then first-contact resolution uses the published definition and shows when it was refreshed. The epic is accepted when the Sprint Review cites that number.",
            },
          ],
        },
        {
          title: "Enabler epic",
          pieces: [
            {
              label: "Hypothesis",
              text: "For the teams who emit service events, a case-resolved contract is an enabler that makes first conversation mean the same thing in the agent workspace and the contact center. Unlike a field each team names for itself, our solution is the contract both platforms write. We will know this is true when a staging case produces one event both sides can read.",
            },
            {
              label: "Size",
              text: "Sized for one Sprint. It unlocks the metric and does not itself present a number to service leads.",
            },
            {
              label: "Acceptance criteria",
              text: "Given a staging stay change resolved in the first conversation, when both platforms emit the event, then the contract fields match and the case can be counted once.",
            },
          ],
        },
      ],
    },
    feature: {
      headline: "Feature: Daily first-contact resolution for stay changes, finishable in one Program Increment.",
      sections: [
        {
          title: "Feature",
          pieces: [
            {
              label: "Benefit hypothesis",
              text: "Service leads stop reconciling spreadsheets when yesterday's stay-change number arrives with its definition and the time it was refreshed.",
            },
            {
              label: "Acceptance criteria",
              text: "Given a completed day in the first market, when the service lead opens the data product, then the rate, the definition, and the refresh time are visible. Given a source event is missing, when the day is built, then the day is marked incomplete.",
            },
            {
              label: "PI fit",
              text: "Sized for one Program Increment once the case-resolved event contract is on the runway.",
            },
            {
              label: "Out of this Feature",
              text: "Cost per contact and transfer rate are separate data products that depend on this definition.",
            },
          ],
        },
        {
          title: "Story split",
          pieces: [
            {
              label: "Story 1",
              text: "As a service lead, I want the definition of a first-contact stay change written next to the number, so that two teams do not argue about what was counted.",
            },
            {
              label: "Acceptance criteria: story 1",
              text: "Given the data product is open, when the lead reads the number, then the definition of first contact is on the same page.",
            },
            {
              label: "Story 2",
              text: "As a service lead, I want yesterday's first-contact resolution before the morning review, so that the review uses one number.",
            },
            {
              label: "Acceptance criteria: story 2",
              text: "Given the previous day has closed, when the morning review starts, then the dataset is present and shows the time it was refreshed.",
            },
            {
              label: "Enabler",
              text: "Case-resolved event contract shared by both platforms, sized for one Sprint, required before Story 2 is Done.",
            },
          ],
        },
      ],
    },
    "user-story": {
      headline: "Three INVEST stories for a certified stay-change metric a Sprint could pull.",
      sections: [
        {
          title: "Stories",
          pieces: [
            {
              label: "Definition beside the number",
              text: "As a service lead, I want the definition of a first-contact stay change beside the number, so that the review does not restart the argument. Estimate: compared with the last metric page. Ready when the definition is agreed with service leads.",
            },
            {
              label: "Acceptance criteria: definition beside the number",
              text: "Given the data product is open, when the lead reads first-contact resolution, then the definition is on that page. Given the definition changes, when it is published, then the number shows which definition it used.",
            },
            {
              label: "Daily refresh",
              text: "As a service lead, I want yesterday's stay-change first-contact resolution before the morning review, so that the review uses one certified number. Estimate: one Sprint after the event contract exists. Ready when the source events are named.",
            },
            {
              label: "Acceptance criteria: daily refresh",
              text: "Given the previous day has closed, when the morning review starts, then the dataset is present with its refresh time. Given a source event is missing, when the dataset is built, then that day is marked incomplete.",
            },
            {
              label: "Counted once",
              text: "As a product manager, I want each resolved stay counted once, so that the agent workspace and the contact center do not double the result. Estimate: small once the contract exists. Ready when the event contract is in staging.",
            },
            {
              label: "Acceptance criteria: counted once",
              text: "Given the same case emits an event from both platforms, when the dataset is built, then the case counts once. Given two different cases, when both are resolved in the first conversation, then both are counted.",
            },
          ],
        },
        {
          title: "Story quality",
          pieces: [
            {
              label: "INVEST check",
              text: "Each story is Independent enough to demo, Negotiable in design, Valuable to a named user, Estimable by Developers, Small for one Sprint, and Testable with given/when/then.",
            },
            {
              label: "Conversation",
              text: "Service leads and the data owner agree the definition in refinement. Developers on both platforms challenge the event contract before Sprint Planning.",
            },
          ],
        },
      ],
    },
    "product-backlog": {
      headline: "Product Goal: a service lead trusts one number for stay-change first-contact resolution.",
      sections: [
        {
          title: "Product Goal",
          pieces: [
            {
              label: "Commitment",
              text: "Within one quarter, service leads review stay changes with one certified first-contact number for the first market, refreshed before the morning review.",
            },
            {
              label: "How we inspect it",
              text: "Share of reviews that cite the certified dataset, and days the dataset is late, reviewed every Sprint Review.",
            },
          ],
        },
        {
          title: "Ordered Product Backlog",
          pieces: [
            {
              label: "1. Definition of first contact",
              text: "Description: publish what counts as resolving a stay change in the first conversation. Order: 1. Value: the argument about the metric stops. Size: against the last metric page. Acceptance criteria: given the data product is open, when a lead reads the number, then the definition is on that page.",
            },
            {
              label: "2. Case-resolved event",
              text: "Description: enabler contract both platforms write when a stay change ends in the first conversation. Order: 2. Value: unlocks the dataset. Size: fits one Sprint. Acceptance criteria: given a staging case resolved on the first contact, when both platforms emit the event, then the fields match.",
            },
            {
              label: "3. Daily dataset",
              text: "Description: publish yesterday's first-contact resolution for the first market before the morning review. Order: 3. Value: the review uses one number. Size: after the contract exists. Acceptance criteria: given the day has closed, when the review starts, then the dataset shows the rate and the refresh time.",
            },
            {
              label: "4. Freshness stamp",
              text: "Description: show whether the dataset for a day is complete or late. Order: 4. Value: a late number is not treated as final. Acceptance criteria: given a missing source event, when the dataset is built, then the day is marked incomplete.",
            },
            {
              label: "5. Cost per contact",
              text: "Description: later. Order: 5. Value: adds the cost side of the hypothesis. The smallest test is first-contact resolution, so this stays below the test. Acceptance criteria are written when this item is refined, not before.",
            },
          ],
        },
      ],
    },
    "sprint-backlog": {
      headline: "Sprint Goal: by Friday, a service lead can read the definition of a first-contact stay change.",
      sections: [
        {
          title: "Why this Sprint is valuable",
          pieces: [
            {
              label: "Sprint Goal",
              text: "By Friday, a service lead can read the definition of a first-contact stay change on the data product. That is the commitment for this Sprint.",
            },
            {
              label: "Why",
              text: "The review currently restarts the argument about what was counted. This Sprint publishes the definition the dataset will use.",
            },
          ],
        },
        {
          title: "Forecast",
          pieces: [
            {
              label: "Selected items",
              text: "Developers pull the definition page and the case-resolved event contract. The daily dataset stays on the Product Backlog.",
            },
            {
              label: "Acceptance criteria",
              text: "Definition: given the data product is open, when a lead reads it, then the definition of first contact is on the page. Event contract: given a staging case, when it is resolved on the first contact, then both platforms emit the same fields. The daily dataset acceptance criteria stay on the Product Backlog.",
            },
            {
              label: "Plan for the first days",
              text: "Day 1: agree the definition with service leads. Day 2: write the event contract against a staging case. The Daily Scrum checks the Sprint Goal.",
            },
            {
              label: "Forecast, not a promise",
              text: "The forecast is these two items. If the definition is not agreed, Developers narrow to the contract draft and keep the Sprint Goal.",
            },
          ],
        },
      ],
    },
    increment: {
      headline: "Increment: the first-contact definition is published, and the event contract meets the Definition of Done.",
      sections: [
        {
          title: "This Increment",
          pieces: [
            {
              label: "What is Done",
              text: "The data product shows the definition of a first-contact stay change, and a staging case emits one matching case-resolved event from both platforms.",
            },
            {
              label: "What is not Done",
              text: "The daily dataset and the freshness stamp are not part of this Increment. They remain on the Product Backlog.",
            },
            {
              label: "Usable now",
              text: "Service leads can read the definition in the Sprint Review even if the daily number waits for the next Sprint.",
            },
            {
              label: "Acceptance criteria met",
              text: "The definition meets its acceptance criteria: a lead reading the product sees what counts as first contact. The event contract meets its acceptance criteria: one staging case produces the same fields from both platforms.",
            },
          ],
        },
        {
          title: "Definition of Done",
          pieces: [
            {
              label: "Quality bar",
              text: "Definition reviewed by service leads, event contract tested against a staging case, and no guest identifier stored beyond the service role.",
            },
            {
              label: "Observable",
              text: "Each case-resolved event records the case, the market, and whether it was the first conversation.",
            },
            {
              label: "If it is not Done",
              text: "Any item that misses this bar returns to the Product Backlog. It is not presented as complete at the Sprint Review.",
            },
          ],
        },
      ],
    },
  },
};

const PERSONAS: Record<ArtifactProductId, ArtifactPiece[]> = {
  "unified-agent": [
    {
      label: "Guest",
      text: "A traveler whose stay is disrupted. They want one clear resolution in the conversation, and they do not want to tell the story twice.",
    },
    {
      label: "Service agent",
      text: "A customer service agent on a travel marketplace the size of Booking.com. They need the booking, the property status, and one allowed change on the open case.",
    },
    {
      label: "Service lead",
      text: "A team lead for the first market. They watch first-contact resolution and decide whether the agent workspace is helping guests.",
    },
  ],
  "contact-center": [
    {
      label: "Guest",
      text: "A traveler calling about a disrupted stay. They want the first agent who answers to be able to finish the change.",
    },
    {
      label: "Routing lead",
      text: "The lead who decides which skill receives stay-change calls, and who checks that the wait stays inside the service target.",
    },
    {
      label: "Service agent",
      text: "An agent who should receive only the calls their skill can finish, then open that trip in the Unified Agent Platform.",
    },
  ],
  "cs-data": [
    {
      label: "Service lead",
      text: "A team lead who needs one certified first-contact number before the morning review, with the definition beside it.",
    },
    {
      label: "Product manager",
      text: "The manager who uses that number to decide whether the agent workspace and the routing rule are working.",
    },
    {
      label: "Data owner",
      text: "The owner who publishes the definition and the daily dataset, and marks a day incomplete when a source event is missing.",
    },
  ],
};

function peopleSections(artifact: ArtifactId, product: ArtifactProductId): ArtifactSection[] {
  return [
    { title: "Personas", pieces: PERSONAS[product] },
    { title: "Stakeholders", pieces: raciPieces(artifact, product) },
  ];
}

function raciPieces(artifact: ArtifactId, product: ArtifactProductId): ArtifactPiece[] {
  const focus =
    product === "unified-agent"
      ? "the case view and the property-status feed"
      : product === "contact-center"
        ? "the skill tag and the voice routing rule"
        : "the definition and the daily first-contact dataset";
  const owner =
    product === "unified-agent"
      ? "Product Owner for the agent workspace"
      : product === "contact-center"
        ? "Product Owner for the contact center"
        : "Product Owner for CS data products";
  const consult =
    product === "unified-agent"
      ? "Service leads confirm the allowed change, and property systems confirm the status feed"
      : product === "contact-center"
        ? "Routing leads confirm the skill list, and the agent workspace confirms the trip handoff"
        : "Service leads agree the definition, and both platforms confirm the case-resolved event";
  const inform =
    product === "unified-agent"
      ? "Contact-center routing leads and marketplace operations"
      : product === "contact-center"
        ? "Service leads and marketplace operations"
        : "The agent-workspace and contact-center teams who will cite the number";

  if (artifact === "lean-business-case") {
    return [
      { label: "Responsible", text: `The epic owner writes this case, the MVP boundary, and the leading indicators for ${focus}.` },
      { label: "Accountable", text: "The business owner for customer service decides go, no-go, or pivot. Only one person is accountable for that call." },
      { label: "Consulted", text: `${consult}. They test the hypothesis and the cost of delay before the decision.` },
      { label: "Informed", text: `${inform} see the decision and the indicators. They do not hold a second vote.` },
    ];
  }
  if (artifact === "epic") {
    return [
      { label: "Responsible", text: `The teams on the release train split the epic into features and deliver the smallest test of ${focus}.` },
      { label: "Accountable", text: "The epic owner keeps the hypothesis, the acceptance criteria, and the decision to continue or stop." },
      { label: "Consulted", text: `${consult} before a feature is pulled into a Program Increment.` },
      { label: "Informed", text: `${inform} see the leading indicators each Program Increment.` },
    ];
  }
  if (artifact === "feature") {
    return [
      { label: "Responsible", text: `One Agile team implements the stories and the enabler for ${focus} inside the Program Increment.` },
      { label: "Accountable", text: "Product management accepts the feature against the benefit hypothesis and the acceptance criteria." },
      { label: "Consulted", text: `${consult}, and the epic owner checks that the slice still serves the smallest test.` },
      { label: "Informed", text: `${inform} hear when the feature is Done so dependent work can start.` },
    ];
  }
  if (artifact === "user-story") {
    return [
      { label: "Responsible", text: `Developers design, build, and test each story in ${focus}. They estimate the story.` },
      { label: "Accountable", text: `The ${owner} accepts each story against its acceptance criteria and orders it on the backlog.` },
      { label: "Consulted", text: `${consult} during refinement, while the story can still change.` },
      { label: "Informed", text: `${inform} see the story move at the Sprint Review.` },
    ];
  }
  if (artifact === "product-backlog") {
    return [
      { label: "Responsible", text: `Developers estimate items in ${focus} and raise gaps in refinement. They do not reorder the list.` },
      { label: "Accountable", text: `The ${owner} orders the Product Backlog and states the Product Goal. Only one person is accountable for the order.` },
      { label: "Consulted", text: `${consult} when value or the next slice is in question.` },
      { label: "Informed", text: `${inform} see the order change at the Sprint Review. The backlog is not a release promise.` },
    ];
  }
  if (artifact === "sprint-backlog") {
    return [
      { label: "Responsible", text: `Developers pull the forecast for ${focus}, write the plan for the first days, and adapt that plan at the Daily Scrum.` },
      { label: "Accountable", text: "The Developers as a group answer for the Sprint Backlog. The Product Owner does not assign the work." },
      { label: "Consulted", text: `The ${owner} clarifies the Sprint Goal and the acceptance criteria when the plan needs it. ${consult}.` },
      { label: "Informed", text: `${inform} hear the result at the Sprint Review, not through a status report during the Sprint.` },
    ];
  }
  if (artifact === "increment") {
    return [
      { label: "Responsible", text: `Developers bring ${focus} to the Definition of Done. Work that misses the bar returns to the Product Backlog.` },
      { label: "Accountable", text: "The Developers own the Definition of Done. The Product Owner answers for whether the Increment serves the Product Goal." },
      { label: "Consulted", text: `${consult} while inspecting the working Increment at the Sprint Review.` },
      { label: "Informed", text: `${inform} see what is Done and what returned to the Product Backlog.` },
    ];
  }
  return [
    { label: "Responsible", text: `Developers build ${focus}. They estimate the stories and meet the Definition of Done.` },
    { label: "Accountable", text: `The ${owner} answers for this requirement and for the order of its stories. Only one person is accountable.` },
    { label: "Consulted", text: `${consult} before the requirement is called ready for the backlog.` },
    { label: "Informed", text: `${inform} hear the outcome at the Sprint Review. They do not approve the design.` },
  ];
}

for (const productId of Object.keys(EXAMPLES) as ArtifactProductId[]) {
  for (const artifactId of Object.keys(EXAMPLES[productId]) as ArtifactId[]) {
    EXAMPLES[productId][artifactId].sections.splice(1, 0, ...peopleSections(artifactId, productId));
  }
}

export function artifactGuide(id: ArtifactId): ArtifactGuide {
  return ARTIFACT_GUIDES.find((item) => item.id === id) ?? ARTIFACT_GUIDES[0]!;
}

export function artifactExample(artifact: ArtifactId, product: ArtifactProductId): ArtifactExample {
  return EXAMPLES[product][artifact];
}

export interface ArtifactClause {
  name?: string;
  given: string;
  when: string;
  then: string;
}

export interface ArtifactStoryView {
  kind: "story";
  article: string;
  role: string;
  want: string;
  reason: string;
  estimate?: string;
  ready?: string;
}

export interface ArtifactCriteriaView {
  kind: "criteria";
  lead?: string;
  items: ArtifactClause[];
  tail?: string;
}

export interface ArtifactRecordView {
  kind: "record";
  description: string;
  order?: string;
  value?: string;
  size?: string;
  note?: string;
  criteria: ArtifactClause[];
  criteriaNote?: string;
}

export interface ArtifactProseView {
  kind: "prose";
  text: string;
}

export type ArtifactPieceView = ArtifactStoryView | ArtifactCriteriaView | ArtifactRecordView | ArtifactProseView;

/** Turn example prose into the shape a reader expects: a story, a spec, or a backlog line. */
export function presentArtifactPiece(text: string): ArtifactPieceView {
  const story = presentStory(text);
  if (story) return story;
  const record = presentRecord(text);
  if (record) return record;
  const criteria = presentCriteria(text);
  if (criteria) return criteria;
  return { kind: "prose", text };
}

function presentStory(text: string): ArtifactStoryView | null {
  const match = text.match(
    /^As (an?)\s+(.+?),\s*I want\s+(.+?),\s*so that\s+(.+?)\.?\s*(?:Estimate:\s*(.+?)\.)?\s*(?:Ready when\s+(.+?))?\.?\s*$/i,
  );
  if (!match) return null;
  return {
    kind: "story",
    article: match[1]!.toLowerCase(),
    role: clean(match[2]),
    want: clean(match[3]),
    reason: clean(match[4]),
    estimate: match[5] ? clean(match[5]) : undefined,
    ready: match[6] ? clean(match[6]) : undefined,
  };
}

function presentRecord(text: string): ArtifactRecordView | null {
  if (!/^Description:/i.test(text)) return null;
  const criteriaAre = text.match(/\s+Acceptance criteria are\s+([\s\S]+)$/i);
  const criteriaColon = text.match(/\s+Acceptance criteria:\s+([\s\S]+)$/i);
  const head = text.replace(/\s+Acceptance criteria(?::| are)[\s\S]*$/i, "");
  const labeled = labeledFields(head, ["Description", "Order", "Value", "Size"]);
  const criteria = criteriaColon ? clausesIn(criteriaColon[1]) : [];
  return {
    kind: "record",
    description: capitalize(clean(labeled.Description ?? head.replace(/^Description:\s*/i, ""))),
    order: labeled.Order?.replace(/\.$/, ""),
    value: labeled.Value,
    size: labeled.Size,
    criteria,
    criteriaNote: criteriaAre ? capitalize(clean(criteriaAre[1])) : undefined,
  };
}

function presentCriteria(text: string): ArtifactCriteriaView | null {
  const parts = text
    .split(/(?<=\.)\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const items: ArtifactClause[] = [];
  const lead: string[] = [];
  const tail: string[] = [];
  let seen = false;
  for (const part of parts) {
    const clause = clauseFrom(part);
    if (clause) {
      items.push(clause);
      seen = true;
    } else if (seen) tail.push(part);
    else lead.push(part);
  }
  if (items.length === 0) return null;
  return {
    kind: "criteria",
    lead: lead.length ? lead.join(" ") : undefined,
    items,
    tail: tail.length ? tail.join(" ") : undefined,
  };
}

function clausesIn(text: string): ArtifactClause[] {
  return text
    .split(/(?<=\.)\s+/)
    .map((part) => clauseFrom(part.trim()))
    .filter((clause): clause is ArtifactClause => clause !== null);
}

function clauseFrom(sentence: string): ArtifactClause | null {
  const match = sentence.match(/^(?:([^:]{2,48}):\s*)?[Gg]iven\s+(.+?),\s*when\s+(.+?),\s*then\s+(.+?)\.?$/);
  if (!match) return null;
  return {
    name: match[1] ? clean(match[1]) : undefined,
    given: clean(match[2]),
    when: clean(match[3]),
    then: clean(match[4]),
  };
}

function labeledFields(text: string, labels: string[]): Record<string, string> {
  const pattern = new RegExp(`\\b(${labels.join("|")}):\\s*`, "gi");
  const hits: { label: string; index: number; start: number }[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    hits.push({ label: match[1], index: match.index, start: match.index + match[0].length });
  }
  const out: Record<string, string> = {};
  hits.forEach((hit, index) => {
    const end = hits[index + 1]?.index ?? text.length;
    const key = hit.label[0]!.toUpperCase() + hit.label.slice(1).toLowerCase();
    out[key] = clean(text.slice(hit.start, end));
  });
  return out;
}

function clean(value: string): string {
  return value.replace(/\s+/g, " ").replace(/[.\s]+$/, "").trim();
}

function capitalize(value: string): string {
  return value ? value[0]!.toUpperCase() + value.slice(1) : value;
}
