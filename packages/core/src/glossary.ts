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

export const GLOSSARY: GlossaryGroup[] = [
  {
    id: "retro",
    title: "Retrospective",
    intro: "These words describe time, votes, and the notes the team writes.",
    entries: [
      {
        id: "stopwatch",
        name: "Stopwatch",
        kind: "variable",
        plain: "The stopwatch is the small clock on a section. It counts up while that section is open. It stops when the room moves to the next section. Summary has no stopwatch.",
        where: "Under each section name, except Summary.",
      },
      {
        id: "time-spent",
        name: "Time spent",
        kind: "metric",
        plain: "Time spent is the stopwatch turned into whole seconds. It is how long the room kept that section open.",
        where: "The downloaded summary file, in the column stopwatch_seconds.",
      },
      {
        id: "timer",
        name: "Timer",
        kind: "variable",
        plain: "The timer counts down. The host starts it at 3, 5, or 8 minutes, or types a custom length from 1 to 60 minutes. Summary has no timer. The icebreaker has no timer.",
        where: "The Timer control on Notes, Discuss, Vote, and Actions.",
      },
      {
        id: "time-left",
        name: "Time left",
        kind: "metric",
        plain: "Time left is how many whole seconds remain before the timer reaches zero. If nobody started a timer, this is empty. If the timer has finished, this is 0.",
        where: "The downloaded summary file, in the column timer_seconds.",
      },
      {
        id: "dot",
        name: "Dot",
        kind: "variable",
        plain: "A dot is one vote on a note. Each person starts with 3 dots. The host can change that budget to any whole number from 1 to 10. Lowering the budget removes the extra dots.",
        where: "The Vote section.",
      },
      {
        id: "dots-left",
        name: "Dots left",
        kind: "metric",
        plain: "Dots left is your budget minus the dots you have already placed. At 0, remove a dot before you can place another.",
        formula: "Dots left = dots each person may spend minus dots you have placed.",
        where: "The Vote section, next to your name.",
      },
      {
        id: "vote-count",
        name: "Vote count",
        kind: "metric",
        plain: "Vote count is how many dots sit on one note. It is the number of people who chose that note, counting each person once.",
        where: "On a note during Vote, Actions, and Summary.",
      },
    ],
  },
  {
    id: "review",
    title: "Sprint review",
    intro: "These words describe the checklist, the evidence, and the release call.",
    entries: [
      {
        id: "checklist-item",
        name: "Checklist item",
        kind: "variable",
        plain: "A checklist item is one line the team wants to be true before they leave. A required item must be checked. An optional item can stay open.",
        where: "The four sections of the sprint review: Increment, Story of the sprint, Evidence, and Close the loop.",
      },
      {
        id: "checklist-bar",
        name: "Checklist bar",
        kind: "metric",
        plain: "The bar counts required items that at least one person has checked. Optional items do not move the bar. The bar reads 100 percent when every required item is checked. Two people can check the same line. That still counts as one checked item.",
        formula: "Checklist bar = required items with at least one check, divided by all required items.",
        example: "10 required items are checked out of 10. The bar is 100 percent, and the status is Clear.",
        where: "The checklist bar at the top of the sprint review.",
      },
      {
        id: "evidence",
        name: "Evidence",
        kind: "variable",
        plain: "Evidence is the short note on a checklist line. It records what the team showed, a link, or a caveat. It is not a second checklist item.",
        where: "Under a checklist item, behind Edit evidence.",
      },
      {
        id: "feedback",
        name: "Feedback",
        kind: "variable",
        plain: "Feedback is a comment captured in the room. Each comment is one of three kinds. Praise says what worked. Change asks for a fix. Question asks for an answer.",
        where: "Live feedback, beside the checklist.",
      },
      {
        id: "release-decision",
        name: "Release decision",
        kind: "variable",
        plain: "The release decision is the single call the room makes before people leave. Ship means release it. Iterate means change it and look again. Hold means do not release it yet. The notes next to the call say why.",
        where: "Release decision, beside the checklist.",
      },
    ],
  },
  {
    id: "roadmap",
    title: "Roadmap",
    intro: "These words describe a bet, the score, and where that score sits on the board. The score helps the team compare. It does not decide for them.",
    entries: [
      {
        id: "reach",
        name: "Reach",
        kind: "variable",
        plain: "Reach is how many people or accounts feel this bet during the quarter. It is a whole number from 0 to 1,000,000.",
        where: "RICE inputs on a bet.",
      },
      {
        id: "impact",
        name: "Impact",
        kind: "variable",
        plain: "Impact is how much the outcome moves for the people in Reach. The choices are fixed. 0.25 is minimal. 0.5 is low. 1 is medium. 2 is high. 3 is massive.",
        where: "RICE inputs on a bet.",
      },
      {
        id: "confidence",
        name: "Confidence",
        kind: "variable",
        plain: "Confidence is how sure the team is that the outcome will happen. It is a fraction from 0 to 1. For example, 0.8 means the team is fairly sure. Below 0.6, the board says the confidence is thin.",
        where: "RICE inputs on a bet. A thin score also shows a warning on the bet.",
      },
      {
        id: "effort",
        name: "Effort",
        kind: "variable",
        plain: "Effort is team time, counted in person months. The smallest value is 0.25. The largest is 240. A floor of 0.25 stops a tiny effort from making the score look huge. If effort is 0, the RICE score is 0.",
        where: "RICE inputs on a bet.",
      },
      {
        id: "rice",
        name: "RICE score",
        kind: "formula",
        plain: "RICE compares bets by how many people they reach, how much the outcome moves, how sure you are, and how much time they take. A higher score is a stronger candidate. It is still a comparison, not a command.",
        formula: "RICE score = (Reach times Impact times Confidence) divided by Effort.",
        example: "Reach 400, impact 2, confidence 0.8, effort 2. (400 times 2 times 0.8) divided by 2 = 320.",
        where: "The score on a bet when the board is set to RICE.",
      },
      {
        id: "ice-inputs",
        name: "ICE inputs",
        kind: "variable",
        plain: "ICE uses three whole numbers, each from 1 to 10. Impact is how much the outcome matters. Confidence is how sure you are. Ease is how little friction there is to ship. 10 on ease means easy. 1 means hard.",
        where: "ICE inputs on a bet.",
      },
      {
        id: "ice",
        name: "ICE score",
        kind: "formula",
        plain: "ICE is a fast score for comparing bets. Each input is 1 to 10, so the score runs from 1 to 1,000. A higher score is easier to believe and easier to ship.",
        formula: "ICE score = Impact times Confidence times Ease.",
        example: "Impact 8, confidence 8, ease 8. 8 times 8 times 8 = 512.",
        where: "The score on a bet when the board is set to ICE.",
      },
      {
        id: "value",
        name: "Business value",
        kind: "variable",
        plain: "Business value is how much the outcome is worth to the business, from 1 to 10. 10 is the outcome you most want. 1 is a small gain.",
        where: "Value inputs on a bet, when the board uses value divided by complexity.",
      },
      {
        id: "complexity-parts",
        name: "Complexity parts",
        kind: "variable",
        plain: "Complexity has three parts, each a whole number from 1 to 5. Technical complexity is how hard the engineering is. Dependency load is how much you must wait on other teams. Uncertainty is how much you still do not know. 1 is light. 5 is heavy.",
        where: "Complexity inputs on every bet.",
      },
      {
        id: "complexity-index",
        name: "Complexity index",
        kind: "formula",
        plain: "The complexity index is the average of the three complexity parts. It is one number from 1 to 5 so a bet can be compared with its score.",
        formula: "Complexity index = (technical complexity + dependency load + uncertainty) divided by 3, rounded to two decimal places.",
        example: "Technical 2, dependency 2, uncertainty 2. (2 + 2 + 2) divided by 3 = 2.00.",
        where: "The complexity number next to a score, and the horizontal position on the chart.",
      },
      {
        id: "value-complexity",
        name: "Value divided by complexity",
        kind: "formula",
        plain: "This score asks whether the business value is large compared with how hard the bet is. A high value with low complexity scores higher. If the complexity index is 0, the score is 0.",
        formula: "Score = business value divided by the complexity index.",
        example: "Value 8 and complexity index 2.00. 8 divided by 2.00 = 4.",
        where: "The score on a bet when the board is set to value divided by complexity.",
      },
      {
        id: "median-score",
        name: "Median score",
        kind: "metric",
        plain: "The median is the middle score on this board. Half of the bets score at least this high. A bet is called strong when its score is greater than or equal to the median. With an even number of bets, the median is the average of the two middle scores.",
        where: "The horizontal guide on the roadmap chart.",
      },
      {
        id: "high-complexity",
        name: "High complexity",
        kind: "metric",
        plain: "High complexity starts at 3.5 on the complexity index. A bet at or above 3.5 is called heavy. The chart draws a line at 3.5 so the team can see that cut.",
        where: "The vertical guide on the roadmap chart.",
      },
      {
        id: "quadrant",
        name: "Quadrant",
        kind: "metric",
        plain: "Each bet lands in one of four groups, using its score and its complexity. Do first means a strong score and not heavy. Big bet means a strong score and heavy, so start with a thinner release. Fill-in means a modest score and not heavy. Keep it only if it clears the path for something larger. Reconsider means a modest score and heavy. Sharpen the outcome before it comes back.",
        where: "The colored label on each bet, and the four counts above the list.",
      },
      {
        id: "rank",
        name: "Rank",
        kind: "metric",
        plain: "Rank is the order of bets by score, from highest to lowest. Rank 1 is the highest score. If two scores are equal, the board sorts those titles from A to Z.",
        where: "The number beside each bet in the ranked list.",
      },
    ],
  },
];
