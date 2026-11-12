import {
  ICEBREAKERS,
  RETRO_TEMPLATES,
  columnsFor,
  createReviewState,
  icebreakerById,
  icebreakerChoices,
  pairQuestion,
  storedThisOrThatPairs,
  thisOrThatGame,
  truthDisplayOrder,
  type IcebreakerGame,
} from "./content";
import { demoActions, demoNotesForColumns, demoReviewContent, demoRoadmapContent } from "./demo";
import { createId } from "./ids";
import {
  asBoolean,
  asNumber,
  clampInt,
  clampNumber,
  cleanBlock,
  cleanLine,
  cleanName,
} from "./text";
import {
  ACTIVE_MS,
  CadenceError,
  IMPACT_OPTIONS,
  LIMITS,
  PALETTE,
  type ActionItem,
  type DiscussionBy,
  type FeedbackKind,
  type FrameworkId,
  type Horizon,
  type IcebreakerPair,
  type ImpactLevel,
  type Initiative,
  type InitiativePatch,
  type Op,
  type Participant,
  type RetroCard,
  type RetroCardView,
  type RetroPhase,
  type RetroState,
  type RetroTemplateId,
  type RetroView,
  type ReviewDecision,
  type ReviewState,
  type RoadmapState,
  type Room,
  type RoomKind,
  type RoomView,
} from "./types";

const PHASES: RetroPhase[] = ["icebreak", "brainstorm", "discuss", "vote", "act", "summary"];
const DISCUSSION_BY: DiscussionBy[] = ["status", "author"];
const ICEBREAKER_IDS = ICEBREAKERS.map((game) => game.id);
const FRAMEWORKS: FrameworkId[] = ["rice", "ice", "value-complexity"];
const HORIZONS: Horizon[] = ["now", "next", "later"];
const DECISIONS: ReviewDecision[] = ["ship", "iterate", "hold"];
const FEEDBACK: FeedbackKind[] = ["praise", "change", "question"];
const TEMPLATES = Object.keys(RETRO_TEMPLATES) as RetroTemplateId[];

export interface CreateRoomInput {
  code: string;
  kind: RoomKind;
  title: string;
  hostId: string;
  hostName: string;
  templateId?: RetroTemplateId;
  demo?: boolean;
}

export function createRoom(input: CreateRoomInput, now: string): Room {
  if (!/^[A-Z0-9]{6}$/.test(input.code)) {
    throw new CadenceError("Room code must be 6 letters or numbers.", "code");
  }
  if (!["retro", "review", "roadmap"].includes(input.kind)) {
    throw new CadenceError("Choose a retrospective, a sprint review, or a roadmap.", "kind");
  }
  const host = makeParticipant(input.hostId, input.hostName, 0, now);
  const title = cleanLine(input.title, LIMITS.title, "Title");
  const templateId = input.templateId ?? "start-stop-continue";
  if (!TEMPLATES.includes(templateId)) {
    throw new CadenceError("Unknown retrospective template.", "template");
  }

  const room: Room = {
    code: input.code,
    kind: input.kind,
    title,
    createdAt: now,
    updatedAt: now,
    version: 1,
    hostId: host.id,
    participants: [host],
    retro: null,
    review: null,
    roadmap: null,
  };

  if (input.kind === "retro") {
    room.retro = blankRetro(templateId, now);
  } else if (input.kind === "review") {
    room.review = createReviewState();
  } else {
    room.roadmap = blankRoadmap();
  }

  if (input.demo) fillDemo(room, host.id, now);
  return room;
}

export function joinRoom(room: Room, input: { id: string; name: string }, now: string): { room: Room; participant: Participant } {
  const name = cleanName(input.name);
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(input.id)) {
    throw new CadenceError("Invalid participant.", "actor");
  }
  const next = structuredClone(room);
  next.hostId = hostOf(room);
  let participant = next.participants.find((person) => person.id === input.id);
  if (!participant) {
    if (next.participants.length >= LIMITS.participants) {
      throw new CadenceError("This room is full.", "full");
    }
    participant = makeParticipant(input.id, name, next.participants.length, now);
    next.participants.push(participant);
  } else {
    participant.name = name;
    participant.lastSeen = now;
  }
  touch(next, now);
  return { room: next, participant: structuredClone(participant) };
}

export function markSeen(room: Room, actorId: string, now: string): { room: Room; changed: boolean } {
  const current = room.participants.find((person) => person.id === actorId);
  if (!current) return { room, changed: false };
  if (Date.parse(now) - Date.parse(current.lastSeen) < 5000) return { room, changed: false };
  const next = structuredClone(room);
  next.hostId = hostOf(room);
  const participant = next.participants.find((person) => person.id === actorId);
  if (!participant) return { room, changed: false };
  participant.lastSeen = now;
  touch(next, now);
  return { room: next, changed: true };
}

export function applyOp(room: Room, op: Op, actorId: string, now: string): Room {
  const actor = room.participants.find((person) => person.id === actorId);
  if (!actor) throw new CadenceError("Join the room before changing it.", "actor");

  const next = structuredClone(room);
  next.hostId = hostOf(room);
  const person = next.participants.find((item) => item.id === actorId);
  if (!person) throw new CadenceError("Join the room before changing it.", "actor");
  person.lastSeen = now;
  let changed = true;

  switch (op.type) {
    case "room.rename": {
      const title = cleanLine(op.title, LIMITS.title, "Title");
      changed = title !== next.title;
      next.title = title;
      break;
    }
    case "presence.rename": {
      const name = cleanName(op.name);
      changed = name !== person.name;
      person.name = name;
      break;
    }
    case "retro.addCard":
    case "retro.editCard":
    case "retro.moveCard":
    case "retro.deleteCard":
    case "retro.vote":
    case "retro.setPhase":
    case "retro.setVotesPerPerson":
    case "retro.startTimer":
    case "retro.clearTimer":
    case "retro.focusCard":
    case "retro.setDiscussionBy":
    case "retro.focusGroup":
    case "retro.addAction":
    case "retro.setActionDone":
    case "retro.assignAction":
    case "retro.deleteAction":
    case "retro.setIcebreaker":
    case "retro.setIcebreakerPairs":
    case "retro.answerIcebreaker":
    case "retro.guessIcebreaker":
    case "retro.revealIcebreaker":
    case "retro.nextIcebreakerRound":
      changed = applyRetro(next, op, actorId, now);
      break;
    case "review.setItemDone":
    case "review.setItemNote":
    case "review.addItem":
    case "review.setGoal":
    case "review.addFeedback":
    case "review.deleteFeedback":
    case "review.setDecision":
    case "review.setDecisionNotes":
      changed = applyReview(next, op, actorId, now);
      break;
    case "roadmap.setFramework":
    case "roadmap.setObjective":
    case "roadmap.addInitiative":
    case "roadmap.patchInitiative":
    case "roadmap.deleteInitiative":
      changed = applyRoadmap(next, op, now);
      break;
    default:
      throw new CadenceError("Unknown update.", "op");
  }

  if (!changed) return room;
  touch(next, now);
  return next;
}

