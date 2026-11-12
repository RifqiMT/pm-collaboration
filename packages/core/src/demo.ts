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

const DEMO_NOTES_PER_COLUMN = 10;

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
  wind: [
    "Pairing on the checkout defect kept the recovery work moving the same day.",
    "The stakeholder walkthrough unblocked three decisions before the build froze.",
    "A named release owner meant staging went red once and recovered in the hour.",
    "Feature flags let the payout retry ship without waiting for a full cutover.",
    "Wednesday design critique removed a day of rework before code started.",
    "Support joined planning and the empty-state copy was right the first time.",
    "The webhook runbook was opened during the incident and the steps held.",
    "Contract sketches with Payments closed the retry-token gap before coding.",
    "Protected Tuesday focus finished the critical path a day early.",
    "Screenshot checks caught the invoice regression before anyone demoed it.",
  ],
  anchor: [
    "Scope arrived mid-sprint with no story removed, and the critical path slipped.",
    "Staging failed twice and the room spent a day deciding who owned the fix.",
    "Review comments landed the afternoon before sprint end.",
    "Standup became an API debate that belonged in a thirty-minute spike.",
    "A flaky CI job owned half a day before anyone quarantined it.",
    "Frontend and backend reconstructed decisions from Slack instead of a note.",
    "The ledger dependency was planned as two days and took the week.",
    "Acceptance criteria stayed vague until QA hit the edge case in staging.",
    "The spike quietly used capacity that was promised to the user journey.",
    "Incident follow-ups lived in a doc that planning never opened.",
  ],
  rocks: [
    "Webhook retries still spike on Mondays and we do not know why.",
    "The payments sandbox may not match what stakeholders will actually see.",
    "Finance has not confirmed the meter design the next date depends on.",
    "A retry token can expire while the merchant is still in the flow.",
    "Legal review is sitting on three invoice templates with no date.",
    "We may be counting the same effort on both Platform and Growth.",
    "The temporary admin workaround has no retirement date.",
    "Outcome events for recovered payouts are not reliable enough to quote.",
    "On-call coverage for the cutover is assumed, not staffed.",
    "The spike has no rule for when it becomes a commitment.",
  ],
  island: [
    "A merchant retries a failed payout in under two minutes, without support.",
    "Finance sees the recovery rate on the shared dashboard the same day.",
    "Staging uses the same feature flags as the stakeholder demo.",
    "Every payments pull request passes a five-minute contract check.",
    "Failure reasons are written for merchants, not copied from the provider.",
    "The next sprint starts from an updated backlog, not last week’s list.",
    "Support macros for non-retryable codes ship with the flow, not after it.",
    "The release notes state the flag, the known edge, and the owner of the watch.",
    "Accessibility on the retry path is part of done, not a follow-up story.",
    "The team can say the sprint goal in one sentence before the first click.",
  ],
  rose: [
    "The Definition of Done gate stopped two unfinished stories from entering review.",
    "Pairing cut the checkout recovery to under two hours.",
    "The release checklist had one owner and staging stayed green.",
    "Feature flags made the payout retry reversible.",
    "Support macros shipped with the empty state and tickets dropped.",
    "The webhook runbook worked the two times we needed it.",
    "Customer quotes made the release notes the same day.",
    "Cross-team sync with Payments closed the token gap before build.",
    "Automated screenshots caught the invoice regression.",
    "Focus time on Tuesday finished the critical path early.",
  ],
  bud: [
    "Contract tests against payouts are sketched, not running in CI yet.",
    "The recovery dashboard has the events, and not the daily number Finance wants.",
    "Failure-reason copy exists for two codes and needs the rest.",
    "Office hours with support started once and already deflected an escalation.",
    "The decision log after walkthroughs is a doc, not yet a habit.",
    "A mid-sprint scope trade was tried once and needs a named trigger.",
    "Acceptance examples with QA happened on one story and should be the default.",
    "The staging flag mirror works for payouts and not for the rest of the product.",
    "The spike budget was named in planning and then ignored. Keep the name, use it.",
    "The changelog draft is internal. It is ready to become the customer note.",
  ],
  thorn: [
    "We demoed a path that only existed on one laptop.",
    "Scope grew and nothing left the sprint to pay for it.",
    "Review feedback arrived too late to change the increment.",
    "Missing analytics meant the review had a story and no number.",
    "Config drift made staging lie about production.",
    "One person held the payments context after pairing stopped.",
    "We announced a date before Finance confirmed the meter.",
    "The accessibility pass was dropped and the invoice story reopened.",
    "A spike was abandoned without writing down what it taught.",
    "Incident actions from last time never entered this sprint.",
  ],
  well: [
    "Saying the goal before the demo kept the room on the journey.",
    "One deploy owner removed the debate when staging went red.",
    "Flags let us show the retry path without betting the whole release.",
    "QA at kickoff caught the token mismatch before the last day.",
    "The runbook was short enough that someone actually followed it.",
    "Support saw the empty states before customers did.",
    "We cut a story instead of hoping the week would stretch.",
    "The pilot metric was on the same slide as the goal.",
    "Design critique happened mid-sprint, not the night before review.",
    "The checklist made “done” visible to people outside the team.",
  ],
  didnt: [
    "We treated a laptop build as the stakeholder environment.",
    "New scope entered with no explicit trade.",
    "Comments on the pull request arrived after the increment was frozen.",
    "Standup was used to design the API.",
    "The outcome metric was still dark when we called the sprint done.",
    "CI flaked for a day because quarantine waited for a volunteer.",
    "Hand-offs depended on someone scrolling Slack.",
    "The dependency estimate ignored wait time.",
    "Follow-ups from the incident stayed outside the plan.",
    "We celebrated the merge and had not checked the recovery number.",
  ],
  puzzle: [
    "Why do webhook retries spike on Monday mornings?",
    "Is the payments sandbox close enough for a stakeholder decision?",
    "Which number is “recovered without support,” and who trusts it?",
    "How long is Finance’s review of the remaining invoice templates?",
    "What happens when the retry token expires mid-flow?",
    "Are Platform and Growth both sizing the same bet?",
    "When does this spike stop being research?",
    "Who is on call if the 10% flag increases ticket volume?",
    "Can the admin workaround be removed without its own project?",
    "Which backlog items are actually blocked on legal, not on us?",
  ],
  drop: [
    "Stop adding scope without naming the story that leaves.",
    "Stop demoing from a machine the stakeholder cannot open.",
    "Stop holding API design in standup.",
    "Stop leaving CI flakes for “someone” to notice.",
    "Stop freezing release notes before customer quotes exist.",
    "Stop planning dependencies as if the other team is waiting for us.",
    "Stop storing incident actions in a doc planning does not read.",
    "Stop calling a story done while its metric is dark.",
    "Stop concentrating payments knowledge on one person.",
    "Stop promising a date before the dependency owner has agreed.",
  ],
  add: [
    "Name a deploy owner before each staging promotion.",
    "Add a contract test for the payout retry token.",
    "Mirror production flags into the stakeholder sandbox.",
    "Write acceptance examples with QA when the story starts.",
    "Put the recovery rate on the dashboard the review will show.",
    "Ship support macros in the same increment as the empty state.",
    "Keep a one-page decision log after each walkthrough.",
    "Reserve a fixed spike budget so research cannot steal the journey.",
    "Add the failure reason before the retry button.",
    "Record new review requests as backlog notes before anyone commits.",
  ],
  keep: [
    "Keep the Definition of Done gate in front of review.",
    "Keep one owner on the release checklist.",
    "Keep pairing for payments defects until recovery is boring.",
    "Keep feature flags on any path a stakeholder will see.",
    "Keep the weekly walkthrough. It unblocked real decisions.",
    "Keep Wednesday critique. It was cheaper than Friday rework.",
    "Keep the webhook runbook where the on-call already looks.",
    "Keep Tuesday focus. The critical path finished early because of it.",
    "Keep screenshot checks on the invoice page.",
    "Keep writing the goal in one sentence before the demo starts.",
  ],
  improve: [
    "Keep the walkthrough, and state the goal before the first click.",
    "Keep flags, and make staging use the production set automatically.",
    "Keep the checklist, and name the owner before the promotion, not during it.",
    "Keep pairing, and rotate the second person so context is not trapped.",
    "Keep the runbook, and add the Monday retry spike once we understand it.",
    "Keep critique, and move it earlier when the story touches payments.",
    "Keep macros, and link them from the confirmation screen.",
    "Keep the dashboard, and show recovery rate next to support contacts.",
    "Keep the decision log, and file it where planning will open it.",
    "Keep the spike, and stop it when the budget is spent.",
  ],
  less: [
    "Less unplanned scope. One trade is enough to show the cost.",
    "Less API design inside standup. Take it to a short spike.",
    "Less late review. Comments on the last day do not change the increment.",
    "Less Slack archaeology. Write the decision once.",
    "Less heroics on flaky CI. Quarantine it the morning it flakes.",
    "Less date-setting before the dependency owner has spoken.",
    "Less demo polish on a path customers cannot open.",
    "Less carry-over that is “almost done” and unmeasured.",
    "Less silence when pairing stops and one person holds the context.",
    "Less optimism that Friday can absorb a new story.",
  ],
  more: [
    "More contract tests before the payouts build, not after the bug.",
    "More of the goal said out loud before the demo.",
    "More acceptance examples written with QA at kickoff.",
    "More of the recovery metric in the review, not a follow-up slide.",
    "More flag parity between staging and the stakeholder environment.",
    "More explicit scope trades when new work appears.",
    "More of the runbook used during the incident, not after the write-up.",
    "More shared context on payments so one absence does not stop the sprint.",
    "More backlog updates before the review room closes.",
    "More time on hardening once the journey works.",
  ],
};

