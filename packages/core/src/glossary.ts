export type GlossaryKind = "variable" | "metric" | "formula";

export interface GlossaryEntry {
  id: string;
  name: string;
  kind: GlossaryKind;
  /** What the word means, in plain English. */
  plain: string;
  /** The math, written out. Only formulas have this. */
  formula?: string;
  /** A worked example with the same numbers the board uses. */
  example?: string;
  /** Where a person sees this in the room. */
  where: string;
}

export interface GlossaryGroup {
  id: string;
  title: string;
  intro: string;
  entries: GlossaryEntry[];
}

/** Author paragraphs only. A blank line starts a new paragraph. Sentences stay together so the line can use the width of the card. */
export function glossaryParagraphs(text: string): string[] {
  const paragraphs = text
    .split(/\n\n+/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter((paragraph) => paragraph.length > 0);
  return paragraphs.length > 0 ? paragraphs : [];
}

export const GLOSSARY: GlossaryGroup[] = [
  {
    id: "retro",
    title: "Retrospective",
    intro: "A retrospective keeps two clocks and a vote. The stopwatch records how long a section stayed open, the timer is a countdown the team starts when it wants a limit, and dots are the votes that turn notes into a ranked list.",
    entries: [
      {
        id: "stopwatch",
        name: "Stopwatch",
        kind: "variable",
        plain: "The stopwatch is the clock on a section. It starts when the section opens and counts up in whole seconds until the room moves on, so the number is how long that part of the meeting lasted, including quiet time. Summary leaves the clock off, because that section is for reading what already happened. Sprint review, planning, and refinement use the same clock on each checklist step, and the stored reading of this clock is Time spent.",
        where: "Under each retrospective section name (except Summary), and on each checklist section step.",
      },
      {
        id: "time-spent",
        name: "Time spent",
        kind: "metric",
        plain: "Time spent is the stopwatch reading kept for a section, in whole seconds, after the room has moved on and the clock has stopped. The summary file stores one number per section, so a facilitator can compare Notes, Discuss, Vote, and Actions and see where the meeting actually went. The countdown is a different number, Time left, because it measures a limit the team chose rather than the length of the section.",
        where: "The downloaded summary file, in the column stopwatch_seconds.",
      },
      {
        id: "timer",
        name: "Timer",
        kind: "variable",
        plain: "The timer is a countdown the room starts on purpose. Anyone can set it to 3, 5, or 8 minutes, or type any whole number from 1 to 60, and the stopwatch keeps running while it counts down, so one clock says how long the section has lasted and the other says how much of the chosen limit remains. Summary and the icebreaker leave the timer off, because those moments are for reading or for the opening.",
        where: "The Timer control on Notes, Discuss, Vote, and Actions.",
      },
      {
        id: "time-left",
        name: "Time left",
        kind: "metric",
        plain: "Time left is the whole seconds still on the countdown. It falls only after someone starts a timer, and it reaches 0 when that countdown finishes. Before anyone starts a timer, the summary leaves this cell empty, because there was no countdown to measure. Pair it with Time spent when you read the file: one number is the section, and the other is the limit.",
        where: "The downloaded summary file, in the column timer_seconds.",
      },
      {
        id: "dot",
        name: "Dot",
        kind: "variable",
        plain: "A dot is one vote placed on a note. Each person begins with 3 dots, and anyone in the room can change that budget to a whole number from 1 to 10, applied to everyone. If the budget is lowered, the board removes the extra dots so nobody keeps votes they are no longer allowed to spend. Placing a dot spends the budget, taking a dot back returns it, Dots left is what remains, and Vote count is what sits on a note.",
        where: "The Vote section.",
      },
      {
        id: "dots-left",
        name: "Dots left",
        kind: "metric",
        plain: "Dots left is the part of your own budget you have not spent. It falls by one each time you place a dot and rises by one when you take a dot back, and at 0 the board waits for you to remove a dot before it will accept another. Another person's dots do not change yours. The shared result of everyone's spending is Vote count, on the notes themselves.",
        formula: "Dots left = dots each person may spend minus dots you have placed.",
        where: "The Vote section, next to your name.",
      },
      {
        id: "vote-count",
        name: "Vote count",
        kind: "metric",
        plain: "Vote count is the number of dots on one note, counting each person once, so spending every remaining dot on a single note still adds one. Actions and Summary keep the count after voting closes, which lets the team move from the notes with the most support into owners and next steps. A note with no dots stays in the list with a count of 0.",
        where: "On a note during Vote, Actions, and Summary.",
      },
    ],
  },
  {
    id: "review",
    title: "Sprint review",
    intro: "A sprint review inspects the Increment against a shared list, then records what was shown and what the room will do next. The checklist is the bar. Evidence, feedback, and the release call explain that bar and turn it into a decision.",
    entries: [
      {
        id: "checklist-item",
        name: "Checklist item",
        kind: "variable",
        plain: "A checklist item is one line the team wants to confirm before people leave. A required item has to be checked before the review reads Clear, and an optional item can stay open without moving the bar. The lines are grouped into Increment, Story of the sprint, Evidence, and Close the loop, so the conversation follows what was built, the Sprint that produced it, the proof, and the next step. The note under a line is Evidence.",
        where: "The four sections of the sprint review: Increment, Story of the sprint, Evidence, and Close the loop.",
      },
      {
        id: "checklist-bar",
        name: "Checklist bar",
        kind: "metric",
        plain: "The checklist bar is the share of required items that at least one person has checked. Optional items stay out of the calculation, so a room can leave reminders open and still finish the required inspection. Two people checking the same line still count as one, because the question is whether the line is confirmed. When every required item is checked, the bar reads 100 percent and the status reads Clear.",
        formula: "Checklist bar = required items with at least one check, divided by all required items.",
        example: "10 required items are checked out of 10. The bar is 100 percent, and the status is Clear.",
        where: "The checklist bar at the top of the sprint review.",
      },
      {
        id: "evidence",
        name: "Evidence",
        kind: "variable",
        plain: "Evidence is the short note attached to one checklist line. It holds what the team showed, a link to the demo, or a caveat that belongs with that line, so the check and the proof stay together. It is separate from Feedback, which is a comment from someone watching the Increment, and from the release decision, which is the call the room makes at the end.",
        where: "Under a checklist item, behind Edit evidence.",
      },
      {
        id: "feedback",
        name: "Feedback",
        kind: "variable",
        plain: "Feedback is a comment captured while the Increment is on screen. Praise names what worked and should be kept, Change names a fix the team should make, and Question names something the room still needs answered. The three kinds stay separate so the summary can show appreciation, requests, and open questions as different lists. A comment here does not check a line and does not set the release decision.",
        where: "Live feedback, beside the checklist.",
      },
      {
        id: "release-decision",
        name: "Release decision",
        kind: "variable",
        plain: "The release decision is the single call the room records before people leave. Release means the Increment is Done and can go out. Adapt means the Product Goal holds and the Product Backlog changes. Hold means the Increment stays unreleased and the backlog changes before more building. The notes beside the call keep the reason with the decision, and the checklist bar can read Clear while the call is still Hold.",
        where: "Release decision, beside the checklist.",
      },
    ],
  },
  {
    id: "roadmap",
    title: "Roadmap",
    intro: "A roadmap bet carries an outcome and a score. The team picks one scoring model, enters the inputs that model asks for, and reads the chart that model draws. The score helps the team compare bets, and the team still chooses the order.",
    entries: [
      {
        id: "reach",
        name: "Reach",
        kind: "variable",
        plain: "Reach is how many people or accounts feel this bet during the quarter, as a whole number from 0 to 1,000,000. A larger reach raises the RICE score, because the same impact matters more when more people feel it. Reach is only one input: a huge reach with thin confidence, or with a very large effort, can still score below a smaller bet the team trusts.",
        where: "RICE inputs on a bet.",
      },
      {
        id: "impact",
        name: "Impact",
        kind: "variable",
        plain: "Impact is how much the outcome moves for the people counted in Reach. The choices are fixed so bets stay comparable: 0.25 is minimal, 0.5 is low, 1 is medium, 2 is high, and 3 is massive. A bet marked massive and another marked minimal differ by a factor of twelve in this input alone, before reach, confidence, or effort change the score.",
        where: "RICE inputs on a bet.",
      },
      {
        id: "confidence",
        name: "Confidence",
        kind: "variable",
        plain: "Confidence is how sure the team is that the outcome will happen, as a fraction from 0 to 1. A value of 0.8 means the team is fairly sure, and below 0.6 the board calls the confidence thin and shows a warning on the bet, so a high reach cannot hide a shaky assumption. Confidence multiplies the rest of the RICE score, so halving it halves the score when the other inputs stay the same.",
        where: "RICE inputs on a bet. A thin score also shows a warning on the bet.",
      },
      {
        id: "effort",
        name: "Effort",
        kind: "variable",
        plain: "Effort is team time, counted in person months, from 0.25 to 240. The floor of 0.25 stops a tiny effort from making the score look enormous, and if effort is 0 the RICE score is 0, because the formula would otherwise divide by zero. Effort is the denominator, so a bet with twice the effort scores half as high when reach, impact, and confidence are unchanged.",
        where: "RICE inputs on a bet.",
      },
      {
        id: "rice",
        name: "RICE score",
        kind: "formula",
        plain: "The RICE score combines reach, impact, confidence, and effort into one number the board can rank. Reach, impact, and confidence multiply, and effort divides that product. A higher score is a stronger candidate for the conversation, and the chart and the ranked list both use this number when the board is set to RICE. Read the score next to its inputs: a 320 from a reach of 400 is a different conversation from a 320 that comes from a much larger reach and a much larger effort.",
        formula: "RICE score = (Reach times Impact times Confidence) divided by Effort.",
        example: "Reach 400, impact 2, confidence 0.8, effort 2. (400 times 2 times 0.8) divided by 2 = 320.",
        where: "The score on a bet when the board is set to RICE.",
      },
      {
        id: "ice-inputs",
        name: "ICE inputs",
        kind: "variable",
        plain: "ICE asks for three whole numbers, each from 1 to 10. Impact is how much the outcome matters, confidence is how sure you are, and ease is how little friction there is to ship, with 10 meaning easy and 1 meaning hard. The three numbers are peers, so a hard bet and an easy bet the team barely trusts both score low. Their product is the ICE score.",
        where: "ICE inputs on a bet.",
      },
      {
        id: "ice",
        name: "ICE score",
        kind: "formula",
        plain: "The ICE score is impact times confidence times ease. Because each input runs from 1 to 10, the score runs from 1 to 1,000, and a higher score is easier to believe and easier to ship. The board ranks and charts this number the same way it ranks a RICE score. Only one model is active at a time, so a bet's ICE score and its RICE score are never mixed on the same chart.",
        formula: "ICE score = Impact times Confidence times Ease.",
        example: "Impact 8, confidence 8, ease 8. 8 times 8 times 8 = 512.",
        where: "The score on a bet when the board is set to ICE.",
      },
      {
        id: "value",
        name: "Business value",
        kind: "variable",
        plain: "Business value is how much the outcome is worth to the business, on a scale from 1 to 10. A 10 is the outcome the team most wants, and a 1 is a small gain. This input is used when the board scores value divided by complexity. It is separate from RICE impact and from ICE impact, so changing the scoring model asks the team to judge value again on that model's own scale.",
        where: "Value inputs on a bet, when the board uses value divided by complexity.",
      },
      {
        id: "complexity-parts",
        name: "Complexity parts",
        kind: "variable",
        plain: "Complexity is three judgments, each a whole number from 1 to 5. Technical complexity is how hard the engineering is, dependency load is how much the team must wait on other teams, and uncertainty is how much is still unknown. A 1 is light and a 5 is heavy. Every bet carries these three numbers, whichever score the board is showing, and their average is the complexity index that sets the horizontal position on the chart.",
        where: "Complexity inputs on every bet.",
      },
      {
        id: "complexity-index",
        name: "Complexity index",
        kind: "formula",
        plain: "The complexity index is the average of the three complexity parts, one number from 1 to 5 rounded to two decimal places, so a bet can be placed on the chart and compared with its score. The index is also the denominator when the board scores value divided by complexity. A bet that is heavy in only one part can still land near the middle if the other two parts are light.",
        formula: "Complexity index = (technical complexity + dependency load + uncertainty) divided by 3, rounded to two decimal places.",
        example: "Technical 2, dependency 2, uncertainty 2. (2 + 2 + 2) divided by 3 = 2.00.",
        where: "The complexity number next to a score, and the horizontal position on the chart.",
      },
      {
        id: "value-complexity",
        name: "Value divided by complexity",
        kind: "formula",
        plain: "This score divides business value by the complexity index. A high value with low complexity scores higher, and a valuable bet that is also heavy scores lower, which lets the chart show that work as a big bet rather than as an easy win. If the complexity index is 0, the score is 0. In practice the parts start at 1, so the index stays at least 1 and the division stays meaningful.",
        formula: "Score = business value divided by the complexity index.",
        example: "Value 8 and complexity index 2.00. 8 divided by 2.00 = 4.",
        where: "The score on a bet when the board is set to value divided by complexity.",
      },
      {
        id: "median-score",
        name: "Median score",
        kind: "metric",
        plain: "The median is the middle score on this board. Half of the bets score at least this high, and the board calls a bet strong when its score is greater than or equal to the median. With an even number of bets, the median is the average of the two middle scores. The line moves when bets are added or rescored, because it describes this board. High complexity is the other line, and the two lines together choose the quadrant.",
        where: "The horizontal guide on the roadmap chart.",
      },
      {
        id: "high-complexity",
        name: "High complexity",
        kind: "metric",
        plain: "High complexity starts at 3.5 on the complexity index. A bet at or above 3.5 is called heavy, and the chart draws a vertical line there so the team can see that cut on every bet, whichever scoring model produced the score. The cut is fixed, while the median score moves with the board. A bet can be strong and still heavy, which is the big-bet quadrant.",
        where: "The vertical guide on the roadmap chart.",
      },
      {
        id: "quadrant",
        name: "Quadrant",
        kind: "metric",
        plain: "Each bet lands in one of four groups, using the median score and the 3.5 complexity line. Do first is a strong score that is light enough to start. Big bet is a strong score that is heavy, so the team starts with a thinner release. Fill-in is a modest score that is light, worth keeping when it clears the path for something larger. Reconsider is a modest score that is heavy, so the outcome needs to be sharper before the bet comes back. Change a score or a complexity part, and the bet can cross into a different group.",
        where: "The colored label on each bet, and the four counts above the list.",
      },
      {
        id: "rank",
        name: "Rank",
        kind: "metric",
        plain: "Rank is the order of bets by score, from highest to lowest. Rank 1 is the highest score on the board, and if two scores are equal the board sorts those titles from A to Z so the order stays stable. Rank follows the active scoring model, so switching from RICE to ICE reorders the list. The quadrant label can disagree with the rank: a rank-1 bet can still be a big bet when its complexity is high.",
        where: "The number beside each bet in the ranked list.",
      },
    ],
  },
  {
    id: "planning",
    title: "Sprint planning",
    intro: "Sprint planning ends with two sentences the room can repeat. The Sprint Goal says why the Sprint is valuable, and the planning decision says whether the selected work is a forecast, a narrower forecast, or a reason to wait.",
    entries: [
      {
        id: "planning-goal",
        name: "Sprint goal",
        kind: "variable",
        plain: "The Sprint Goal is the one sentence the team agrees will be true at the end of the Sprint. It names an outcome stakeholders can recognize, and the Scrum Team finalizes it before planning ends. The selected Product Backlog items are how the team expects to reach that sentence, and they stay a forecast. If the sentence is not final, the planning decision is No goal, and the Sprint waits.",
        where: "The goal field at the top of sprint planning.",
      },
      {
        id: "planning-decision",
        name: "Planning decision",
        kind: "variable",
        plain: "The planning decision is the forecast the room records. Forecast means the Sprint Goal is set and the selected items are a forecast. Narrow means the Sprint Goal stays and the Developers select fewer items. No goal means the Sprint Goal is not final, so the Sprint does not start. The notes beside the call keep the trade-off with the call: which items are in, which item was left out, and what could change the plan.",
        where: "The planning decision on the sprint planning board.",
      },
    ],
  },
  {
    id: "refinement",
    title: "Backlog refinement",
    intro: "Refinement prepares one Product Backlog item so Developers could select it later. The session names the item in focus, and the decision says whether that item is selectable, needs to be split, or goes back to the Product Owner. The session does not start a Sprint.",
    entries: [
      {
        id: "refinement-focus",
        name: "Refinement focus",
        kind: "variable",
        plain: "The refinement focus is the Product Backlog item this session is for. Naming it keeps the checklist, the notes, and the decision pointed at one slice of work, while the rest of the backlog waits. Detail, size, and order all refer to this item. When the item changes, the previous decision belongs to the previous item, and the room starts the checklist again.",
        where: "The focus field at the top of backlog refinement.",
      },
      {
        id: "refinement-decision",
        name: "Refinement decision",
        kind: "variable",
        plain: "The refinement decision says whether Developers could select the item in Sprint Planning. Selectable means it can be Done in one Sprint. Split means it is too big and should be broken down before anyone forecasts it. Return means a Product Owner decision is still open, so the item goes back until that decision is made. A Selectable item is ready to be offered in planning. It is not yet on a Sprint Backlog, because refinement does not select work for a Sprint.",
        where: "The refinement decision on the backlog refinement board.",
      },
    ],
  },
  {
    id: "direction",
    title: "Product direction",
    intro: "Product direction is a vision and the strategy that reaches it. The vision names the future the product is trying to make true, and the strategy names the choices that make that future more likely. The room fills one published framework at a time and reads the answers back as one statement.",
    entries: [
      {
        id: "product-vision",
        name: "Product vision",
        kind: "variable",
        plain: "A product vision is the future the product is trying to make true. On the Product Vision Board it names who it is for, the needs it meets, the product, the business goals, and the competitors, revenue, costs, and channels around it. A positioning statement says the same future in one sentence: who it is for, the need, the product name, the category, the benefit, the alternative, and the difference. Playing to Win, the strategy kernel, and DHM should still be readable as a way of reaching this future.",
        where: "Product direction, on the Product Vision Board or the positioning statement.",
      },
      {
        id: "product-strategy",
        name: "Product strategy",
        kind: "variable",
        plain: "A product strategy is the set of choices for reaching the vision. Playing to Win says where you will play, where you will not, how you will win, and what would have to be true. The strategy kernel names the challenge, the crux of that challenge, and the policy that follows. DHM names how the product delights customers in a way that is hard to copy and still funds the next product, locked to a proxy metric and a tactic. The statement at the top of the room is the check: if it does not describe a path to the vision, the answers are still unfinished.",
        where: "Product direction, on Playing to Win, the strategy kernel, or DHM.",
      },
    ],
  },
  {
    id: "requirements",
    title: "Product requirements",
    intro: "A requirement describes one change, and the artifact examples show that change as it moves from a funded bet to a finished Increment. The page holds the product, business, and technical checks. Personas and RACI name who the work is for and who decides.",
    entries: [
      {
        id: "product-requirement",
        name: "Product requirement",
        kind: "variable",
        plain: "A product requirement describes one change the team might build. It names the user outcome, the business hypothesis, and the technical constraints, and it is the page those three checks share. Product Backlog items come out of that page once the call is ready. Until then the page can still say the smallest test should be thinner, or that a decision is open. The benefit hypothesis and the enabler are the business and technical halves of the same requirement.",
        where: "Product requirements, across the product, business, and technical checks.",
      },
      {
        id: "benefit-hypothesis",
        name: "Benefit hypothesis",
        kind: "variable",
        plain: "A benefit hypothesis says who gains if this requirement is right, and which early signal would show that. It belongs on the business check, next to the leading indicators, the smallest test, and the cost of delay. The hypothesis keeps the requirement a test. The signal is what the team will look at before treating the idea as settled. A requirement can be ready for the backlog while the hypothesis is still a hypothesis, because the backlog item is how the team runs the test.",
        where: "The business check on a product requirements page.",
      },
      {
        id: "enabler",
        name: "Enabler",
        kind: "variable",
        plain: "An enabler is technical work that unlocks a user outcome. It can be exploration, architecture, infrastructure, or compliance, and it lives on the technical check beside the Definition of Done, the non-functional requirements, and the dependencies. An enabler still needs a size and a clear finish so a Sprint can complete it. The user-facing stories depend on it, and the Increment is Done only when both the stories and the enablers they rely on meet the Definition of Done.",
        where: "The technical check on a product requirements page.",
      },
      {
        id: "lean-business-case",
        name: "Lean Business Case",
        kind: "variable",
        plain: "A Lean Business Case is the SAFe brief for funding an epic's smallest test. It carries the outcomes hypothesis, the scope of that test, the leading indicators, and the go or no-go call. The case is the funding conversation, earlier than a Sprint. Features and stories come out of it once the call is to proceed, and WSJF on the same brief is how the team compares this epic with other work waiting for the same capacity.",
        where: "Artifact examples, on the Lean Business Case for either platform.",
      },
      {
        id: "wsjf",
        name: "WSJF",
        kind: "formula",
        plain: "Weighted Shortest Job First sequences work by dividing the cost of delay by the job size. Cost of delay is three judgments added together: user or business value, time criticality, and risk reduction or opportunity enablement. Job size is the denominator, in the same way effort is the denominator in RICE. A higher score goes earlier when capacity is limited. The score sequences the work, and the go or no-go on the Lean Business Case still decides whether the work is funded.",
        formula: "WSJF = (User or business value + Time criticality + Risk reduction or opportunity enablement) divided by Job size.",
        example: "Value 9, time 8, risk reduction 7, job size 5 gives WSJF of 4.8.",
        where: "Artifact examples, in the WSJF signal on a Lean Business Case.",
      },
      {
        id: "safe-feature",
        name: "Feature",
        kind: "variable",
        plain: "A Feature is a service a user would recognize, written at the size of a Program Increment when that fits. It carries a benefit hypothesis, acceptance criteria, and the stories that implement it. It sits between the epic in the Lean Business Case and the user stories on the Product Backlog. The hypothesis says why the feature is worth building, the acceptance criteria say how the team will know this slice is done, and the stories are the Sprint-sized pieces inside it.",
        where: "Artifact examples, on Features for either platform.",
      },
      {
        id: "product-backlog",
        name: "Product Backlog",
        kind: "variable",
        plain: "The Product Backlog is the ordered list of what is needed to improve the product. The Product Goal sits above the list and says why the order matters. The Product Owner orders the list, and Developers estimate the items. Refinement works on items until they are selectable, and Sprint Planning then forecasts a subset into the Sprint Backlog. An item stays here until it is selected, and it can return if the Sprint Goal changes.",
        where: "Artifact examples, on the Product Backlog for either platform.",
      },
      {
        id: "sprint-backlog",
        name: "Sprint Backlog",
        kind: "variable",
        plain: "The Sprint Backlog is the Sprint Goal, the items the Developers selected for this Sprint, and their plan for the first days. The Sprint Goal is the commitment and the items are a forecast, which is why a planning decision of Forecast and a Sprint Backlog describe the same moment from two sides. During the Sprint the Developers own the plan. Work that meets the Definition of Done leaves this list as part of the Increment.",
        where: "Artifact examples, on the Sprint Backlog for either platform.",
      },
      {
        id: "increment-definition-of-done",
        name: "Increment and Definition of Done",
        kind: "variable",
        plain: "An Increment is the sum of Product Backlog items that meet the Definition of Done during a Sprint. It is usable, whether or not it is released. The Definition of Done is the shared quality bar that makes that work usable, including the enablers the stories depend on. Acceptance criteria belong to a story or a feature. The Definition of Done belongs to the product. A story can meet its acceptance criteria and still sit outside the Increment until it also meets that bar. The sprint review inspects the Increment.",
        where: "Artifact examples, on Increment and Definition of Done for either platform.",
      },
      {
        id: "persona",
        name: "Persona",
        kind: "variable",
        plain: "A persona is a named stand-in for a real user of this product. It states who they are, what they need from this work, and how you will know the work helped them. Three personas travel with each product in the examples, so a story can say who it is for without inventing a new audience on every artifact. The persona is the person in the user story and in the benefit hypothesis. Stakeholders in the RACI map are the people who build and decide.",
        where: "Artifact examples, on Personas for each product.",
      },
      {
        id: "raci",
        name: "RACI",
        kind: "variable",
        plain: "RACI maps each stakeholder to one role on a decision. Responsible does the work. Accountable answers for the outcome, and only one person is accountable. Consulted gives input before the decision. Informed is told the result. The map changes with the artifact. On a Sprint Backlog the Developers as a group are accountable for the plan, and the Product Owner is consulted. On the Product Backlog the Product Owner is accountable for the order.",
        where: "Artifact examples, on Stakeholders for each product.",
      },
    ],
  },
];