export function presentRoom(room: Room, actorId: string | null, now: string): RoomView {
  const names = new Map(room.participants.map((person) => [person.id, person.name]));
  return {
    code: room.code,
    kind: room.kind,
    title: room.title,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    version: room.version,
    hostId: hostOf(room),
    participants: room.participants.map((person) => ({
      ...person,
      active: Date.parse(now) - Date.parse(person.lastSeen) <= ACTIVE_MS,
    })),
    retro: room.retro ? presentRetro(room.retro, actorId, names) : null,
    review: room.review ? structuredClone(room.review) : null,
    roadmap: room.roadmap ? structuredClone(room.roadmap) : null,
  };
}

export function votesUsed(retro: RetroState | RetroView, actorId: string): number {
  return retro.cards.reduce((count, card) => count + (card.votes.includes(actorId) ? 1 : 0), 0);
}

export function votesLeft(retro: RetroState | RetroView, actorId: string): number {
  return Math.max(0, retro.votesPerPerson - votesUsed(retro, actorId));
}

export interface DiscussionGroup {
  key: string;
  label: string;
  cards: RetroCardView[];
}

/** Discuss order. Status walks columns. Author walks people, with each person's notes still ordered by status. */
export function discussionGroups(
  retro: RetroView,
  participants: { id: string; name: string }[],
): DiscussionGroup[] {
  const visible = retro.cards.filter((card) => !card.hidden && card.body);
  const byColumn = new Map(retro.columns.map((column, index) => [column.id, index]));
  const byStatus = (a: RetroCardView, b: RetroCardView) =>
    (byColumn.get(a.columnId) ?? 0) - (byColumn.get(b.columnId) ?? 0) ||
    a.createdAt.localeCompare(b.createdAt) ||
    a.id.localeCompare(b.id);
  if (retro.discussionBy === "author") {
    const buckets = new Map<string, RetroCardView[]>();
    for (const card of visible) {
      const key = card.anonymous || !card.authorId ? "anonymous" : card.authorId;
      const list = buckets.get(key);
      if (list) list.push(card);
      else buckets.set(key, [card]);
    }
    const keys: string[] = [];
    for (const person of participants) {
      if (buckets.has(person.id)) keys.push(person.id);
    }
    for (const key of buckets.keys()) {
      if (key !== "anonymous" && !keys.includes(key)) keys.push(key);
    }
    if (buckets.has("anonymous")) keys.push("anonymous");
    return keys.map((key) => {
      const cards = (buckets.get(key) ?? []).slice().sort(byStatus);
      const person = participants.find((item) => item.id === key);
      const label = key === "anonymous" ? "Anonymous" : cards[0]?.authorName ?? person?.name ?? "Someone";
      return { key, label, cards };
    });
  }
  return retro.columns
    .map((column) => ({
      key: column.id,
      label: column.title,
      cards: visible
        .filter((card) => card.columnId === column.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)),
    }))
    .filter((group) => group.cards.length > 0);
}

export function checklistProgress(review: ReviewState): {
  done: number;
  total: number;
  requiredDone: number;
  requiredTotal: number;
} {
  const items = review.sections.flatMap((section) => section.items);
  const required = items.filter((item) => item.required);
  return {
    done: items.filter((item) => item.doneBy.length > 0).length,
    total: items.length,
    requiredDone: required.filter((item) => item.doneBy.length > 0).length,
    requiredTotal: required.length,
  };
}

export function parseOp(input: unknown): Op {
  if (!input || typeof input !== "object") throw new CadenceError("Missing update.", "op");
  const record = input as Record<string, unknown>;
  const type = record.type;
  switch (type) {
    case "room.rename":
      return { type, title: String(record.title ?? "") };
    case "presence.rename":
      return { type, name: String(record.name ?? "") };
    case "retro.addCard":
      return {
        type,
        columnId: expectString(record.columnId, "Column"),
        body: String(record.body ?? ""),
        anonymous: asBoolean(record.anonymous, "Anonymous"),
      };
    case "retro.editCard":
      return { type, cardId: expectString(record.cardId, "Note"), body: String(record.body ?? "") };
    case "retro.moveCard":
      return {
        type,
        cardId: expectString(record.cardId, "Note"),
        columnId: expectString(record.columnId, "Column"),
      };
    case "retro.deleteCard":
      return { type, cardId: expectString(record.cardId, "Note") };
    case "retro.vote":
      return { type, cardId: expectString(record.cardId, "Note"), voting: asBoolean(record.voting, "Vote") };
    case "retro.setPhase":
      return { type, phase: expectEnum(record.phase, PHASES, "Phase") };
    case "retro.setIcebreaker":
      return { type, game: expectEnum(record.game, ICEBREAKER_IDS, "Icebreaker") };
    case "retro.setIcebreakerPairs":
      return { type, pairs: parsePairs(record.pairs) };
    case "retro.answerIcebreaker":
      return {
        type,
        body: String(record.body ?? ""),
        ...(typeof record.round === "number" ? { round: record.round } : {}),
      };
    case "retro.guessIcebreaker":
      return {
        type,
        targetId: expectString(record.targetId, "Answer"),
        index: asNumber(record.index, "Guess"),
      };
    case "retro.revealIcebreaker":
      return { type };
    case "retro.nextIcebreakerRound":
      return { type, step: asNumber(record.step, "Round") };
    case "retro.setVotesPerPerson":
      return { type, count: asNumber(record.count, "Votes") };
    case "retro.startTimer":
      return {
        type,
        seconds: asNumber(record.seconds, "Timer"),
        ...(record.phase == null ? {} : { phase: expectEnum(record.phase, PHASES, "Phase") }),
      };
    case "retro.clearTimer":
      return {
        type,
        ...(record.phase == null ? {} : { phase: expectEnum(record.phase, PHASES, "Phase") }),
      };
    case "retro.focusCard":
      return { type, cardId: record.cardId == null ? null : expectString(record.cardId, "Note") };
    case "retro.setDiscussionBy":
      return { type, by: expectEnum(record.by, DISCUSSION_BY, "Discussion") };
    case "retro.focusGroup":
      return { type, key: expectString(record.key, "Discussion group") };
    case "retro.addAction":
      return {
        type,
        body: String(record.body ?? ""),
        sourceCardId: record.sourceCardId == null ? null : expectString(record.sourceCardId, "Note"),
      };
    case "retro.setActionDone":
      return { type, actionId: expectString(record.actionId, "Action"), done: asBoolean(record.done, "Done") };
    case "retro.assignAction":
      return {
        type,
        actionId: expectString(record.actionId, "Action"),
        ownerId: record.ownerId == null ? null : expectString(record.ownerId, "Owner"),
      };
    case "retro.deleteAction":
      return { type, actionId: expectString(record.actionId, "Action") };
    case "review.setItemDone":
      return {
        type,
        itemId: expectString(record.itemId, "Checklist item"),
        done: asBoolean(record.done, "Checked"),
      };
    case "review.setItemNote":
      return { type, itemId: expectString(record.itemId, "Checklist item"), note: String(record.note ?? "") };
    case "review.addItem":
      return { type, sectionId: expectString(record.sectionId, "Section"), label: String(record.label ?? "") };
    case "review.setGoal":
      return { type, goal: String(record.goal ?? "") };
    case "review.addFeedback":
      return {
        type,
        body: String(record.body ?? ""),
        kind: expectEnum(record.kind, FEEDBACK, "Feedback"),
      };
    case "review.deleteFeedback":
      return { type, feedbackId: expectString(record.feedbackId, "Feedback") };
    case "review.setDecision":
      return {
        type,
        decision: record.decision == null ? null : expectEnum(record.decision, DECISIONS, "Decision"),
      };
    case "review.setDecisionNotes":
      return { type, notes: String(record.notes ?? "") };
    case "roadmap.setFramework":
      return { type, framework: expectEnum(record.framework, FRAMEWORKS, "Framework") };
    case "roadmap.setObjective":
      return { type, objective: String(record.objective ?? "") };
    case "roadmap.addInitiative":
      return { type };
    case "roadmap.patchInitiative":
      return {
        type,
        initiativeId: expectString(record.initiativeId, "Initiative"),
        patch: parsePatch(record.patch),
      };
    case "roadmap.deleteInitiative":
      return { type, initiativeId: expectString(record.initiativeId, "Initiative") };
    default:
      throw new CadenceError("Unknown update.", "op");
  }
}

