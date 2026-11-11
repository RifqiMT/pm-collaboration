import { RETRO_TEMPLATES, icebreakerById, thisOrThatGame } from "./content";
import { sectionStopwatchMs } from "./room";
import type { IcebreakerAnswer, RetroCardView, RetroPhase, RoomView } from "./types";

const PHASE_NAMES: { id: RetroPhase; name: string }[] = [
  { id: "icebreak", name: "Icebreaker" },
  { id: "brainstorm", name: "Notes" },
  { id: "discuss", name: "Discuss" },
  { id: "vote", name: "Vote" },
  { id: "act", name: "Actions" },
  { id: "summary", name: "Summary" },
];

export interface RetroExportNote {
  column: string;
  hint: string;
  body: string;
  author: string;
  anonymous: boolean;
  votes: number;
  voters: string[];
  createdAt: string;
}

export interface RetroExportAction {
  body: string;
  owner: string;
  done: boolean;
  source: string;
}

export interface RetroExportAnswer {
  game: string;
  round: number;
  question: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface RetroExportTiming {
  section: string;
  stopwatchSeconds: number;
  timerSeconds: number | null;
}

export interface RetroExport {
  code: string;
  title: string;
  template: string;
  people: string[];
  notes: RetroExportNote[];
  actions: RetroExportAction[];
  answers: RetroExportAnswer[];
  timings: RetroExportTiming[];
}

const CSV_HEADER = [
  "section",
  "room_code",
  "room_title",
  "template",
  "column",
  "column_hint",
  "text",
  "author",
  "anonymous",
  "votes",
  "voters",
  "owner",
  "done",
  "source_note",
  "game",
  "round",
  "question",
  "created_at",
  "stopwatch_seconds",
  "timer_seconds",
];

export function retrospectiveExport(
  room: Pick<RoomView, "code" | "title" | "participants" | "retro">,
  now: string | number = Date.now(),
): RetroExport | null {
  const retro = room.retro;
  if (!retro) return null;
  const names = new Map(room.participants.map((person) => [person.id, person.name]));
  const person = (id: string | null | undefined) => (id ? names.get(id) ?? "Someone" : "");
  const template = RETRO_TEMPLATES[retro.templateId]?.name ?? retro.templateId;
  const notes: RetroExportNote[] = [];
  for (const column of retro.columns) {
    const cards = retro.cards
      .filter((card) => card.columnId === column.id && card.body)
      .sort((a, b) => b.voteCount - a.voteCount || a.createdAt.localeCompare(b.createdAt));
    for (const card of cards) {
      notes.push(noteRow(column.title, column.hint, card, person));
    }
  }
  const actions: RetroExportAction[] = retro.actions.map((action) => {
    const source = retro.cards.find((card) => card.id === action.sourceCardId);
    return {
      body: action.body,
      owner: action.ownerId ? person(action.ownerId) || "Someone" : "Unassigned",
      done: action.done,
      source: source?.body ?? "",
    };
  });
  const answers = [...retro.icebreakerAnswers]
    .sort((a, b) => a.game.localeCompare(b.game) || a.round - b.round || a.createdAt.localeCompare(b.createdAt))
    .map((answer) => answerRow(retro, answer, person));
  return {
    code: room.code,
    title: room.title,
    template,
    people: room.participants.map((item) => item.name),
    notes,
    actions,
    answers,
    timings: PHASE_NAMES.map((phase) => ({
      section: phase.name,
      stopwatchSeconds: Math.floor(sectionStopwatchMs(retro, phase.id, now) / 1000),
      timerSeconds: timerSeconds(retro.timers?.[phase.id], now),
    })),
  };
}

export function retrospectiveCsv(
  room: Pick<RoomView, "code" | "title" | "participants" | "retro">,
  now: string | number = Date.now(),
): string {
  const data = retrospectiveExport(room, now);
  if (!data) return "";
  const rows: string[][] = [CSV_HEADER];
  const blank = (): string[] => Array.from({ length: CSV_HEADER.length }, () => "");
  const roomRow = blank();
  fill(roomRow, { section: "room", room_code: data.code, room_title: data.title, template: data.template });
  rows.push(roomRow);
  for (const name of data.people) {
    const row = blank();
    fill(row, { section: "person", room_code: data.code, author: name });
    rows.push(row);
  }
  for (const note of data.notes) {
    const row = blank();
    fill(row, {
      section: "note",
      room_code: data.code,
      template: data.template,
      column: note.column,
      column_hint: note.hint,
      text: note.body,
      author: note.author,
      anonymous: note.anonymous ? "yes" : "no",
      votes: String(note.votes),
      voters: note.voters.join("; "),
      created_at: note.createdAt,
    });
    rows.push(row);
  }
  for (const action of data.actions) {
    const row = blank();
    fill(row, {
      section: "action",
      room_code: data.code,
      template: data.template,
      text: action.body,
      owner: action.owner,
      done: action.done ? "yes" : "no",
      source_note: action.source,
    });
    rows.push(row);
  }
  for (const answer of data.answers) {
    const row = blank();
    fill(row, {
      section: "icebreaker",
      room_code: data.code,
      text: answer.body,
      author: answer.author,
      game: answer.game,
      round: String(answer.round + 1),
      question: answer.question,
      created_at: answer.createdAt,
    });
    rows.push(row);
  }
  for (const timing of data.timings) {
    const row = blank();
    fill(row, {
      section: "timing",
      room_code: data.code,
      text: timing.section,
      stopwatch_seconds: String(timing.stopwatchSeconds),
      timer_seconds: timing.timerSeconds == null ? "" : String(timing.timerSeconds),
    });
    rows.push(row);
  }
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}

function timerSeconds(endsAt: string | undefined, now: string | number): number | null {
  if (!endsAt) return null;
  const ends = Date.parse(endsAt);
  const nowMs = typeof now === "number" ? now : Date.parse(now);
  if (!Number.isFinite(ends) || !Number.isFinite(nowMs)) return null;
  return Math.max(0, Math.floor((ends - nowMs) / 1000));
}

function noteRow(
  column: string,
  hint: string,
  card: RetroCardView,
  person: (id: string | null | undefined) => string,
): RetroExportNote {
  return {
    column,
    hint,
    body: card.body ?? "",
    author: card.anonymous ? "Anonymous" : card.authorName ?? "Someone",
    anonymous: card.anonymous,
    votes: card.voteCount,
    voters: card.votes.map((id) => person(id)).filter(Boolean),
    createdAt: card.createdAt,
  };
}

function answerRow(
  retro: NonNullable<RoomView["retro"]>,
  answer: IcebreakerAnswer,
  person: (id: string | null | undefined) => string,
): RetroExportAnswer {
  const game = answer.game === "this-or-that" ? thisOrThatGame(retro.icebreakerPairs) : icebreakerById(answer.game);
  return {
    game: game.name,
    round: answer.round,
    question: game.questions?.[answer.round] ?? game.prompt,
    author: person(answer.authorId) || "Someone",
    body: answer.body,
    createdAt: answer.createdAt,
  };
}

function fill(row: string[], values: Partial<Record<(typeof CSV_HEADER)[number], string>>): void {
  for (const [key, value] of Object.entries(values)) {
    const index = CSV_HEADER.indexOf(key);
    if (index >= 0 && value != null) row[index] = value;
  }
}

function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
