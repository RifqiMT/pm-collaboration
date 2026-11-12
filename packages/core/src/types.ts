export type RoomKind = "retro" | "review" | "roadmap";

export type RetroTemplateId =
  | "start-stop-continue"
  | "4ls"
  | "mad-sad-glad"
  | "sailboat"
  | "rose-bud-thorn"
  | "went-well"
  | "daki"
  | "starfish"
  | "star-wars"
  | "superhero"
  | "arcade"
  | "premiere"
  | "quest"
  | "race"
  | "pokemon"
  | "heist"
  | "noir"
  | "concert"
  | "wizarding"
  | "streaming"
  | "marvel"
  | "dc"
  | "harry-potter"
  | "breaking-bad"
  | "criminal-minds"
  | "ncis"
  | "one-piece"
  | "naruto"
  | "bleach"
  | "lotr"
  | "stranger-things"
  | "avatar"
  | "sherlock"
  | "squid-game";

export type RetroPhase = "icebreak" | "brainstorm" | "vote" | "discuss" | "act" | "summary";

/** How Discuss walks the room. Notes stay in their status columns either way. */
export type DiscussionBy = "status" | "author";

export type IcebreakerId =
  | "one-word"
  | "feelings"
  | "one-word-sprint"
  | "weather"
  | "emoji"
  | "energy"
  | "this-or-that"
  | "word-association"
  | "movie-title"
  | "gif"
  | "draw"
  | "soundtrack"
  | "headline"
  | "ten-second"
  | "two-truths"
  | "show-and-tell"
  | "shout-out"
  | "gratitude";

export type ColumnTone = "good" | "bad" | "idea" | "neutral";

export type FrameworkId = "rice" | "ice" | "value-complexity";

export type ImpactLevel = 0.25 | 0.5 | 1 | 2 | 3;

export type Horizon = "now" | "next" | "later";

export type ReviewDecision = "ship" | "iterate" | "hold";

export type FeedbackKind = "praise" | "change" | "question";

export type Quadrant = "do-first" | "big-bet" | "fill-in" | "reconsider";

export interface Participant {
  id: string;
  name: string;
  color: string;
  lastSeen: string;
}

export interface RetroColumn {
  id: string;
  title: string;
  hint: string;
  tone: ColumnTone;
}

export interface RetroCard {
  id: string;
  columnId: string;
  body: string;
  authorId: string;
  anonymous: boolean;
  votes: string[];
  createdAt: string;
}

export interface ActionItem {
  id: string;
  body: string;
  ownerId: string | null;
  done: boolean;
  sourceCardId: string | null;
}

export interface IcebreakerGuess {
  authorId: string;
  index: number;
}

export interface IcebreakerAnswer {
  id: string;
  game: IcebreakerId;
  round: number;
  authorId: string;
  body: string;
  createdAt: string;
  lie?: number;
  revealed?: boolean;
  guesses?: IcebreakerGuess[];
  /** Viewer-specific statement order so the lie is not given away by position. */
  displayOrder?: number[];
}

export interface IcebreakerPair {
  question: string;
  left: string;
  right: string;
}