function applyRetro(room: Room, op: Op, actorId: string, now: string): boolean {
  const retro = requireRetro(room);
  ensureIcebreaker(retro);
  startStopwatchIfNeeded(retro, now);
  switch (op.type) {
    case "retro.addCard": {
      requirePhase(retro, "brainstorm", "Notes can only be written in the notes section.");
      if (retro.cards.length >= LIMITS.cards) throw new CadenceError("This board is full.", "limit");
      const column = retro.columns.find((item) => item.id === op.columnId);
      if (!column) throw new CadenceError("That column is not on this board.", "column");
      const body = cleanBlock(op.body, LIMITS.card, "Note");
      if (!body) throw new CadenceError("Write a note before adding it.", "text");
      retro.cards.push({
        id: createId("card"),
        columnId: column.id,
        body,
        authorId: actorId,
        anonymous: op.anonymous,
        votes: [],
        createdAt: now,
      });
      return true;
    }
    case "retro.editCard": {
      requirePhase(retro, "brainstorm", "Notes can only be changed in the notes section.");
      const card = findCard(retro, op.cardId);
      assertCanChangeCard(retro, card, actorId);
      const body = cleanBlock(op.body, LIMITS.card, "Note");
      if (!body) throw new CadenceError("A note cannot be empty.", "text");
      if (card.body === body) return false;
      card.body = body;
      return true;
    }
    case "retro.moveCard": {
      requirePhase(retro, "brainstorm", "Notes can only be moved in the notes section.");
      const card = findCard(retro, op.cardId);
      assertCanChangeCard(retro, card, actorId);
      if (!retro.columns.some((column) => column.id === op.columnId)) {
        throw new CadenceError("That column is not on this board.", "column");
      }
      if (card.columnId === op.columnId) return false;
      card.columnId = op.columnId;
      return true;
    }
    case "retro.deleteCard": {
      requirePhase(retro, "brainstorm", "Notes can only be removed in the notes section.");
      const index = retro.cards.findIndex((card) => card.id === op.cardId);
      if (index < 0) throw new CadenceError("That note is gone.", "missing");
      const card = retro.cards[index];
      if (!card) throw new CadenceError("That note is gone.", "missing");
      assertCanChangeCard(retro, card, actorId);
      retro.cards.splice(index, 1);
      if (retro.discussedCardId === op.cardId) retro.discussedCardId = null;
      return true;
    }
    case "retro.vote": {
      requirePhase(retro, "vote", "Voting opens when the room moves to the vote phase.");
      const card = findCard(retro, op.cardId);
      const existing = card.votes.indexOf(actorId);
      if (op.voting && existing >= 0) return false;
      if (!op.voting && existing < 0) return false;
      if (!op.voting) {
        card.votes.splice(existing, 1);
        return true;
      }
      if (votesUsed(retro, actorId) >= retro.votesPerPerson) {
        throw new CadenceError("You have used all your votes. Remove one first.", "votes");
      }
      card.votes.push(actorId);
      return true;
    }
    case "retro.setPhase": {
      if (retro.phase === op.phase) return false;
      if (actorId !== hostOf(room)) {
        throw new CadenceError("Only the host can change the section.", "host");
      }
      ensureTimers(retro);
      moveStopwatch(retro, op.phase, now);
      retro.timerEndsAt = retro.timers[op.phase] ?? null;
      return true;
    }
    case "retro.setIcebreaker": {
      requirePhase(retro, "icebreak", "The icebreaker is only open during the warm-up.");
      if (actorId !== hostOf(room)) {
        throw new CadenceError("Only the host can choose the icebreaker.", "host");
      }
      if (retro.icebreaker === op.game) return false;
      retro.icebreaker = op.game;
      return true;
    }
    case "retro.setIcebreakerPairs": {
      requirePhase(retro, "icebreak", "The icebreaker is only open during the warm-up.");
      if (actorId !== hostOf(room)) {
        throw new CadenceError("Only the host can change the pairs.", "host");
      }
      const pairs = cleanPairs(op.pairs);
      const current = thisOrThatGame(retro.icebreakerPairs);
      const same =
        current.questions?.length === pairs.length &&
        pairs.every(
          (pair, index) =>
            pair.question === current.questions?.[index] &&
            pair.left === current.rounds?.[index]?.[0] &&
            pair.right === current.rounds?.[index]?.[1],
        );
      if (same) return false;
      retro.icebreakerPairs = pairs;
      reconcilePairAnswers(retro, pairs);
      return true;
    }
    case "retro.answerIcebreaker": {
      requirePhase(retro, "icebreak", "The icebreaker is only open during the warm-up.");
      const game = playingIcebreaker(retro);
      const round = pairRound(game, retro.icebreakerRound, op.round);
      const accepted = normalizeIcebreaker(game, round, op.body);
      const existing = retro.icebreakerAnswers.find(
        (answer) => answer.game === game.id && answer.round === round && answer.authorId === actorId,
      );
      if (existing) {
        if (existing.body === accepted.body && existing.lie === accepted.lie) return false;
        existing.body = accepted.body;
        if (accepted.lie == null) delete existing.lie;
        else existing.lie = accepted.lie;
        if (game.mode === "truths") {
          existing.revealed = false;
          existing.guesses = [];
        }
        return true;
      }
      if (retro.icebreakerAnswers.length >= LIMITS.icebreakerAnswers) {
        throw new CadenceError("The icebreaker is full.", "limit");
      }
      retro.icebreakerAnswers.push({
        id: createId("warm"),
        game: game.id,
        round,
        authorId: actorId,
        body: accepted.body,
        createdAt: now,
        ...(accepted.lie == null ? {} : { lie: accepted.lie, revealed: false, guesses: [] }),
      });
      return true;
    }
    case "retro.guessIcebreaker": {
      requirePhase(retro, "icebreak", "The icebreaker is only open during the warm-up.");
      const game = icebreakerById(retro.icebreaker);
      if (game.mode !== "truths") throw new CadenceError("This game does not take a guess.", "game");
      const answer = retro.icebreakerAnswers.find((item) => item.id === op.targetId && item.game === game.id);
      if (!answer) throw new CadenceError("That answer is gone.", "missing");
      if (answer.authorId === actorId) throw new CadenceError("Guess someone else's lie.", "guess");
      if (answer.revealed) throw new CadenceError("That lie is already revealed.", "guess");
      const index = clampInt(op.index, 0, 2, "Guess");
      const guesses = answer.guesses ?? [];
      const mine = guesses.find((guess) => guess.authorId === actorId);
      let changed = false;
      if (mine) {
        if (mine.index === index) return false;
        mine.index = index;
        changed = true;
      } else {
        guesses.push({ authorId: actorId, index });
        answer.guesses = guesses;
        changed = true;
      }
      const eligible = room.participants.filter((person) => person.id !== answer.authorId);
      if (eligible.length > 0 && eligible.every((person) => guesses.some((guess) => guess.authorId === person.id))) {
        answer.revealed = true;
        changed = true;
      }
      return changed;
    }
    case "retro.revealIcebreaker": {
      requirePhase(retro, "icebreak", "The icebreaker is only open during the warm-up.");
      const game = icebreakerById(retro.icebreaker);
      if (game.mode !== "truths") return false;
      const answer = retro.icebreakerAnswers.find((item) => item.game === game.id && item.authorId === actorId);
      if (!answer) throw new CadenceError("Share your three statements first.", "missing");
      if (answer.revealed) return false;
      answer.revealed = true;
      return true;
    }
    case "retro.nextIcebreakerRound": {
      requirePhase(retro, "icebreak", "The icebreaker is only open during the warm-up.");
      if (actorId !== hostOf(room)) {
        throw new CadenceError("Only the host can choose the icebreaker.", "host");
      }
      const game = playingIcebreaker(retro);
      const rounds = game.rounds?.length ?? 0;
      if (rounds < 2 || (op.step !== 1 && op.step !== -1)) return false;
      const nextRound = retro.icebreakerRound + op.step;
      if (nextRound < 0 || nextRound >= rounds) return false;
      retro.icebreakerRound = nextRound;
      return true;
    }
    case "retro.setVotesPerPerson": {
      requirePhase(retro, "vote", "The dot budget is set in the vote section.");
      const count = clampInt(op.count, 1, 10, "Votes per person");
      if (count === retro.votesPerPerson) return false;
      retro.votesPerPerson = count;
      // Drop the newest extra dots so nobody keeps more votes than the new limit.
      for (const person of room.participants) {
        let extra = votesUsed(retro, person.id) - count;
        for (let index = retro.cards.length - 1; index >= 0 && extra > 0; index -= 1) {
          const card = retro.cards[index];
          if (!card) continue;
          const voteIndex = card.votes.lastIndexOf(person.id);
          if (voteIndex < 0) continue;
          card.votes.splice(voteIndex, 1);
          extra -= 1;
        }
      }
      return true;
    }
    case "retro.startTimer": {
      ensureTimers(retro);
      const phase = op.phase ?? retro.phase;
      const seconds = clampInt(op.seconds, 30, 3600, "Timer");
      const endsAt = new Date(Date.parse(now) + seconds * 1000).toISOString();
      retro.timers = { ...retro.timers, [phase]: endsAt };
      retro.timerEndsAt = retro.timers[retro.phase] ?? null;
      return true;
    }
    case "retro.clearTimer": {
      ensureTimers(retro);
      const phase = op.phase ?? retro.phase;
      if (!retro.timers[phase]) {
        if (phase === retro.phase && retro.timerEndsAt) {
          retro.timerEndsAt = null;
          return true;
        }
        return false;
      }
      const next = { ...retro.timers };
      delete next[phase];
      retro.timers = next;
      retro.timerEndsAt = next[retro.phase] ?? null;
      return true;
    }
    case "retro.focusCard": {
      requirePhase(retro, "discuss", "The discussion order changes in the discuss section.");
      if (op.cardId && !retro.cards.some((card) => card.id === op.cardId)) {
        throw new CadenceError("That note is gone.", "missing");
      }
      if (retro.discussedCardId === op.cardId) return false;
      retro.discussedCardId = op.cardId;
      return true;
    }
    case "retro.setDiscussionBy": {
      requirePhase(retro, "discuss", "The discussion basis is chosen in the discuss section.");
      if (actorId !== hostOf(room)) {
        throw new CadenceError("Only the host can choose how the room discusses.", "host");
      }
      if (retro.discussionBy === op.by) return false;
      retro.discussionBy = op.by;
      retro.discussedGroupKey = null;
      return true;
    }
    case "retro.focusGroup": {
      requirePhase(retro, "discuss", "The discussion order changes in the discuss section.");
      assertDiscussionGroup(retro, op.key);
      if (retro.discussedGroupKey === op.key) return false;
      retro.discussedGroupKey = op.key;
      return true;
    }
    case "retro.addAction": {
      requirePhase(retro, "act", "Actions are recorded in the actions section.");
      if (retro.actions.length >= LIMITS.actions) throw new CadenceError("The action list is full.", "limit");
      let body = cleanBlock(op.body, LIMITS.card, "Action");
      let sourceCardId: string | null = null;
      if (op.sourceCardId) {
        const card = findCard(retro, op.sourceCardId);
        if (retro.actions.some((action) => action.sourceCardId === card.id)) {
          throw new CadenceError("That note is already an action.", "duplicate");
        }
        sourceCardId = card.id;
        if (!body) body = card.body;
      }
      if (!body) throw new CadenceError("Write the action before adding it.", "text");
      retro.actions.push({ id: createId("act"), body, ownerId: null, done: false, sourceCardId });
      return true;
    }
    case "retro.setActionDone": {
      requirePhase(retro, "act", "Actions are updated in the actions section.");
      const action = findAction(retro, op.actionId);
      if (action.done === op.done) return false;
      action.done = op.done;
      return true;
    }
    case "retro.assignAction": {
      requirePhase(retro, "act", "Actions are updated in the actions section.");
      const action = findAction(retro, op.actionId);
      if (op.ownerId && !room.participants.some((person) => person.id === op.ownerId)) {
        throw new CadenceError("That person is not in the room.", "owner");
      }
      if (action.ownerId === op.ownerId) return false;
      action.ownerId = op.ownerId;
      return true;
    }
    case "retro.deleteAction": {
      requirePhase(retro, "act", "Actions are updated in the actions section.");
      const index = retro.actions.findIndex((action) => action.id === op.actionId);
      if (index < 0) throw new CadenceError("That action is gone.", "missing");
      retro.actions.splice(index, 1);
      return true;
    }
    default:
      return false;
  }
}

