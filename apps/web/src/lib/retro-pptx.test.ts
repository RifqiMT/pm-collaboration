import { describe, expect, it } from "vitest";
import type { RetroDeck } from "@cadence/core";
import { buildRetroPptx } from "./retro-pptx";

describe("buildRetroPptx", () => {
  it("writes a powerpoint blob for the consultant slide set", async () => {
    const deck: RetroDeck = {
      code: "SPRINT",
      title: "Sprint 42",
      template: "Start, stop, continue",
      people: ["Rifqi", "Alex Rivera"],
      generatedAt: "2026-11-06T12:02:30.000Z",
      slides: [
        {
          kind: "icebreaker",
          title: "Icebreaker summary",
          game: "This or That",
          durationSeconds: 60,
          answers: [{ author: "Rifqi", body: "Morning", question: "Morning or Evening?" }],
        },
        {
          kind: "durations",
          title: "Section duration",
          rows: [
            { section: "Icebreaker", seconds: 60 },
            { section: "Notes", seconds: 30 },
          ],
        },
        {
          kind: "discussOrder",
          title: "Discuss speaking order",
          basis: "status",
          overall: [
            { order: 1, name: "Alex Rivera" },
            { order: 2, name: "Rifqi" },
          ],
          byCategory: [
            {
              category: "Start",
              speakers: [
                { order: 1, name: "Alex Rivera" },
                { order: 2, name: "Rifqi" },
              ],
            },
          ],
        },
        {
          kind: "overview",
          title: "Session snapshot",
          notesTotal: 3,
          notesByCategory: [
            { category: "Start", count: 1 },
            { category: "Stop", count: 1 },
            { category: "Continue", count: 1 },
          ],
          votesCast: 3,
          votesTotal: 6,
          people: 2,
          actionsTotal: 1,
          actionsOpen: 1,
          actionsDone: 0,
          actionsByOwner: [{ owner: "Alex Rivera", count: 1, open: 1, done: 0 }],
        },
        {
          kind: "category",
          title: "Start",
          hint: "Keep doing",
          noteCount: 1,
          notes: [{ column: "Start", body: "Ship the fix", author: "Rifqi", votes: 2 }],
        },
        {
          kind: "topVotes",
          title: "Top 10 voted notes",
          notes: [{ column: "Start", body: "Ship the fix", author: "Rifqi", votes: 2 }],
        },
        {
          kind: "actions",
          title: "Actions",
          actions: [{ body: "Cut the handoff", owner: "Alex Rivera", done: false, source: "Ship the fix" }],
        },
      ],
    };

    const blob = await buildRetroPptx(deck);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(1000);
    expect(blob.type).toMatch(/presentation|zip|octet-stream|openxml/i);
  });
});