const COLUMN_CLOSERS: Record<ColumnTone, readonly ((title: string) => string)[]> = {
  good: [
    (title) => `Keep that. It is ${title}.`,
    (title) => `${title} should be protected next sprint.`,
    (title) => `This is the ${title} the team can rely on again.`,
    (title) => `Leave it unchanged and call it ${title}.`,
    (title) => `${title} is why this one moves forward.`,
    (title) => `Put a pin in it under ${title}.`,
    (title) => `Next sprint still wants this ${title}.`,
    (title) => `Do not redesign it. File it as ${title}.`,
    (title) => `${title} earned the repeat.`,
    (title) => `The room can point to this and say ${title}.`,
  ],
  bad: [
    (title) => `Stop it. That is ${title}.`,
    (title) => `${title} should not enter the next sprint.`,
    (title) => `Name it ${title} and cut it.`,
    (title) => `This drag belongs under ${title}.`,
    (title) => `${title} is the part that slowed the sprint.`,
    (title) => `Do not schedule it again. It is ${title}.`,
    (title) => `Next sprint drops this as ${title}.`,
    (title) => `${title} is the cost we already paid.`,
    (title) => `Call it out as ${title} before planning.`,
    (title) => `The team should not relive this ${title}.`,
  ],
  idea: [
    (title) => `Start with this. It is ${title}.`,
    (title) => `${title} is the opening for next sprint.`,
    (title) => `We have not done this yet. Put it in ${title}.`,
    (title) => `Bring it in and label it ${title}.`,
    (title) => `${title} is a concrete first step.`,
    (title) => `The next sprint can begin at ${title}.`,
    (title) => `Try it once and record it as ${title}.`,
    (title) => `${title} gives the next sprint a place to start.`,
    (title) => `Add it to the plan as ${title}.`,
    (title) => `This is the ${title} worth attempting.`,
  ],
  neutral: [
    (title) => `Still open. It sits in ${title}.`,
    (title) => `${title} does not have an answer yet.`,
    (title) => `Settle ${title} before the next commitment.`,
    (title) => `Write it down as ${title} so planning sees it.`,
    (title) => `${title} is visible and unresolved.`,
    (title) => `Do not guess past ${title}.`,
    (title) => `Give ${title} an owner before we plan around it.`,
    (title) => `Leave it on the board as ${title}.`,
    (title) => `${title} is the question, not a decision.`,
    (title) => `The next sprint should not ignore this ${title}.`,
  ],
};

