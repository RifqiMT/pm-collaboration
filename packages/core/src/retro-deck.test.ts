import { describe, expect, it } from "vitest";
import { retrospectiveDeck } from "./retro-deck";
import { applyOp, createRoom, joinRoom, presentRoom } from "./room";

const NOW = "2026-11-06T12:00:00.000Z";
const HOST = "person_host00001";
const GUEST = "person_alexdemo01";

describe("retrospective deck", () => {
  it("builds icebreaker, durations, one slide per category, top votes, and actions", () => {
    let stored = createRoom(
      {
        code: "SPRINT",
        kind: "retro",
        title: "Sprint 42",
        hostId: HOST,
        hostName: "Rifqi",
        templateId: "start-stop-continue",
      },
      NOW,
    );
    stored = joinRoom(stored, { id: GUEST, name: "Alex Rivera" }, NOW).room;
    stored = applyOp(stored, { type: "retro.setIcebreaker", game: "this-or-that" }, HOST, NOW);
    stored = applyOp(stored, { type: "retro.answerIcebreaker", body: "Morning", round: 0 }, HOST, NOW);
    stored = applyOp(stored, { type: "retro.answerIcebreaker", body: "Evening", round: 0 }, GUEST, NOW);
    stored = applyOp(stored, { type: "retro.setPhase", phase: "brainstorm" }, HOST, "2026-11-06T12:01:00.000Z");
    stored = applyOp(
      stored,
      { type: "retro.addCard", columnId: "start", body: "Ship the fix", anonymous: false },
      HOST,
      "2026-11-06T12:01:00.000Z",
    );
    stored = applyOp(
      stored,
      { type: "retro.addCard", columnId: "stop", body: "Skip the handoff", anonymous: false },
      GUEST,
      "2026-11-06T12:01:00.000Z",
    );
    stored = applyOp(
      stored,
      { type: "retro.addCard", columnId: "continue", body: "Keep the standup short", anonymous: false },
      HOST,
      "2026-11-06T12:01:00.000Z",
    );
    stored = applyOp(stored, { type: "retro.setPhase", phase: "discuss" }, HOST, "2026-11-06T12:01:15.000Z");
    stored = applyOp(stored, { type: "retro.focusGroup", key: "start" }, HOST, "2026-11-06T12:01:15.000Z");
    stored = applyOp(stored, { type: "retro.raiseHand", raised: true }, GUEST, "2026-11-06T12:01:16.000Z");
    stored = applyOp(stored, { type: "retro.raiseHand", raised: true }, HOST, "2026-11-06T12:01:17.000Z");
    stored = applyOp(stored, { type: "retro.focusGroup", key: "stop" }, HOST, "2026-11-06T12:01:20.000Z");
    stored = applyOp(stored, { type: "retro.raiseHand", raised: false }, GUEST, "2026-11-06T12:01:21.000Z");
    stored = applyOp(stored, { type: "retro.raiseHand", raised: true }, GUEST, "2026-11-06T12:01:22.000Z");
    stored = applyOp(stored, { type: "retro.setPhase", phase: "vote" }, HOST, "2026-11-06T12:01:30.000Z");
    expect(stored.retro?.raisedHands).toEqual([]);
    expect(stored.retro?.discussSpeakLog.map((entry) => [entry.personId, entry.groupKey])).toEqual([
      [GUEST, "start"],
      [HOST, "start"],
      [GUEST, "stop"],
    ]);
    const startId = stored.retro?.cards.find((card) => card.body === "Ship the fix")?.id ?? "";
    const stopId = stored.retro?.cards.find((card) => card.body === "Skip the handoff")?.id ?? "";
    stored = applyOp(stored, { type: "retro.vote", cardId: startId, voting: true }, HOST, "2026-11-06T12:01:30.000Z");
    stored = applyOp(stored, { type: "retro.vote", cardId: startId, voting: true }, GUEST, "2026-11-06T12:01:30.000Z");
    stored = applyOp(stored, { type: "retro.vote", cardId: stopId, voting: true }, HOST, "2026-11-06T12:01:30.000Z");
    stored = applyOp(stored, { type: "retro.setPhase", phase: "act" }, HOST, "2026-11-06T12:02:00.000Z");
    stored = applyOp(
      stored,
      { type: "retro.addAction", body: "Cut the handoff", sourceCardId: startId },
      HOST,
      "2026-11-06T12:02:00.000Z",
    );
    const actionId = stored.retro?.actions[0]?.id ?? "";
    stored = applyOp(
      stored,
      { type: "retro.assignAction", actionId, ownerId: GUEST },
      HOST,
      "2026-11-06T12:02:00.000Z",
    );
    stored = applyOp(stored, { type: "retro.setPhase", phase: "summary" }, HOST, "2026-11-06T12:02:30.000Z");

    const view = presentRoom(stored, HOST, "2026-11-06T12:02:30.000Z");
    const deck = retrospectiveDeck(view, "2026-11-06T12:02:30.000Z");
    expect(deck).not.toBeNull();
    expect(deck!.slides.map((slide) => slide.kind)).toEqual([
      "icebreaker",
      "durations",
      "discussOrder",
      "overview",
      "category",
      "category",
      "category",
      "topVotes",
      "actions",
    ]);

    const icebreaker = deck!.slides.find((slide) => slide.kind === "icebreaker");
    expect(icebreaker?.kind).toBe("icebreaker");
    if (icebreaker?.kind === "icebreaker") {
      expect(icebreaker.game).toBe("This or That");
      expect(icebreaker.durationSeconds).toBe(60);
      expect(icebreaker.answers).toHaveLength(2);
    }

    const discuss = deck!.slides.find((slide) => slide.kind === "discussOrder");
    expect(discuss?.kind).toBe("discussOrder");
    if (discuss?.kind === "discussOrder") {
      expect(discuss.basis).toBe("status");
      expect(discuss.overall.map((speaker) => speaker.name)).toEqual(["Alex Rivera", "Rifqi"]);
      expect(discuss.byCategory).toEqual([
        {
          category: "Start",
          speakers: [
            { order: 1, name: "Alex Rivera" },
            { order: 2, name: "Rifqi" },
          ],
        },
        {
          category: "Stop",
          speakers: [{ order: 1, name: "Alex Rivera" }],
        },
      ]);
    }

    const durations = deck!.slides.find((slide) => slide.kind === "durations");
    expect(durations?.kind).toBe("durations");
    if (durations?.kind === "durations") {
      expect(durations.rows.map((row) => row.section)).toEqual([
        "Icebreaker",
        "Notes",
        "Discuss",
        "Vote",
        "Actions",
        "Summary",
      ]);
      expect(durations.rows.every((row) => typeof row.seconds === "number")).toBe(true);
    }

    const overview = deck!.slides.find((slide) => slide.kind === "overview");
    expect(overview?.kind).toBe("overview");
    if (overview?.kind === "overview") {
      expect(overview.notesTotal).toBe(3);
      expect(overview.notesByCategory).toEqual([
        { category: "Start", count: 1 },
        { category: "Stop", count: 1 },
        { category: "Continue", count: 1 },
      ]);
      expect(overview.votesCast).toBe(3);
      expect(overview.votesTotal).toBe(6);
      expect(overview.people).toBe(2);
      expect(overview.actionsTotal).toBe(1);
      expect(overview.actionsOpen).toBe(1);
      expect(overview.actionsDone).toBe(0);
      expect(overview.actionsByOwner).toEqual([
        { owner: "Alex Rivera", count: 1, open: 1, done: 0 },
      ]);
    }

    const categories = deck!.slides.filter((slide) => slide.kind === "category");
    expect(
      categories.map((slide) => (slide.kind === "category" ? [slide.title, slide.noteCount] : [])),
    ).toEqual([
      ["Start", 1],
      ["Stop", 1],
      ["Continue", 1],
    ]);

    const top = deck!.slides.find((slide) => slide.kind === "topVotes");
    expect(top?.kind).toBe("topVotes");
    if (top?.kind === "topVotes") {
      expect(top.notes[0]).toMatchObject({ body: "Ship the fix", column: "Start", votes: 2 });
      expect(top.notes.length).toBeLessThanOrEqual(10);
      expect(top.notes).toHaveLength(3);
    }

    const actions = deck!.slides.find((slide) => slide.kind === "actions");
    expect(actions?.kind).toBe("actions");
    if (actions?.kind === "actions") {
      expect(actions.actions).toEqual([
        { body: "Cut the handoff", owner: "Alex Rivera", done: false, source: "Ship the fix" },
      ]);
    }
  });
});
