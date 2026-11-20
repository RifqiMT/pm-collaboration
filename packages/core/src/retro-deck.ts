import { icebreakerById } from "./content";
import {
  retrospectiveExport,
  type RetroExportAction,
  type RetroExportAnswer,
  type RetroExportNote,
} from "./retro-export";
import type { DiscussionBy, RoomView } from "./types";

export interface RetroDeckAnswer {
  author: string;
  body: string;
  question: string;
}

export interface RetroDeckNote {
  column: string;
  body: string;
  author: string;
  votes: number;
}

export interface RetroDeckAction {
  body: string;
  owner: string;
  done: boolean;
  source: string;
}

export interface RetroDeckSpeaker {
  order: number;
  name: string;
}

export interface RetroDeckDiscussCategory {
  category: string;
  speakers: RetroDeckSpeaker[];
}

export type RetroDeckSlide =
  | {
      kind: "icebreaker";
      title: string;
      game: string;
      durationSeconds: number;
      answers: RetroDeckAnswer[];
    }
  | {
      kind: "durations";
      title: string;
      rows: { section: string; seconds: number }[];
    }
  | {
      kind: "discussOrder";
      title: string;
      basis: DiscussionBy;
      overall: RetroDeckSpeaker[];
      byCategory: RetroDeckDiscussCategory[];
    }
  | {
      kind: "overview";
      title: string;
      notesTotal: number;
      notesByCategory: { category: string; count: number }[];
      votesCast: number;
      votesTotal: number;
      people: number;
      actionsTotal: number;
      actionsOpen: number;
      actionsDone: number;
      actionsByOwner: { owner: string; count: number; open: number; done: number }[];
    }
  | {
      kind: "category";
      title: string;
      hint: string;
      noteCount: number;
      notes: RetroDeckNote[];
    }
  | {
      kind: "topVotes";
      title: string;
      notes: RetroDeckNote[];
    }
  | {
      kind: "actions";
      title: string;
      actions: RetroDeckAction[];
    };

export interface RetroDeck {
  code: string;
  title: string;
  template: string;
  people: string[];
  generatedAt: string;
  slides: RetroDeckSlide[];
}

/** Builds the consultant retrospective deck model used by the PPT export. */
export function retrospectiveDeck(
  room: Pick<RoomView, "code" | "title" | "participants" | "retro">,
  now: string | number = Date.now(),
): RetroDeck | null {
  const data = retrospectiveExport(room, now);
  const retro = room.retro;
  if (!data || !retro) return null;

  const icebreakerTiming = data.timings.find((timing) => timing.section === "Icebreaker");
  const durationSeconds = icebreakerTiming?.stopwatchSeconds ?? 0;
  const game = data.answers[0]?.game ?? icebreakerById(retro.icebreaker).name;
  const names = new Map(room.participants.map((person) => [person.id, person.name]));
  const slides: RetroDeckSlide[] = [
    {
      kind: "icebreaker",
      title: "Icebreaker summary",
      game,
      durationSeconds,
      answers: data.answers.map(toDeckAnswer),
    },
    {
      kind: "durations",
      title: "Section duration",
      rows: data.timings.map((timing) => ({
        section: timing.section,
        seconds: timing.stopwatchSeconds,
      })),
    },
    buildDiscussOrderSlide(retro, names),
    buildOverviewSlide(data, retro),
  ];

  for (const column of retro.columns) {
    const notes = data.notes.filter((note) => note.column === column.title).map(toDeckNote);
    slides.push({
      kind: "category",
      title: column.title,
      hint: column.hint,
      noteCount: notes.length,
      notes,
    });
  }

  slides.push({
    kind: "topVotes",
    title: "Top 10 voted notes",
    notes: topVotedNotes(data.notes, 10),
  });

  slides.push({
    kind: "actions",
    title: "Actions",
    actions: data.actions.map(toDeckAction),
  });

  return {
    code: data.code,
    title: data.title,
    template: data.template,
    people: data.people,
    generatedAt: typeof now === "number" ? new Date(now).toISOString() : now,
    slides,
  };
}