type DemoAuthor = Pick<Participant, "id" | "name">;

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
  const dedicated = COLUMN_NOTES[column.id];
  const bank = dedicated ?? TONE_NOTES[column.tone] ?? TONE_NOTES.neutral;
  const lines: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const base = bank[index % bank.length] ?? TONE_NOTES.neutral[index % TONE_NOTES.neutral.length]!;
    const sentence = /[.!?]$/.test(base) ? base : `${base}.`;
    const line = dedicated
      ? sentence
      : `${sentence} ${closerFor(column, index)}`;
    lines.push(line.slice(0, LIMITS.card));
  }
  return lines;
}

function closerFor(column: RetroColumn, index: number): string {
  const closers = COLUMN_CLOSERS[column.tone] ?? COLUMN_CLOSERS.neutral;
  const write = closers[index % closers.length] ?? closers[0]!;
  return write(column.title);
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
  itemNotes: Record<string, string>;
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
    itemNotes: {
      "goal-visible":
        "Said before the first click: a merchant retries a failed payout in under two minutes, and Finance sees the recovery rate the same day.",
      dod: "Stories in this increment have passing tests, analytics events, and a reviewed empty state. The invoice migration stayed out.",
      undone:
        "Usage-based billing is not in this increment. It goes back to the roadmap as a later bet, not a silent carry-over.",
      environment:
        "Staging uses the production payout flags. The walkthrough runs in the stakeholder sandbox, not a laptop-only build.",
      stakeholders:
        "Support, Finance, and the merchant advisory proxy are in the room and can judge whether the recovery journey works.",
      journey:
        "The demo runs failed-payout email, open the payout, read the reason, retry, and land on confirmation. No ticket list.",
      acceptance:
        "Each story shows its check beside the screen: retry under two minutes, reason before the button, confirmation without a support ticket.",
      "outcome-stated":
        "Pilot merchants recover without contacting support. Ticket volume for “where is my money” is the number watched for 48 hours.",
      metrics:
        "Recovery rate, median time to retry, and support contacts per 100 failed payouts are on the shared dashboard.",
      bugs: "One known issue: a retry token that expires mid-flow shows a generic error. Severity is low, a macro covers it, and it is outside the 10% flag.",
      "quality-bar":
        "Accessibility on the retry flow passed, analytics events were verified, and the failure-reason copy adds no new personal data.",
      notes: "Changelog drafted: what shipped, the 10% flag, the token-expiry edge, and who owns the 48-hour watch.",
      "feedback-live":
        "Praise, changes, and questions from this room are in the feedback list, with the person who said them.",
      scope:
        "Two requests are recorded and not committed: show the failure reason before the button, and publish the changelog before raising the flag.",
      "decision-made":
        "Ship behind the existing payouts flag to 10% of merchants. Hold only if the sandbox path diverges from production.",
      backlog:
        "The next sprint backlog was updated before close: failure-reason copy, the confirmation macro, and the 48-hour recovery watch.",
    },
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