function applyReview(room: Room, op: Op, actorId: string, now: string): boolean {
  const review = requireReview(room);
  switch (op.type) {
    case "review.setItemDone": {
      const item = findItem(review, op.itemId);
      const index = item.doneBy.indexOf(actorId);
      if (op.done && index >= 0) return false;
      if (!op.done && index < 0) return false;
      if (op.done) item.doneBy.push(actorId);
      else item.doneBy.splice(index, 1);
      return true;
    }
    case "review.setItemNote": {
      const item = findItem(review, op.itemId);
      const note = cleanBlock(op.note, LIMITS.note, "Note");
      if (item.note === note) return false;
      item.note = note;
      return true;
    }
    case "review.addItem": {
      const section = review.sections.find((item) => item.id === op.sectionId);
      if (!section) throw new CadenceError("That section is not on this checklist.", "section");
      if (section.items.length >= LIMITS.itemsPerSection) {
        throw new CadenceError("This section is full.", "limit");
      }
      const label = cleanLine(op.label, 180, "Checklist item");
      section.items.push({
        id: createId("item"),
        label,
        detail: "Added by the room.",
        required: false,
        doneBy: [],
        note: "",
      });
      return true;
    }
    case "review.setGoal": {
      const goal = cleanBlock(op.goal, LIMITS.goal, "Sprint goal");
      if (review.goal === goal) return false;
      review.goal = goal;
      return true;
    }
    case "review.addFeedback": {
      if (review.feedback.length >= LIMITS.notes) throw new CadenceError("The feedback list is full.", "limit");
      const body = cleanBlock(op.body, LIMITS.feedback, "Feedback");
      if (!body) throw new CadenceError("Write the feedback before adding it.", "text");
      review.feedback.push({ id: createId("note"), authorId: actorId, body, kind: op.kind, createdAt: now });
      return true;
    }
    case "review.deleteFeedback": {
      const index = review.feedback.findIndex((note) => note.id === op.feedbackId);
      if (index < 0) throw new CadenceError("That feedback is gone.", "missing");
      review.feedback.splice(index, 1);
      return true;
    }
    case "review.setDecision": {
      if (review.decision === op.decision) return false;
      review.decision = op.decision;
      return true;
    }
    case "review.setDecisionNotes": {
      const notes = cleanBlock(op.notes, LIMITS.decisionNotes, "Decision notes");
      if (review.decisionNotes === notes) return false;
      review.decisionNotes = notes;
      return true;
    }
    default:
      return false;
  }
}

