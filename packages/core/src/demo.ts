import { createId } from "./ids";
import {
  LIMITS,
  type ActionItem,
  type ColumnTone,
  type FeedbackNote,
  type Horizon,
  type ImpactLevel,
  type Initiative,
  type Participant,
  type RetroCard,
  type RetroColumn,
  type ReviewDecision,
} from "./types";

export const DEMO_NOTES_PER_COLUMN = 10;

/** Professional note banks keyed by column tone — used for every template column. */
const TONE_NOTES: Record<ColumnTone, string[]> = {
  good: [
    "The Definition of Done gate caught two incomplete stories before review.",
    "Pairing on the checkout defect cut mean time to recovery under two hours.",
    "The weekly stakeholder walkthrough unblocked three product decisions.",
    "Clear owner on the release checklist meant staging stayed green all week.",
    "Async design critique on Wednesday removed a full day of rework.",
    "Feature flags let us ship the payout retry path without a big-bang cutover.",
    "Support macros for the new empty states dropped related tickets by half.",
    "The runbook for failed webhooks was used successfully twice this sprint.",
    "Cross-team sync with Payments closed the retry-token gap before build.",
    "Automated screenshot checks stopped a visual regression on the invoice page.",
    "Customer advisory quotes landed in the release notes the same day.",
    "The team protected focus time on Tuesdays and finished the critical path early.",
  ],
  bad: [
    "Scope crept in mid-sprint without a backlog trade, stretching the critical path.",
    "Staging deploys failed twice and ownership of the fix stayed ambiguous.",
    "Review comments arrived the day before sprint end, too late to act.",
    "We debated API shape in standup instead of a short design spike.",
    "Missing analytics events blocked the outcome readout in review.",
    "A flaky CI job burned half a day before anyone owned the quarantine.",
    "Hand-offs between frontend and backend still needed same-day Slack archaeology.",
    "Production config drifted from staging; the demo path only worked locally.",
    "We under-estimated dependency wait time on the ledger team by a full week.",
    "Incident follow-ups stayed in a doc nobody opened during planning.",
    "Acceptance criteria were unclear until QA found the edge case live.",
    "The spike ran long and silently consumed capacity meant for the user journey.",
  ],
  idea: [
    "Start a 15-minute pre-merge checklist for payments-related pull requests.",
    "Add a single deploy owner named before every staging promotion.",
    "Spike a contract test against the payouts API before the next build.",
    "Publish a one-page decision log after each stakeholder walkthrough.",
    "Introduce a mid-sprint scope trade ritual when new work appears.",
    "Instrument the retry flow with a success-rate dashboard before GA.",
    "Trial feature-owner office hours twice a week for support escalations.",
    "Carve a fixed spike budget in planning so research stops stealing delivery.",
    "Mirror production feature flags into staging for every demo path.",
    "Write acceptance examples with QA in the same session as story kickoff.",
    "Create a lightweight RFC template for cross-team API changes.",
    "Reserve Friday for hardening and docs instead of starting new stories.",
  ],
  neutral: [
    "We still do not know why webhook retries spike on Mondays.",
    "Dependency lead time from Finance remains a planning unknown.",
    "Is the payments sandbox representative enough for stakeholder demos?",
    "How should we measure “recovered payout without support” in production?",
    "What is the true effort to migrate the remaining legacy invoice templates?",
    "Do we need a dedicated on-call for the next two sprints of cutover?",
    "Which backlog items are waiting on legal review, and for how long?",
    "Should outcome metrics live in the product dashboard or a shared Looker folder?",
    "How do we retire the temporary admin workaround without a second project?",
    "What is the risk if the retry token expires while the merchant is mid-flow?",
    "Are we double-counting effort across Platform and Growth for the same bet?",
    "When does the spike become a commitment versus a throwaway experiment?",
  ],
};

