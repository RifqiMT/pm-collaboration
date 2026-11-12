import { describe, expect, it } from "vitest";
import {
  RETRO_PHASES,
  authorLabel,
  formatClock,
  formatElapsed,
  notesEditable,
  phaseProgress,
  sortDiscussNotes,
  timerTone,
  votingOpen,
} from "./retro-ui";
import type { RetroCardView } from "@cadence/core";

const baseCard = {
  id: "c1",
  columnId: "col",
  body: "Ship faster",
  authorId: "u1",
  authorName: "Ada",
  anonymous: false,
  votes: [],
  voteCount: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  hidden: false,
  mine: false,
} satisfies RetroCardView;

function card(partial: Partial<RetroCardView> & Pick<RetroCardView, "id" | "body">): RetroCardView {
  return { ...baseCard, ...partial };
}

describe("retro-ui helpers", () => {
  it("exposes the ritual phases in order", () => {
    expect(RETRO_PHASES.map((phase) => phase.id)).toEqual([
      "icebreak",
      "brainstorm",
      "discuss",
      "vote",
      "act",
      "summary",
    ]);
  });

  it("locks note editing to brainstorm", () => {
    expect(notesEditable("brainstorm")).toBe(true);
    expect(notesEditable("vote")).toBe(false);
    expect(notesEditable("discuss")).toBe(false);
    expect(notesEditable("act")).toBe(false);
    expect(notesEditable("summary")).toBe(false);
    expect(notesEditable("icebreak")).toBe(false);
  });

  it("opens voting only while the room is voting", () => {
    expect(votingOpen("vote")).toBe(true);
    expect(votingOpen("discuss")).toBe(false);
    expect(votingOpen("brainstorm")).toBe(false);
    expect(votingOpen("act")).toBe(false);
    expect(votingOpen("summary")).toBe(false);
    expect(votingOpen("icebreak")).toBe(false);
  });

  it("formats clocks and elapsed time", () => {
    expect(formatClock(65_000)).toBe("1:05");
    expect(formatClock(0)).toBe("0:00");
    expect(formatElapsed(65_000)).toBe("1:05");
    expect(formatElapsed(3_665_000)).toBe("1:01:05");
  });

  it("maps timer remaining to tone", () => {
    expect(timerTone(null)).toBe("idle");
    expect(timerTone(60_000)).toBe("running");
    expect(timerTone(12_000)).toBe("urgent");
    expect(timerTone(0)).toBe("done");
  });

  it("computes phase progress across the ritual", () => {
    expect(phaseProgress("icebreak")).toBe(0);
    expect(phaseProgress("summary")).toBe(1);
    expect(phaseProgress("discuss")).toBe(0.4);
    expect(phaseProgress("act")).toBe(0.8);
  });

  it("labels authors with anonymity and ownership", () => {
    expect(authorLabel(baseCard)).toBe("Ada");
    expect(authorLabel({ ...baseCard, mine: true })).toBe("You");
    expect(authorLabel({ ...baseCard, anonymous: true })).toBe("Anonymous");
    expect(authorLabel({ ...baseCard, anonymous: true, mine: true })).toBe("You · anonymous");
    expect(authorLabel({ ...baseCard, hidden: true })).toBe("Private");
  });

  it("sorts discuss notes by author, then by the time they were written", () => {
    const notes = [
      card({ id: "a", body: "A", authorName: "Sam", authorId: "sam", createdAt: "2026-01-01T02:00:00.000Z" }),
      card({ id: "d", body: "D", authorName: "Alex", authorId: "alex", createdAt: "2026-01-01T03:00:00.000Z" }),
      card({ id: "b", body: "B", authorName: "Alex", authorId: "alex", createdAt: "2026-01-01T01:00:00.000Z" }),
      card({
        id: "c",
        body: "C",
        anonymous: true,
        authorId: null,
        authorName: null,
        createdAt: "2026-01-01T00:30:00.000Z",
      }),
    ];
    expect(sortDiscussNotes(notes).map((item) => item.id)).toEqual(["b", "d", "a", "c"]);
  });
});