function applyRoadmap(room: Room, op: Op, _now: string): boolean {
  const roadmap = requireRoadmap(room);
  switch (op.type) {
    case "roadmap.setFramework": {
      if (roadmap.framework === op.framework) return false;
      roadmap.framework = op.framework;
      return true;
    }
    case "roadmap.setObjective": {
      const objective = cleanBlock(op.objective, LIMITS.objective, "Objective");
      if (roadmap.objective === objective) return false;
      roadmap.objective = objective;
      return true;
    }
    case "roadmap.addInitiative": {
      if (roadmap.initiatives.length >= LIMITS.initiatives) {
        throw new CadenceError("This roadmap is full.", "limit");
      }
      roadmap.initiatives.push(blankInitiative());
      return true;
    }
    case "roadmap.patchInitiative": {
      const initiative = roadmap.initiatives.find((item) => item.id === op.initiativeId);
      if (!initiative) throw new CadenceError("That initiative is gone.", "missing");
      return patchInitiative(room, initiative, op.patch);
    }
    case "roadmap.deleteInitiative": {
      const index = roadmap.initiatives.findIndex((item) => item.id === op.initiativeId);
      if (index < 0) throw new CadenceError("That initiative is gone.", "missing");
      roadmap.initiatives.splice(index, 1);
      return true;
    }
    default:
      return false;
  }
}

function patchInitiative(room: Room, initiative: Initiative, patch: InitiativePatch): boolean {
  let changed = false;
  const assign = <K extends keyof Initiative>(key: K, value: Initiative[K]) => {
    if (initiative[key] !== value) {
      initiative[key] = value;
      changed = true;
    }
  };

  if (patch.title !== undefined) assign("title", cleanLine(patch.title, LIMITS.initiativeTitle, "Title", false));
  if (patch.outcome !== undefined) assign("outcome", cleanBlock(patch.outcome, LIMITS.outcome, "Outcome"));
  if (patch.assumption !== undefined) {
    assign("assumption", cleanBlock(patch.assumption, LIMITS.assumption, "Assumption"));
  }
  if (patch.reach !== undefined) assign("reach", clampInt(patch.reach, 0, 1_000_000, "Reach"));
  if (patch.impact !== undefined) assign("impact", parseImpact(patch.impact));
  if (patch.confidence !== undefined) assign("confidence", clampNumber(patch.confidence, 0, 1, "Confidence"));
  if (patch.effort !== undefined) assign("effort", clampNumber(patch.effort, 0.25, 240, "Effort"));
  if (patch.iceImpact !== undefined) assign("iceImpact", clampInt(patch.iceImpact, 1, 10, "ICE impact"));
  if (patch.iceConfidence !== undefined) {
    assign("iceConfidence", clampInt(patch.iceConfidence, 1, 10, "ICE confidence"));
  }
  if (patch.iceEase !== undefined) assign("iceEase", clampInt(patch.iceEase, 1, 10, "Ease"));
  if (patch.value !== undefined) assign("value", clampInt(patch.value, 1, 10, "Business value"));
  if (patch.complexityTechnical !== undefined) {
    assign("complexityTechnical", clampInt(patch.complexityTechnical, 1, 5, "Technical complexity"));
  }
  if (patch.complexityDependency !== undefined) {
    assign("complexityDependency", clampInt(patch.complexityDependency, 1, 5, "Dependency complexity"));
  }
  if (patch.complexityUncertainty !== undefined) {
    assign("complexityUncertainty", clampInt(patch.complexityUncertainty, 1, 5, "Uncertainty"));
  }
  if (patch.horizon !== undefined) assign("horizon", expectEnum(patch.horizon, HORIZONS, "Horizon"));
  if (patch.ownerId !== undefined) {
    if (patch.ownerId && !room.participants.some((person) => person.id === patch.ownerId)) {
      throw new CadenceError("That person is not in the room.", "owner");
    }
    assign("ownerId", patch.ownerId);
  }
  return changed;
}

function presentRetro(retro: RetroState, actorId: string | null, names: Map<string, string>): RetroView {
  const source = withIcebreaker(retro);
  // Notes stay author-only while writing; they open to the room in Discuss.
  const conceal = source.phase === "brainstorm";
  const cards: RetroCardView[] = source.cards
    .filter((card) => !conceal || (actorId != null && card.authorId === actorId))
    .map((card) => {
      const mine = actorId != null && card.authorId === actorId;
      const hideAuthor = card.anonymous;
      return {
        id: card.id,
        columnId: card.columnId,
        body: card.body,
        authorId: hideAuthor ? null : card.authorId,
        authorName: hideAuthor ? null : names.get(card.authorId) ?? "Someone",
        anonymous: card.anonymous,
        votes: conceal ? card.votes.filter((id) => id === actorId) : [...card.votes],
        voteCount: card.votes.length,
        createdAt: card.createdAt,
        hidden: false,
        mine,
      };
    });
  const presented = structuredClone(source);
  const template = RETRO_TEMPLATES[presented.templateId];
  presented.columns = presented.columns.map((column) => {
    const fresh = template.columns.find((item) => item.id === column.id);
    if (!fresh) return column;
    return { ...column, title: fresh.title, hint: fresh.hint, tone: fresh.tone };
  });
  return { ...presented, cards, icebreakerAnswers: presentAnswers(presented, actorId) };
}