/** Extra flavor for well-known classic column ids (still professional delivery language). */
const COLUMN_NOTES: Record<string, string[]> = {
  start: TONE_NOTES.idea,
  stop: TONE_NOTES.bad,
  continue: TONE_NOTES.good,
  liked: TONE_NOTES.good,
  learned: [
    "Contract tests against payments would have caught the retry-token mismatch earlier.",
    "Naming a single release owner removes thrash when staging goes red.",
    "Stakeholders decide faster when the goal is stated before the first click.",
    "Feature flags turn a risky cutover into a reversible experiment.",
    "Writing acceptance examples with QA at kickoff prevents late surprises.",
    "Async critique beats late review comments the day before the end of sprint.",
    "Support macros should ship with the empty state, not a week later.",
    "Flaky CI must be quarantined the same day or it owns the calendar.",
    "Scope trades need an explicit cut, not optimism that “we will fit it in.”",
    "Outcome metrics belong in the review script, not a slide after the demo.",
  ],
  lacked: TONE_NOTES.bad,
  longed: TONE_NOTES.neutral,
  mad: TONE_NOTES.bad,
  sad: [
    "We dropped the accessibility pass and had to reopen the invoice story.",
    "A promising spike was abandoned without capturing the learning.",
    "Customer quotes arrived after the release notes were already frozen.",
    "The team lost a day to environment drift that staging should have mirrored.",
    "We committed to a date before Finance confirmed the meter design.",
    "Pairing stopped mid-sprint and knowledge concentrated on one person again.",
    "The demo path worked only on a laptop, not the stakeholder environment.",
    "We celebrated shipping while the outcome metric was still dark.",
    "Follow-ups from the last incident never made it into this sprint’s plan.",
    "A quiet disagreement about API ownership surfaced too late to resolve cleanly.",
  ],
  glad: TONE_NOTES.good,
};

export type DemoAuthor = Pick<Participant, "id" | "name">;

export function demoNotesForColumns(
  columns: RetroColumn[],
  authors: DemoAuthor[],
  now: string,
): RetroCard[] {
  const cards: RetroCard[] = [];
  for (const column of columns) {
    const lines = pickLines(column, DEMO_NOTES_PER_COLUMN);
    lines.forEach((body, index) => {
      const author = authors[index % authors.length] ?? authors[0]!;
      cards.push({
        id: createId("card"),
        columnId: column.id,
        body: body.slice(0, LIMITS.card),
        authorId: author.id,
        anonymous: index % 7 === 0,
        votes: index < 3 ? authors.slice(0, Math.min(2, authors.length)).map((person) => person.id) : [],
        createdAt: now,
      });
    });
  }
  return cards;
}

function pickLines(column: RetroColumn, count: number): string[] {
  const bank = COLUMN_NOTES[column.id] ?? TONE_NOTES[column.tone] ?? TONE_NOTES.neutral;
  const lines: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const base = bank[index % bank.length] ?? TONE_NOTES.neutral[index % TONE_NOTES.neutral.length]!;
    // Keep pop-culture boards readable: ground the note in the column lens without losing professionalism.
    const withLens =
      column.title.length > 0 && !COLUMN_NOTES[column.id]
        ? `${base} (${column.title})`
        : base;
    lines.push(withLens.slice(0, LIMITS.card));
  }
  return lines;
}

export function demoActions(authors: DemoAuthor[], sourceCardId: string | null): ActionItem[] {
  const owner = (index: number) => authors[index % authors.length]?.id ?? null;
  return [
    {
      id: "act_demoowner01",
      body: "Name a deploy owner before the next staging promotion.",
      ownerId: owner(1),
      done: false,
      sourceCardId,
    },
    {
      id: "act_democontract01",
      body: "Add a contract test for the payout retry token before the next build.",
      ownerId: owner(0),
      done: false,
      sourceCardId: null,
    },
    {
      id: "act_demoflags01",
      body: "Mirror production feature flags into staging for the merchant demo path.",
      ownerId: owner(2),
      done: true,
      sourceCardId: null,
    },
    {
      id: "act_demometrics01",
      body: "Publish the payout-recovery success rate on the shared dashboard.",
      ownerId: owner(1),
      done: false,
      sourceCardId: null,
    },
    {
      id: "act_demorunbook01",
      body: "Update the webhook failure runbook with Monday spike findings.",
      ownerId: owner(0),
      done: false,
      sourceCardId: null,
    },
  ];
}

