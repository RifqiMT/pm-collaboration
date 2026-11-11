import { describe, expect, it } from "vitest";
import { retrospectiveCsv, retrospectiveExport } from "./retro-export";
import { applyOp, createRoom, joinRoom, presentRoom } from "./room";

const NOW = "2026-11-06T12:00:00.000Z";
const HOST = "person_host00001";
const GUEST = "person_alexdemo01";

function room() {
  return createRoom(
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
}

describe("retrospective export", () => {
  it("summarizes every note, vote, action, person, and icebreaker answer", () => {
    let stored = room();
    stored = joinRoom(stored, { id: GUEST, name: "Alex Rivera" }, NOW).room;
    stored = applyOp(stored, { type: "retro.setIcebreaker", game: "this-or-that" }, HOST, NOW);
    stored = applyOp(stored, { type: "retro.answerIcebreaker", body: "Morning", round: 0 }, HOST, NOW);
    stored = applyOp(stored, { type: "retro.answerIcebreaker", body: "Evening", round: 0 }, GUEST, NOW);
    stored = applyOp(stored, { type: "retro.setPhase", phase: "brainstorm" }, HOST, NOW);
    stored = applyOp(stored, { type: "retro.addCard", columnId: "start", body: "Ship the fix", anonymous: false }, HOST, NOW);
    stored = applyOp(stored, { type: "retro.addCard", columnId: "stop", body: 'Say "later"', anonymous: true }, GUEST, NOW);
    stored = applyOp(stored, { type: "retro.setPhase", phase: "vote" }, HOST, NOW);
    const noteId = stored.retro?.cards.find((card) => card.body === "Ship the fix")?.id ?? "";
    stored = applyOp(stored, { type: "retro.vote", cardId: noteId, voting: true }, HOST, NOW);
    stored = applyOp(stored, { type: "retro.setPhase", phase: "act" }, HOST, NOW);
    stored = applyOp(stored, { type: "retro.addAction", body: "Cut the handoff", sourceCardId: noteId }, HOST, NOW);
    const actionId = stored.retro?.actions[0]?.id ?? "";
    stored = applyOp(stored, { type: "retro.assignAction", actionId, ownerId: GUEST }, HOST, NOW);
    stored = applyOp(stored, { type: "retro.setPhase", phase: "summary" }, HOST, NOW);

    const early = presentRoom(
      applyOp(room(), { type: "retro.setIcebreaker", game: "this-or-that" }, HOST, NOW),
      GUEST,
      NOW,
    );
    expect(early.retro?.phase).not.toBe("summary");

    const view = presentRoom(stored, GUEST, NOW);
    const hostAnswer = view.retro?.icebreakerAnswers.find((answer) => answer.authorId === HOST);
    expect(hostAnswer?.body).toBe("Morning");
    const data = retrospectiveExport(view);
    expect(data?.template).toBe("Start, stop, continue");
    expect(data?.people).toEqual(["Rifqi", "Alex Rivera"]);
    expect(data?.notes.map((note) => [note.column, note.body, note.author, note.votes, note.voters])).toEqual([
      ["Start", "Ship the fix", "Rifqi", 1, ["Rifqi"]],
      ["Stop", 'Say "later"', "Anonymous", 0, []],
    ]);
    expect(data?.actions).toEqual([{ body: "Cut the handoff", owner: "Alex Rivera", done: false, source: "Ship the fix" }]);
    expect(data?.answers.map((answer) => [answer.question, answer.author, answer.body])).toEqual([
      ["Morning or Evening?", "Rifqi", "Morning"],
      ["Morning or Evening?", "Alex Rivera", "Evening"],
    ]);

    const csv = retrospectiveCsv(view);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    const lines = csv.replace(/^\uFEFF/, "").trim().split("\r\n");
    expect(lines[0]?.split(",").slice(0, 3)).toEqual(["section", "room_code", "room_title"]);
    expect(lines.some((line) => line.startsWith("room,SPRINT,Sprint 42,"))).toBe(true);
    expect(lines.some((line) => line.startsWith("person,SPRINT,") && line.includes("Alex Rivera"))).toBe(true);
    expect(csv).toContain('"Say ""later"""');
    expect(csv).toContain("Anonymous");
    expect(csv).toContain("Cut the handoff");
    expect(csv).toContain("This or That,1,Morning or Evening?");
    expect(lines.filter((line) => line.startsWith("note,") || line.startsWith('"note"'))).toHaveLength(2);
    expect(lines.filter((line) => line.startsWith("icebreaker,"))).toHaveLength(2);
    expect(lines.filter((line) => line.startsWith("timing,"))).toHaveLength(6);
  });

  it("writes each section stopwatch and countdown in seconds", () => {
    let stored = room();
    const later = "2026-11-06T12:01:00.000Z";
    const done = "2026-11-06T12:01:30.000Z";
    stored = applyOp(stored, { type: "retro.setPhase", phase: "brainstorm" }, HOST, later);
    stored = applyOp(stored, { type: "retro.startTimer", seconds: 180, phase: "brainstorm" }, HOST, later);
    stored = applyOp(stored, { type: "retro.setPhase", phase: "summary" }, HOST, done);
    const view = presentRoom(stored, HOST, done);
    const data = retrospectiveExport(view, done);
    expect(data?.timings.map((timing) => [timing.section, timing.stopwatchSeconds, timing.timerSeconds])).toEqual([
      ["Icebreaker", 60, null],
      ["Notes", 30, 150],
      ["Discuss", 0, null],
      ["Vote", 0, null],
      ["Actions", 0, null],
      ["Summary", 0, null],
    ]);
    const csv = retrospectiveCsv(view, done);
    expect(csv).toContain("timing,SPRINT,,,,,Icebreaker,,,,,,,,,,,,60,");
    expect(csv).toContain("timing,SPRINT,,,,,Notes,,,,,,,,,,,,30,150");
  });
});