function presentAnswers(retro: RetroState, actorId: string | null) {
  const answers = retro.icebreakerAnswers;
  const pairs = thisOrThatGame(retro.icebreakerPairs).rounds?.length ?? 0;
  const mine = new Set(
    answers.filter((answer) => answer.game === "this-or-that" && answer.authorId === actorId).map((answer) => answer.round),
  );
  const finishedPairs =
    retro.phase === "summary" ||
    (actorId != null && pairs > 0 && Array.from({ length: pairs }, (_, index) => mine.has(index)).every(Boolean));
  return answers.flatMap((answer) => {
    if (answer.game === "this-or-that" && answer.authorId !== actorId && !finishedPairs) return [];
    const copy = { ...answer, guesses: answer.guesses?.map((guess) => ({ ...guess })) };
    if (answer.game === "two-truths") {
      if (!answer.revealed) {
        if (answer.authorId !== actorId) {
          delete copy.lie;
          // Guests only see their own pick until the lie is revealed (or everyone has guessed).
          copy.guesses = (copy.guesses ?? []).filter((guess) => guess.authorId === actorId);
        }
        // The author keeps every guess so they can watch progress before revealing.
      }
      // Everyone except the author sees a private order, so the lie is not given away by position.
      if (answer.authorId !== actorId) {
        copy.displayOrder = truthDisplayOrder(`${answer.id}:${actorId ?? "guest"}`);
      } else {
        copy.displayOrder = [0, 1, 2];
      }
    }
    return [copy];
  });
}

function pairRound(game: IcebreakerGame, shared: number, requested: number | undefined): number {
  if (game.mode !== "pairs") return game.rounds ? shared : 0;
  const count = game.rounds?.length ?? 0;
  if (requested == null) return Math.min(Math.max(shared, 0), Math.max(0, count - 1));
  if (!Number.isInteger(requested) || requested < 0 || requested >= count) {
    throw new CadenceError("That pair is not in this game.", "round");
  }
  return requested;
}

function splitDash(value: string): [string, string] {
  const match = value.match(/^(.*?)\s+[—–-]\s+(.*)$/);
  if (!match?.[1]) return [value, ""];
  return [match[1], (match[2] ?? "").trim()];
}

function normalizeIcebreaker(game: IcebreakerGame, round: number, input: string): { body: string; lie?: number } {
  if (game.mode === "word") {
    const body = cleanLine(input, LIMITS.icebreakerWord, "Word");
    if (/\s/.test(body)) throw new CadenceError("Keep it to one word.", "text");
    return { body };
  }
  if (game.mode === "sprint") {
    const cleaned = cleanLine(input, LIMITS.icebreakerLine, "Word");
    const [word, note] = splitDash(cleaned);
    if (!word || /\s/.test(word)) {
      throw new CadenceError("Start with one word. Add a short explanation after a dash if you want.", "text");
    }
    return { body: note ? `${word} — ${note}` : word };
  }
  if (game.mode === "choice" || game.mode === "pairs") {
    const choices = game.mode === "pairs" ? icebreakerChoices(game, round) : game.choices ?? [];
    const body = cleanLine(input, LIMITS.icebreakerLine, "Choice");
    if (!choices.includes(body)) {
      throw new CadenceError(
        game.id === "feelings" ? "Pick a feeling from the check-in." : "Pick one of the choices.",
        "choice",
      );
    }
    return { body };
  }
  if (game.mode === "note") {
    const cleaned = cleanLine(input, LIMITS.icebreakerLine, game.name);
    const [head, note] = splitDash(cleaned);
    if (!(game.choices ?? []).includes(head)) {
      throw new CadenceError(game.id === "energy" ? "Pick a number from 1 to 5." : "Pick one of the forecasts.", "choice");
    }
    return { body: note ? `${head} — ${note}` : head };
  }
  if (game.mode === "emoji") {
    const cleaned = cleanLine(input, LIMITS.icebreakerLine, "Check-in");
    const emoji = (game.choices ?? []).find((item) => cleaned.startsWith(item));
    if (!emoji) throw new CadenceError("Pick an emoji from the check-in.", "choice");
    const sentence = cleaned.slice(emoji.length).trim();
    if (!sentence) throw new CadenceError("Add one sentence about that emoji.", "text");
    return { body: `${emoji} ${sentence}` };
  }
  if (game.mode === "gif") {
    const cleaned = cleanLine(input, LIMITS.icebreakerGif + LIMITS.icebreakerLine, "GIF");
    const [head, note] = splitDash(cleaned);
    let url: URL;
    try {
      url = new URL(head);
    } catch {
      throw new CadenceError("Paste an https link to a GIF.", "text");
    }
    if (url.protocol !== "https:" || url.username || url.password || head.length > LIMITS.icebreakerGif) {
      throw new CadenceError("Paste an https link to a GIF.", "text");
    }
    return { body: note ? `${head} — ${note}` : head };
  }
  if (game.mode === "draw") return { body: normalizeDrawing(input) };
  if (game.mode === "truths") return normalizeTruths(input);
  const limit = game.id === "shout-out" ? LIMITS.icebreakerShout : LIMITS.icebreakerLine;
  return { body: cleanLine(input, limit, game.name) };
}

function normalizeDrawing(input: string): string {
  const value = input.trim();
  if (!value.startsWith("d:") || value.length > LIMITS.icebreakerDrawing) {
    throw new CadenceError(
      value.length > LIMITS.icebreakerDrawing ? "That drawing is too detailed. Try a simpler one." : "Share a drawing from the board.",
      value.length > LIMITS.icebreakerDrawing ? "limit" : "text",
    );
  }
  const strokes = value.slice(2).split(";");
  if (strokes.length < 1 || strokes.length > 80) {
    throw new CadenceError("That drawing is too detailed. Try a simpler one.", "limit");
  }
  const normalized = strokes.map((stroke) => {
    const points = stroke.split(" ").filter(Boolean);
    if (points.length < 2 || points.length > 200) {
      throw new CadenceError("Share a drawing from the board.", "text");
    }
    return points
      .map((point) => {
        const [rawX, rawY] = point.split(",");
        if (!rawX || !rawY || !/^\d{1,3}$/.test(rawX) || !/^\d{1,3}$/.test(rawY)) {
          throw new CadenceError("Share a drawing from the board.", "text");
        }
        const x = Number(rawX);
        const y = Number(rawY);
        if (x > 100 || y > 100) throw new CadenceError("Share a drawing from the board.", "text");
        return `${x},${y}`;
      })
      .join(" ");
  });
  return `d:${normalized.join(";")}`;
}