export interface RetroState {
  templateId: RetroTemplateId;
  phase: RetroPhase;
  votesPerPerson: number;
  /** @deprecated Use timers[phase]. Kept in sync for older clients. */
  timerEndsAt: string | null;
  /** Countdown timer ends-at per section. Separate from the stopwatch. */
  timers: Partial<Record<RetroPhase, string>>;
  /** Accrued stopwatch time per section while that section was active. */
  stopwatchMs: Partial<Record<RetroPhase, number>>;
  /** When the current section's stopwatch started running. */
  stopwatchRunningSince: string | null;
  columns: RetroColumn[];
  cards: RetroCard[];
  actions: ActionItem[];
  discussedCardId: string | null;
  /** Discuss walks one status column or one author at a time. */
  discussionBy: DiscussionBy;
  /** Column id, author id, or "anonymous" for the group currently in focus. */
  discussedGroupKey: string | null;
  /** Participant ids, in the order they raised a hand during Discuss. */
  raisedHands: string[];
  icebreaker: IcebreakerId;
  icebreakerRound: number;
  /** Host-written This or That pairs. Null uses the built-in pairs. */
  icebreakerPairs: IcebreakerPair[] | null;
  icebreakerAnswers: IcebreakerAnswer[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  detail: string;
  required: boolean;
  doneBy: string[];
  note: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  intent: string;
  items: ChecklistItem[];
}

export interface FeedbackNote {
  id: string;
  authorId: string;
  body: string;
  kind: FeedbackKind;
  createdAt: string;
}

export interface ReviewState {
  goal: string;
  sections: ChecklistSection[];
  feedback: FeedbackNote[];
  decision: ReviewDecision | null;
  decisionNotes: string;
}

export interface Initiative {
  id: string;
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
}

export interface RoadmapState {
  framework: FrameworkId;
  objective: string;
  initiatives: Initiative[];
}

export interface Room {
  code: string;
  kind: RoomKind;
  title: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  hostId: string;
  participants: Participant[];
  retro: RetroState | null;
  review: ReviewState | null;
  roadmap: RoadmapState | null;
}

export interface RetroCardView {
  id: string;
  columnId: string;
  body: string | null;
  authorId: string | null;
  authorName: string | null;
  anonymous: boolean;
  votes: string[];
  voteCount: number;
  createdAt: string;
  hidden: boolean;
  mine: boolean;
}

export interface RetroView extends Omit<RetroState, "cards"> {
  cards: RetroCardView[];
}

export interface ParticipantView extends Participant {
  active: boolean;
}

export interface RoomView {
  code: string;
  kind: RoomKind;
  title: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  hostId: string;
  participants: ParticipantView[];
  retro: RetroView | null;
  review: ReviewState | null;
  roadmap: RoadmapState | null;
}

export interface Insight {
  tone: "good" | "warn" | "risk";
  title: string;
  detail: string;
}

export interface ScoredInitiative {
  initiative: Initiative;
  score: number;
  complexity: number;
  formula: string;
  insight: Insight;
  quadrant: Quadrant;
  rank: number;
  bar: number;
}

export type Op =
  | { type: "room.rename"; title: string }
  | { type: "presence.rename"; name: string }
  | { type: "retro.addCard"; columnId: string; body: string; anonymous: boolean }
  | { type: "retro.editCard"; cardId: string; body: string }
  | { type: "retro.moveCard"; cardId: string; columnId: string }
  | { type: "retro.deleteCard"; cardId: string }
  | { type: "retro.vote"; cardId: string; voting: boolean }
  | { type: "retro.setPhase"; phase: RetroPhase }
  | { type: "retro.setIcebreaker"; game: IcebreakerId }
  | { type: "retro.setIcebreakerPairs"; pairs: IcebreakerPair[] }
  | { type: "retro.answerIcebreaker"; body: string; round?: number }
  | { type: "retro.guessIcebreaker"; targetId: string; index: number }
  | { type: "retro.revealIcebreaker" }
  | { type: "retro.nextIcebreakerRound"; step: number }
  | { type: "retro.setVotesPerPerson"; count: number }
  | { type: "retro.startTimer"; seconds: number; phase?: RetroPhase }
  | { type: "retro.clearTimer"; phase?: RetroPhase }
  | { type: "retro.focusCard"; cardId: string | null }
  | { type: "retro.setDiscussionBy"; by: DiscussionBy }
  | { type: "retro.focusGroup"; key: string }
  | { type: "retro.raiseHand"; raised: boolean }
  | { type: "retro.addAction"; body: string; sourceCardId?: string | null }
  | { type: "retro.setActionDone"; actionId: string; done: boolean }
  | { type: "retro.assignAction"; actionId: string; ownerId: string | null }
  | { type: "retro.deleteAction"; actionId: string }
  | { type: "review.setItemDone"; itemId: string; done: boolean }
  | { type: "review.setItemNote"; itemId: string; note: string }
  | { type: "review.addItem"; sectionId: string; label: string }
  | { type: "review.setGoal"; goal: string }
  | { type: "review.addFeedback"; body: string; kind: FeedbackKind }
  | { type: "review.deleteFeedback"; feedbackId: string }
  | { type: "review.setDecision"; decision: ReviewDecision | null }
  | { type: "review.setDecisionNotes"; notes: string }
  | { type: "roadmap.setFramework"; framework: FrameworkId }
  | { type: "roadmap.setObjective"; objective: string }
  | { type: "roadmap.addInitiative" }
  | { type: "roadmap.patchInitiative"; initiativeId: string; patch: InitiativePatch }
  | { type: "roadmap.deleteInitiative"; initiativeId: string };

export interface InitiativePatch {
  title?: string;
  outcome?: string;
  assumption?: string;
  reach?: number;
  impact?: ImpactLevel;
  confidence?: number;
  effort?: number;
  iceImpact?: number;
  iceConfidence?: number;
  iceEase?: number;
  value?: number;
  complexityTechnical?: number;
  complexityDependency?: number;
  complexityUncertainty?: number;
  horizon?: Horizon;
  ownerId?: string | null;
}

export class CadenceError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "CadenceError";
    this.code = code;
  }
}

export const LIMITS = {
  participants: 40,
  cards: 180,
  actions: 80,
  icebreakerAnswers: 240,
  icebreakerPairs: 8,
  icebreakerQuestion: 90,
  icebreakerSide: 40,
  icebreakerWord: 24,
  icebreakerShout: 140,
  icebreakerLine: 180,
  icebreakerDrawing: 6000,
  icebreakerGif: 400,
  notes: 100,
  itemsPerSection: 30,
  initiatives: 40,
  title: 80,
  name: 40,
  card: 500,
  goal: 240,
  note: 800,
  feedback: 500,
  decisionNotes: 2000,
  objective: 240,
  initiativeTitle: 120,
  outcome: 400,
  assumption: 400,
} as const;

export const PALETTE = [
  "#c2512c",
  "#1f5f73",
  "#2f6b52",
  "#8a5a12",
  "#6b3f69",
  "#3d4c2f",
  "#8d3d4a",
  "#3f5f8a",
] as const;

export const IMPACT_OPTIONS: { value: ImpactLevel; label: string; meaning: string }[] = [
  { value: 0.25, label: "Minimal", meaning: "Barely moves the outcome" },
  { value: 0.5, label: "Low", meaning: "A small, local improvement" },
  { value: 1, label: "Medium", meaning: "A meaningful change" },
  { value: 2, label: "High", meaning: "Most affected people will notice" },
  { value: 3, label: "Massive", meaning: "Transforms the target metric" },
];

export const HIGH_COMPLEXITY = 3.5;

export const ACTIVE_MS = 20_000;