export function demoReviewContent(authors: DemoAuthor[], now: string): {
  goal: string;
  decision: ReviewDecision;
  decisionNotes: string;
  feedback: FeedbackNote[];
  checkedItemIds: string[];
} {
  const [host, alex, sam, jordan] = padAuthors(authors);
  return {
    goal: "A merchant can retry a failed payout in under two minutes without contacting support, and Finance can see the recovery rate the same day.",
    decision: "ship",
    decisionNotes:
      "Ship behind the existing payouts flag to 10% of merchants. Monitor recovery rate and support ticket volume for 48 hours. Iterate on failure-reason copy if Finance still asks for clarification. Hold only if the sandbox path diverges from production.",
    feedback: [
      {
        id: "note_demopraise01",
        authorId: alex.id,
        kind: "praise",
        body: "The journey from failed payout email → retry → confirmation is clear enough for a first-time merchant.",
        createdAt: now,
      },
      {
        id: "note_demopraise02",
        authorId: jordan.id,
        kind: "praise",
        body: "Calling out unfinished work up front made the conversation about outcomes, not surprises.",
        createdAt: now,
      },
      {
        id: "note_demopraise03",
        authorId: sam.id,
        kind: "praise",
        body: "The metrics slide matched the sprint goal. Support can already see fewer “where is my money” threads in the pilot.",
        createdAt: now,
      },
      {
        id: "note_demochange01",
        authorId: sam.id,
        kind: "change",
        body: "Show the payout failure reason before the retry button. Finance asked for that context twice in the room.",
        createdAt: now,
      },
      {
        id: "note_demochange02",
        authorId: host.id,
        kind: "change",
        body: "Add a support macro link on the confirmation screen for edge cases the API cannot recover automatically.",
        createdAt: now,
      },
      {
        id: "note_demochange03",
        authorId: alex.id,
        kind: "change",
        body: "Announce the 10% flag rollout in the customer changelog before we raise exposure.",
        createdAt: now,
      },
      {
        id: "note_demoask01",
        authorId: jordan.id,
        kind: "question",
        body: "What is the rollback path if recovery rate drops below 85% in the first 48 hours?",
        createdAt: now,
      },
      {
        id: "note_demoask02",
        authorId: sam.id,
        kind: "question",
        body: "Does the retry token expire while the merchant is mid-flow, and how do we message that?",
        createdAt: now,
      },
      {
        id: "note_demoask03",
        authorId: host.id,
        kind: "question",
        body: "Who owns the dashboard alert if support ticket volume spikes after we expand the flag?",
        createdAt: now,
      },
    ],
    checkedItemIds: [
      "goal-visible",
      "dod",
      "undone",
      "environment",
      "stakeholders",
      "journey",
      "acceptance",
      "outcome-stated",
      "metrics",
      "bugs",
      "quality-bar",
      "notes",
      "feedback-live",
      "scope",
      "decision-made",
      "backlog",
    ],
  };
}