function normalizeTruths(input: string): { body: string; lie: number } {
  const block = cleanBlock(input, 500, "Statements");
  const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
  const marker = lines[lines.length - 1] ?? "";
  if (!/^#[123]$/.test(marker)) throw new CadenceError("Mark which statement is the lie.", "choice");
  const statements = lines.slice(0, -1);
  if (statements.length !== 3) throw new CadenceError("Share exactly three statements.", "text");
  for (const statement of statements) {
    if (statement.length > 120) throw new CadenceError("Each statement must be 120 characters or fewer.", "text");
  }
  return { body: statements.join("\n"), lie: Number(marker.slice(1)) - 1 };
}

export function sectionStopwatchMs(
  retro: Pick<RetroState, "phase" | "stopwatchMs" | "stopwatchRunningSince">,
  phase: RetroPhase,
  now: string | number = Date.now(),
): number {
  const accrued = Math.max(0, Math.floor(Number(retro.stopwatchMs?.[phase] ?? 0)));
  if (phase !== retro.phase || !retro.stopwatchRunningSince) return accrued;
  const started = Date.parse(retro.stopwatchRunningSince);
  if (!Number.isFinite(started)) return accrued;
  const nowMs = typeof now === "number" ? now : Date.parse(now);
  if (!Number.isFinite(nowMs)) return accrued;
  return accrued + Math.max(0, nowMs - started);
}

function playingIcebreaker(retro: RetroState): IcebreakerGame {
  const game = icebreakerById(retro.icebreaker);
  if (game.id !== "this-or-that") return game;
  return thisOrThatGame(retro.icebreakerPairs);
}

function parsePairs(value: unknown): IcebreakerPair[] {
  if (!Array.isArray(value)) throw new CadenceError("Pairs need to be a list.", "type");
  return value.map((item) => {
    if (!item || typeof item !== "object") {
      throw new CadenceError("Each pair needs two sides.", "type");
    }
    const record = item as Record<string, unknown>;
    return {
      question: String(record.question ?? ""),
      left: String(record.left ?? ""),
      right: String(record.right ?? ""),
    };
  });
}

function cleanPairs(pairs: IcebreakerPair[]): IcebreakerPair[] {
  if (pairs.length < 1) throw new CadenceError("Keep at least one pair.", "limit");
  if (pairs.length > LIMITS.icebreakerPairs) throw new CadenceError("Eight pairs is the limit.", "limit");
  return pairs.map((pair) => {
    const left = cleanLine(pair.left, LIMITS.icebreakerSide, "Side");
    const right = cleanLine(pair.right, LIMITS.icebreakerSide, "Side");
    if (left.toLowerCase() === right.toLowerCase()) {
      throw new CadenceError("The two sides need different names.", "choice");
    }
    const question = cleanLine(pairQuestion(left, right), LIMITS.icebreakerQuestion, "Question");
    return { question, left, right };
  });
}

function reconcilePairAnswers(retro: RetroState, pairs: IcebreakerPair[]): void {
  retro.icebreakerAnswers = retro.icebreakerAnswers.filter((answer) => {
    if (answer.game !== "this-or-that") return true;
    const pair = pairs[answer.round];
    if (!pair) return false;
    const head = answer.body.split(/\s+[—–-]\s+/)[0] ?? answer.body;
    return head === pair.left || head === pair.right;
  });
  if (retro.icebreakerRound >= pairs.length) retro.icebreakerRound = Math.max(0, pairs.length - 1);
}

function withIcebreaker(retro: RetroState): RetroState {
  const known = ICEBREAKERS.some((game) => game.id === retro.icebreaker);
  const game = icebreakerById(known ? retro.icebreaker : "one-word");
  const pairs = storedThisOrThatPairs(retro.icebreakerPairs);
  const playing = game.id === "this-or-that" ? thisOrThatGame(pairs) : game;
  const round = Number.isInteger(retro.icebreakerRound) && retro.icebreakerRound >= 0 ? retro.icebreakerRound : 0;
  const last = (playing.rounds?.length ?? 1) - 1;
  const timers = withTimers(retro);
  const stopwatches = withStopwatches(retro);
  return {
    ...retro,
    ...timers,
    ...stopwatches,
    icebreaker: game.id,
    icebreakerPairs: pairs,
    icebreakerRound: playing.rounds ? Math.min(round, last) : round,
    icebreakerAnswers: Array.isArray(retro.icebreakerAnswers) ? retro.icebreakerAnswers : [],
    discussionBy: retro.discussionBy === "author" ? "author" : "status",
    discussedGroupKey: typeof retro.discussedGroupKey === "string" ? retro.discussedGroupKey : null,
  };
}

function withStopwatches(retro: RetroState): Pick<RetroState, "stopwatchMs" | "stopwatchRunningSince"> {
  const stopwatchMs: Partial<Record<RetroPhase, number>> = {};
  if (retro.stopwatchMs && typeof retro.stopwatchMs === "object") {
    for (const phase of PHASES) {
      const value = retro.stopwatchMs[phase];
      if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
        stopwatchMs[phase] = Math.floor(value);
      }
    }
  }
  const running =
    typeof retro.stopwatchRunningSince === "string" && Number.isFinite(Date.parse(retro.stopwatchRunningSince))
      ? retro.stopwatchRunningSince
      : null;
  return { stopwatchMs, stopwatchRunningSince: running };
}

function ensureStopwatches(retro: RetroState): void {
  const next = withStopwatches(retro);
  retro.stopwatchMs = next.stopwatchMs;
  retro.stopwatchRunningSince = next.stopwatchRunningSince;
}

function moveStopwatch(retro: RetroState, nextPhase: RetroPhase, now: string): void {
  ensureStopwatches(retro);
  const previous = retro.phase;
  if (retro.stopwatchRunningSince) {
    const elapsed = sectionStopwatchMs(retro, previous, now);
    retro.stopwatchMs = { ...retro.stopwatchMs, [previous]: elapsed };
  }
  retro.phase = nextPhase;
  retro.stopwatchRunningSince = now;
}

function startStopwatchIfNeeded(retro: RetroState, now: string): void {
  ensureStopwatches(retro);
  if (!retro.stopwatchRunningSince) retro.stopwatchRunningSince = now;
}

function withTimers(retro: RetroState): Pick<RetroState, "timers" | "timerEndsAt"> {
  const timers: Partial<Record<RetroPhase, string>> = {};
  const stored = retro.timers && typeof retro.timers === "object" ? retro.timers : null;
  if (stored) {
    for (const phase of PHASES) {
      const endsAt = stored[phase];
      if (typeof endsAt === "string" && Number.isFinite(Date.parse(endsAt))) timers[phase] = endsAt;
    }
  }
  // Legacy rooms only had timerEndsAt. Never copy that onto a different section
  // once per-section timers already exist — that made one stopwatch leak into another.
  if (Object.keys(timers).length === 0 && typeof retro.timerEndsAt === "string" && Number.isFinite(Date.parse(retro.timerEndsAt))) {
    timers[retro.phase] = retro.timerEndsAt;
  }
  return { timers, timerEndsAt: timers[retro.phase] ?? null };
}

function ensureTimers(retro: RetroState): void {
  const next = withTimers(retro);
  retro.timers = next.timers;
  retro.timerEndsAt = next.timerEndsAt;
}

function ensureIcebreaker(retro: RetroState): void {
  const next = withIcebreaker(retro);
  retro.icebreaker = next.icebreaker;
  retro.icebreakerPairs = next.icebreakerPairs;
  retro.icebreakerRound = next.icebreakerRound;
  retro.icebreakerAnswers = next.icebreakerAnswers;
  retro.discussionBy = next.discussionBy;
  retro.discussedGroupKey = next.discussedGroupKey;
  retro.timers = next.timers;
  retro.timerEndsAt = next.timerEndsAt;
  retro.stopwatchMs = next.stopwatchMs;
  retro.stopwatchRunningSince = next.stopwatchRunningSince;
}

function blankRetro(templateId: RetroTemplateId, now: string): RetroState {
  return {
    templateId,
    phase: "icebreak",
    votesPerPerson: 3,
    timerEndsAt: null,
    timers: {},
    stopwatchMs: {},
    stopwatchRunningSince: now,
    columns: columnsFor(templateId),
    cards: [],
    actions: [],
    discussedCardId: null,
    discussionBy: "status",
    discussedGroupKey: null,
    icebreaker: "one-word",
    icebreakerRound: 0,
    icebreakerPairs: null,
    icebreakerAnswers: [],
  };
}