function buildOverviewSlide(
  data: NonNullable<ReturnType<typeof retrospectiveExport>>,
  retro: NonNullable<RoomView["retro"]>,
): Extract<RetroDeckSlide, { kind: "overview" }> {
  const votesCast = data.notes.reduce((sum, note) => sum + note.votes, 0);
  const votesTotal = Math.max(0, data.people.length * Math.max(0, retro.votesPerPerson));
  const actionsOpen = data.actions.filter((action) => !action.done).length;
  const actionsDone = data.actions.length - actionsOpen;
  const ownerMap = new Map<string, { count: number; open: number; done: number }>();
  for (const action of data.actions) {
    const current = ownerMap.get(action.owner) ?? { count: 0, open: 0, done: 0 };
    current.count += 1;
    if (action.done) current.done += 1;
    else current.open += 1;
    ownerMap.set(action.owner, current);
  }
  const actionsByOwner = [...ownerMap.entries()]
    .map(([owner, counts]) => ({ owner, ...counts }))
    .sort((a, b) => b.count - a.count || a.owner.localeCompare(b.owner));

  return {
    kind: "overview",
    title: "Session snapshot",
    notesTotal: data.notes.length,
    notesByCategory: retro.columns.map((column) => ({
      category: column.title,
      count: data.notes.filter((note) => note.column === column.title).length,
    })),
    votesCast,
    votesTotal,
    people: data.people.length,
    actionsTotal: data.actions.length,
    actionsOpen,
    actionsDone,
    actionsByOwner,
  };
}

function buildDiscussOrderSlide(
  retro: NonNullable<RoomView["retro"]>,
  names: Map<string, string>,
): Extract<RetroDeckSlide, { kind: "discussOrder" }> {
  const basis: DiscussionBy = retro.discussionBy === "author" ? "author" : "status";
  const log = Array.isArray(retro.discussSpeakLog) ? retro.discussSpeakLog : [];
  const personName = (id: string) => names.get(id) ?? "Someone";
  const categoryLabel = (groupKey: string) => {
    if (groupKey === "room") return "General";
    if (groupKey === "anonymous") return "Anonymous";
    const column = retro.columns.find((item) => item.id === groupKey);
    if (column) return column.title;
    return names.get(groupKey) ?? groupKey;
  };

  const overallIds: string[] = [];
  for (const entry of log) {
    if (!overallIds.includes(entry.personId)) overallIds.push(entry.personId);
  }

  const categoryOrder: string[] = [];
  for (const entry of log) {
    if (!categoryOrder.includes(entry.groupKey)) categoryOrder.push(entry.groupKey);
  }
  // Prefer template column order when discussing by status.
  if (basis === "status") {
    const ranked = retro.columns.map((column) => column.id).filter((id) => categoryOrder.includes(id));
    const extras = categoryOrder.filter((id) => !ranked.includes(id));
    categoryOrder.length = 0;
    categoryOrder.push(...ranked, ...extras);
  }

  const byCategory = categoryOrder.map((groupKey) => {
    const speakers: string[] = [];
    for (const entry of log) {
      if (entry.groupKey !== groupKey) continue;
      if (!speakers.includes(entry.personId)) speakers.push(entry.personId);
    }
    return {
      category: categoryLabel(groupKey),
      speakers: speakers.map((id, index) => ({ order: index + 1, name: personName(id) })),
    };
  });

  return {
    kind: "discussOrder",
    title: "Discuss speaking order",
    basis,
    overall: overallIds.map((id, index) => ({ order: index + 1, name: personName(id) })),
    byCategory,
  };
}

function toDeckAnswer(answer: RetroExportAnswer): RetroDeckAnswer {
  return {
    author: answer.author,
    body: answer.body,
    question: answer.question,
  };
}

function toDeckNote(note: RetroExportNote): RetroDeckNote {
  return {
    column: note.column,
    body: note.body,
    author: note.author,
    votes: note.votes,
  };
}

function toDeckAction(action: RetroExportAction): RetroDeckAction {
  return {
    body: action.body,
    owner: action.owner,
    done: action.done,
    source: action.source,
  };
}

function topVotedNotes(notes: RetroExportNote[], limit: number): RetroDeckNote[] {
  return [...notes]
    .sort((a, b) => b.votes - a.votes || a.body.localeCompare(b.body))
    .slice(0, limit)
    .map(toDeckNote);
}