export function demoRoadmapContent(authors: DemoAuthor[]): {
  objective: string;
  initiatives: Initiative[];
} {
  const [host, alex, sam, jordan] = padAuthors(authors);
  return {
    objective:
      "Reduce failed-payout support contacts by 40% this quarter and open a credible path to usage-based pricing without jeopardizing Finance close.",
    initiatives: [
      initiative("bet_demoquick01", {
        title: "Self-serve payout retry",
        outcome: "Merchants recover a failed payout without a support ticket.",
        assumption: "The payments API already returns a retry token.",
        reach: 800,
        impact: 2,
        confidence: 0.8,
        effort: 1.5,
        iceImpact: 8,
        iceConfidence: 8,
        iceEase: 8,
        value: 8,
        complexityTechnical: 2,
        complexityDependency: 2,
        complexityUncertainty: 2,
        horizon: "now",
        ownerId: host.id,
      }),
      initiative("bet_demobig001", {
        title: "Usage-based billing",
        outcome: "Revenue tracks actual payout volume instead of a flat plan.",
        assumption: "Finance can close the books on a new meter this quarter.",
        reach: 5000,
        impact: 3,
        confidence: 0.5,
        effort: 8,
        iceImpact: 9,
        iceConfidence: 4,
        iceEase: 3,
        value: 9,
        complexityTechnical: 5,
        complexityDependency: 5,
        complexityUncertainty: 4,
        horizon: "later",
        ownerId: alex.id,
      }),
      initiative("bet_demofill001", {
        title: "Admin theme refresh",
        outcome: "Internal tools look like the product. No customer metric moves.",
        assumption: "Design system tokens already exist.",
        reach: 12,
        impact: 0.25,
        confidence: 1,
        effort: 2,
        iceImpact: 3,
        iceConfidence: 8,
        iceEase: 9,
        value: 2,
        complexityTechnical: 2,
        complexityDependency: 1,
        complexityUncertainty: 1,
        horizon: "later",
        ownerId: null,
      }),
      initiative("bet_demopark001", {
        title: "Replace the ledger database",
        outcome: "Nightly reconciliation finishes before finance arrives.",
        assumption: "We have not measured where the time goes.",
        reach: 40,
        impact: 1,
        confidence: 0.4,
        effort: 10,
        iceImpact: 4,
        iceConfidence: 3,
        iceEase: 2,
        value: 4,
        complexityTechnical: 5,
        complexityDependency: 4,
        complexityUncertainty: 5,
        horizon: "later",
        ownerId: sam.id,
      }),
      initiative("bet_demofailreason", {
        title: "Payout failure reason in UI",
        outcome: "Merchants understand why a payout failed before they retry.",
        assumption: "Provider reason codes map cleanly to merchant-safe copy.",
        reach: 800,
        impact: 1,
        confidence: 0.9,
        effort: 1,
        iceImpact: 7,
        iceConfidence: 9,
        iceEase: 8,
        value: 7,
        complexityTechnical: 2,
        complexityDependency: 2,
        complexityUncertainty: 2,
        horizon: "now",
        ownerId: jordan.id,
      }),
      initiative("bet_demosupportmacro", {
        title: "Support macros for recovery edge cases",
        outcome: "Agents resolve non-retryable payouts in one reply.",
        assumption: "Support can maintain macros without engineering for each code.",
        reach: 120,
        impact: 0.5,
        confidence: 0.85,
        effort: 0.5,
        iceImpact: 5,
        iceConfidence: 8,
        iceEase: 9,
        value: 5,
        complexityTechnical: 1,
        complexityDependency: 2,
        complexityUncertainty: 1,
        horizon: "now",
        ownerId: sam.id,
      }),
      initiative("bet_demodashboard", {
        title: "Payout recovery dashboard",
        outcome: "Product and Finance share one daily recovery-rate number.",
        assumption: "Warehouse events for retries are already reliable.",
        reach: 30,
        impact: 1,
        confidence: 0.75,
        effort: 2,
        iceImpact: 6,
        iceConfidence: 7,
        iceEase: 6,
        value: 6,
        complexityTechnical: 3,
        complexityDependency: 3,
        complexityUncertainty: 2,
        horizon: "next",
        ownerId: alex.id,
      }),
      initiative("bet_democontract", {
        title: "Payments API contract tests",
        outcome: "Breaking retry-token changes fail CI before staging.",
        assumption: "We can run a sandbox suite in under five minutes.",
        reach: 8,
        impact: 2,
        confidence: 0.85,
        effort: 2,
        iceImpact: 7,
        iceConfidence: 8,
        iceEase: 6,
        value: 7,
        complexityTechnical: 3,
        complexityDependency: 2,
        complexityUncertainty: 2,
        horizon: "next",
        ownerId: host.id,
      }),
      initiative("bet_demoinvoice", {
        title: "Legacy invoice template migration",
        outcome: "All active merchants render invoices from the new template engine.",
        assumption: "Legal will approve the remaining three templates this month.",
        reach: 2200,
        impact: 1,
        confidence: 0.55,
        effort: 5,
        iceImpact: 6,
        iceConfidence: 5,
        iceEase: 4,
        value: 6,
        complexityTechnical: 4,
        complexityDependency: 4,
        complexityUncertainty: 3,
        horizon: "next",
        ownerId: jordan.id,
      }),
      initiative("bet_demooncall", {
        title: "Dedicated payouts on-call rotation",
        outcome: "P1 payout incidents page a trained owner within five minutes.",
        assumption: "Volume justifies a rotation without burning the whole team.",
        reach: 15,
        impact: 2,
        confidence: 0.6,
        effort: 3,
        iceImpact: 7,
        iceConfidence: 5,
        iceEase: 5,
        value: 7,
        complexityTechnical: 2,
        complexityDependency: 3,
        complexityUncertainty: 3,
        horizon: "next",
        ownerId: sam.id,
      }),
    ],
  };
}

function padAuthors(authors: DemoAuthor[]): [DemoAuthor, DemoAuthor, DemoAuthor, DemoAuthor] {
  const fallback: DemoAuthor[] = [
    { id: "person_hostdemo01", name: "Host" },
    { id: "person_alexdemo01", name: "Alex Rivera" },
    { id: "person_samdemo001", name: "Sam Okonkwo" },
    { id: "person_jordandemo1", name: "Jordan Lee" },
  ];
  const list = [...authors];
  while (list.length < 4) list.push(fallback[list.length]!);
  return [list[0]!, list[1]!, list[2]!, list[3]!];
}

function initiative(
  id: string,
  patch: {
    title: string;
    outcome: string;
    assumption: string;
    reach: number;
    impact: ImpactLevel;
    confidence: number;
    effort: number;
    iceImpact: number;
    iceConfidence: number;
    iceEase: number;
    value: number;
    complexityTechnical: number;
    complexityDependency: number;
    complexityUncertainty: number;
    horizon: Horizon;
    ownerId: string | null;
  },
): Initiative {
  return { id, ...patch };
}