function blankRoadmap(): RoadmapState {
  return { framework: "rice", objective: "", initiatives: [] };
}

function blankInitiative(): Initiative {
  return {
    id: createId("bet"),
    title: "",
    outcome: "",
    assumption: "",
    reach: 100,
    impact: 1,
    confidence: 0.8,
    effort: 1,
    iceImpact: 5,
    iceConfidence: 5,
    iceEase: 5,
    value: 5,
    complexityTechnical: 3,
    complexityDependency: 3,
    complexityUncertainty: 3,
    horizon: "next",
    ownerId: null,
  };
}

function fillDemo(room: Room, hostId: string, now: string): void {
  const host = room.participants.find((person) => person.id === hostId) ?? room.participants[0];
  if (!host) return;
  const alex = makeParticipant("person_alexdemo01", "Alex Rivera", room.participants.length, past(now, 120_000));
  const sam = makeParticipant("person_samdemo001", "Sam Okonkwo", room.participants.length + 1, past(now, 90_000));
  const jordan = makeParticipant("person_jordandemo1", "Jordan Lee", room.participants.length + 2, past(now, 60_000));
  room.participants.push(alex, sam, jordan);
  const authors = [host, alex, sam, jordan];

  if (room.retro) {
    room.retro.cards = demoNotesForColumns(room.retro.columns, authors, now);
    const source =
      room.retro.cards.find((card) => card.columnId === room.retro?.columns[1]?.id)?.id ??
      room.retro.cards[0]?.id ??
      null;
    room.retro.actions = demoActions(authors, source);
    room.retro.phase = "discuss";
    room.retro.discussionBy = "status";
    room.retro.icebreaker = "one-word";
    room.retro.icebreakerAnswers = authors.slice(0, 3).map((person, index) => ({
      id: `ice_demo_${index}`,
      authorId: person.id,
      game: "one-word" as const,
      round: 0,
      body: ["Focused", "Steady", "Curious"][index] ?? "Ready",
      createdAt: now,
    }));
    moveStopwatch(room.retro, "discuss", now);
  }

  if (room.review) {
    const seed = demoReviewContent(authors, now);
    room.review.goal = seed.goal;
    room.review.decision = seed.decision;
    room.review.decisionNotes = seed.decisionNotes;
    room.review.feedback = seed.feedback;
    for (const itemId of seed.checkedItemIds) {
      check(room.review, itemId, host.id);
      check(room.review, itemId, alex.id);
      if (itemId === "dod" || itemId === "journey" || itemId === "decision-made") {
        check(room.review, itemId, sam.id);
      }
    }
  }

  if (room.roadmap) {
    const seed = demoRoadmapContent(authors);
    room.roadmap.framework = "rice";
    room.roadmap.objective = seed.objective;
    room.roadmap.initiatives = seed.initiatives;
  }
}

function check(review: ReviewState, itemId: string, actorId: string) {
  const item = findItem(review, itemId);
  if (!item.doneBy.includes(actorId)) item.doneBy.push(actorId);
}

function hostOf(room: { hostId?: string; participants: { id: string }[] }): string {
  if (room.hostId) return room.hostId;
  return room.participants[0]?.id ?? "";
}

function makeParticipant(id: string, name: string, index: number, now: string): Participant {
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(id)) throw new CadenceError("Invalid participant.", "actor");
  return { id, name: cleanName(name), color: PALETTE[index % PALETTE.length] ?? PALETTE[0], lastSeen: now };
}

function requireRetro(room: Room): RetroState {
  if (!room.retro) throw new CadenceError("This room is not a retrospective.", "kind");
  return room.retro;
}

function requireReview(room: Room): ReviewState {
  if (!room.review) throw new CadenceError("This room is not a sprint review.", "kind");
  return room.review;
}

function requireRoadmap(room: Room): RoadmapState {
  if (!room.roadmap) throw new CadenceError("This room is not a roadmap.", "kind");
  return room.roadmap;
}

function assertDiscussionGroup(retro: RetroState, key: string) {
  if (retro.discussionBy === "author") {
    if (key === "anonymous") {
      if (retro.cards.some((card) => card.anonymous)) return;
      throw new CadenceError("There are no anonymous notes to discuss.", "group");
    }
    if (retro.cards.some((card) => !card.anonymous && card.authorId === key)) return;
    throw new CadenceError("That person has no notes to discuss.", "group");
  }
  if (!retro.columns.some((column) => column.id === key)) {
    throw new CadenceError("That status is not on this board.", "group");
  }
  if (!retro.cards.some((card) => card.columnId === key)) {
    throw new CadenceError("That status has no notes to discuss.", "group");
  }
}

function requirePhase(retro: RetroState, phase: RetroPhase, message: string) {
  if (retro.phase !== phase) throw new CadenceError(message, "phase");
}

function assertCanChangeCard(retro: RetroState, card: RetroCard, actorId: string) {
  if (retro.phase === "brainstorm" && card.authorId !== actorId) {
    throw new CadenceError("That note is still private.", "private");
  }
}

function findCard(retro: RetroState, cardId: string): RetroCard {
  const card = retro.cards.find((item) => item.id === cardId);
  if (!card) throw new CadenceError("That note is gone.", "missing");
  return card;
}

function findAction(retro: RetroState, actionId: string): ActionItem {
  const action = retro.actions.find((item) => item.id === actionId);
  if (!action) throw new CadenceError("That action is gone.", "missing");
  return action;
}

function findItem(review: ReviewState, itemId: string) {
  for (const section of review.sections) {
    const item = section.items.find((entry) => entry.id === itemId);
    if (item) return item;
  }
  throw new CadenceError("That checklist item is gone.", "missing");
}

function parseImpact(value: unknown): ImpactLevel {
  const number = asNumber(value, "Impact");
  const found = IMPACT_OPTIONS.find((option) => Math.abs(option.value - number) < 0.001);
  if (!found) throw new CadenceError("Impact must be 0.25, 0.5, 1, 2, or 3.", "impact");
  return found.value;
}

function parsePatch(input: unknown): InitiativePatch {
  if (!input || typeof input !== "object") throw new CadenceError("Missing initiative fields.", "op");
  const source = input as Record<string, unknown>;
  const allowed = [
    "title",
    "outcome",
    "assumption",
    "reach",
    "impact",
    "confidence",
    "effort",
    "iceImpact",
    "iceConfidence",
    "iceEase",
    "value",
    "complexityTechnical",
    "complexityDependency",
    "complexityUncertainty",
    "horizon",
    "ownerId",
  ] as const;
  const patch: InitiativePatch = {};
  for (const key of allowed) {
    if (key in source) {
      (patch as Record<string, unknown>)[key] = source[key];
    }
  }
  return patch;
}

function expectString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length < 1 || value.length > 80) {
    throw new CadenceError(`${label} is missing.`, "op");
  }
  return value;
}

function expectEnum<T extends string>(value: unknown, allowed: readonly T[], label: string): T {
  if (typeof value === "string" && (allowed as readonly string[]).includes(value)) return value as T;
  throw new CadenceError(`${label} is not one of the available choices.`, "op");
}

function touch(room: Room, now: string) {
  room.updatedAt = now;
  room.version += 1;
}

function past(now: string, ms: number): string {
  return new Date(Date.parse(now) - ms).toISOString();
}
