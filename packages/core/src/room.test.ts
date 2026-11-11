import { describe, expect, it } from "vitest";
import { columnMark, previewMediaCandidates, RETRO_TEMPLATES, RITUALS, truthDisplayOrder } from "./content";
import { formatScore, formulaLine, scoreInitiative, scoreRoadmap } from "./scoring";
import {
  applyOp,
  checklistProgress,
  createRoom,
  joinRoom,
  parseOp,
  discussionGroups,
  presentRoom,
  sectionStopwatchMs,
  votesLeft,
  votesUsed,
} from "./room";
import { CadenceError, type Initiative, type RetroState, type RetroTemplateId } from "./types";

const NOW = "2026-11-06T12:00:00.000Z";
const HOST = "person_host00001";

function retroRoom() {
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

describe("retrospective themes", () => {
  it("opens a room for every theme with that theme's columns", () => {
    const ids = Object.keys(RETRO_TEMPLATES) as RetroTemplateId[];
    expect(ids).toEqual([
      "start-stop-continue",
      "4ls",
      "mad-sad-glad",
      "sailboat",
      "rose-bud-thorn",
      "went-well",
      "daki",
      "starfish",
      "star-wars",
      "superhero",
      "arcade",
      "premiere",
      "quest",
      "race",
      "pokemon",
      "heist",
      "noir",
      "concert",
      "wizarding",
      "streaming",
      "marvel",
      "dc",
      "harry-potter",
      "breaking-bad",
      "criminal-minds",
      "ncis",
      "one-piece",
      "naruto",
      "bleach",
      "lotr",
      "stranger-things",
      "avatar",
      "sherlock",
      "squid-game",
    ]);
    const pop = ids.filter((id) => RETRO_TEMPLATES[id].group === "pop");
    expect(pop).toEqual([
      "star-wars",
      "superhero",
      "arcade",
      "premiere",
      "quest",
      "race",
      "pokemon",
      "heist",
      "noir",
      "concert",
      "wizarding",
      "streaming",
      "marvel",
      "dc",
      "harry-potter",
      "breaking-bad",
      "criminal-minds",
      "ncis",
      "one-piece",
      "naruto",
      "bleach",
      "lotr",
      "stranger-things",
      "avatar",
      "sherlock",
      "squid-game",
    ]);
    for (const templateId of ids) {
      const room = createRoom(
        { code: "THEME1", kind: "retro", title: "Themes", hostId: HOST, hostName: "Rifqi", templateId },
        NOW,
      );
      expect(room.retro?.templateId).toBe(templateId);
      expect(room.retro?.columns.map((column) => column.title)).toEqual(
        RETRO_TEMPLATES[templateId].columns.map((column) => column.title),
      );
      for (const column of RETRO_TEMPLATES[templateId].columns) {
        expect(columnMark(templateId, column.id)).not.toBe("•");
        expect(column.hint.toLowerCase()).toMatch(/sprint/);
      }
    }
  });

  it("shows the current column prompt even if the room stored an older one", () => {
    const room = createRoom(
      { code: "THEME2", kind: "retro", title: "Themes", hostId: HOST, hostName: "Rifqi", templateId: "pokemon" },
      NOW,
    );
    const stored = room.retro!.columns[0]!;
    stored.title = "Old name";
    stored.hint = "Old hint";
    const view = presentRoom(room, HOST, NOW);
    expect(view.retro?.columns[0]?.title).toBe(RETRO_TEMPLATES.pokemon.columns[0]!.title);
    expect(view.retro?.columns[0]?.hint).toBe(RETRO_TEMPLATES.pokemon.columns[0]!.hint);
    expect(room.retro?.columns[0]?.title).toBe("Old name");
  });
});

describe("media previews", () => {
  it("turns a shared page link into an animated gif or a picture", () => {
    expect(previewMediaCandidates("https://giphy.com/gifs/poop-dinosaur-romuloroyo-oL3OCpR7Bhi2Q617Th")).toEqual([
      "https://media.giphy.com/media/oL3OCpR7Bhi2Q617Th/giphy.gif",
    ]);
    expect(previewMediaCandidates("https://media.giphy.com/media/oL3OCpR7Bhi2Q617Th/giphy.webp")).toEqual([
      "https://media.giphy.com/media/oL3OCpR7Bhi2Q617Th/giphy.gif",
    ]);
    expect(previewMediaCandidates("https://example.com/sprint/photo.png?size=large")).toEqual([
      "https://example.com/sprint/photo.png?size=large",
    ]);
    expect(previewMediaCandidates("https://i.imgur.com/abc123.gifv")[0]).toBe("https://i.imgur.com/abc123.gif");
    expect(previewMediaCandidates("http://example.com/a.gif")).toEqual([]);
    expect(previewMediaCandidates("not a link")).toEqual([]);
  });
});

describe("rituals", () => {
  it("offers the three collaboration rooms", () => {
    expect(RITUALS.map((ritual) => ritual.kind)).toEqual(["retro", "review", "roadmap"]);
  });
});

describe("retrospective", () => {
  it("starts on an icebreaker and keeps one answer per person", () => {
    let room = retroRoom();
    expect(room.retro?.phase).toBe("icebreak");
    room = applyOp(room, { type: "retro.answerIcebreaker", body: "Curious" }, HOST, NOW);
    room = applyOp(room, { type: "retro.answerIcebreaker", body: "Ready" }, HOST, NOW);
    expect(room.retro?.icebreakerAnswers).toHaveLength(1);
    expect(room.retro?.icebreakerAnswers[0]?.body).toBe("Ready");

    room = applyOp(room, { type: "retro.setIcebreaker", game: "feelings" }, HOST, NOW);
    room = applyOp(room, { type: "retro.answerIcebreaker", body: "Tired" }, HOST, NOW);
    room = applyOp(room, { type: "retro.answerIcebreaker", body: "Hopeful" }, HOST, NOW);
    expect(room.retro?.icebreakerAnswers.filter((answer) => answer.game === "feelings")).toHaveLength(1);
    expect(room.retro?.icebreakerAnswers.find((answer) => answer.game === "feelings")?.body).toBe("Hopeful");
    expect(() => applyOp(room, { type: "retro.answerIcebreaker", body: "maybe" }, HOST, NOW)).toThrow(/feeling/);
  });

  it("presents an older retro that has no icebreaker fields", () => {
    const room = retroRoom();
    const retro = room.retro as RetroState;
    delete (retro as Partial<RetroState>).icebreaker;
    delete (retro as Partial<RetroState>).icebreakerRound;
    delete (retro as Partial<RetroState>).icebreakerAnswers;
    const view = presentRoom(room, HOST, NOW);
    expect(view.retro?.icebreaker).toBe("one-word");
    expect(view.retro?.icebreakerRound).toBe(0);
    expect(view.retro?.icebreakerAnswers).toEqual([]);
  });

  it("shows each person only their own notes while writing", () => {
    let room = retroRoom();
    room = joinRoom(room, { id: "person_alexdemo01", name: "Alex Rivera" }, NOW).room;
    room = applyOp(room, { type: "retro.setPhase", phase: "brainstorm" }, HOST, NOW);
    room = applyOp(
      room,
      { type: "retro.addCard", columnId: "start", body: "Ship the retry button", anonymous: false },
      "person_alexdemo01",
      NOW,
    );
    room = applyOp(
      room,
      { type: "retro.addCard", columnId: "start", body: "Celebrate the launch", anonymous: false },
      HOST,
      NOW,
    );

    const hostView = presentRoom(room, HOST, NOW);
    expect(hostView.retro?.cards).toHaveLength(1);
    expect(hostView.retro?.cards[0]?.body).toBe("Celebrate the launch");
    expect(JSON.stringify(hostView.retro)).not.toContain("Ship the retry button");
    expect(JSON.stringify(hostView.retro)).not.toContain("person_alexdemo01");

    const authorView = presentRoom(room, "person_alexdemo01", NOW);
    expect(authorView.retro?.cards).toHaveLength(1);
    expect(authorView.retro?.cards[0]?.body).toBe("Ship the retry button");
    expect(JSON.stringify(authorView.retro)).not.toContain("Celebrate the launch");

    room = applyOp(room, { type: "retro.setPhase", phase: "discuss" }, HOST, NOW);
    const shared = presentRoom(room, HOST, NOW);
    expect(shared.retro?.cards).toHaveLength(2);
    expect(shared.retro?.cards.map((card) => card.body).sort()).toEqual([
      "Celebrate the launch",
      "Ship the retry button",
    ]);
  });

  it("keeps anonymous authors off the shared view", () => {
    let room = retroRoom();
    room = applyOp(room, { type: "retro.setPhase", phase: "brainstorm" }, HOST, NOW);
    room = applyOp(
      room,
      { type: "retro.addCard", columnId: "stop", body: "Late review comments", anonymous: true },
      HOST,
      NOW,
    );
    room = applyOp(room, { type: "retro.setPhase", phase: "discuss" }, HOST, NOW);
    const view = presentRoom(room, "person_alexdemo01", NOW);
    expect(view.retro?.cards[0]?.body).toBe("Late review comments");
    expect(view.retro?.cards[0]?.authorId).toBeNull();
    expect(view.retro?.cards[0]?.mine).toBe(false);
    const mine = presentRoom(room, HOST, NOW);
    expect(mine.retro?.cards[0]?.mine).toBe(true);
    expect(mine.retro?.cards[0]?.authorId).toBeNull();
  });

  it("enforces one vote per note and the personal limit", () => {
    let room = retroRoom();
    room = applyOp(room, { type: "retro.setPhase", phase: "brainstorm" }, HOST, NOW);
    for (const body of ["One", "Two"]) {
      room = applyOp(room, { type: "retro.addCard", columnId: "continue", body, anonymous: false }, HOST, NOW);
    }
    room = applyOp(room, { type: "retro.setPhase", phase: "vote" }, HOST, NOW);
    room = applyOp(room, { type: "retro.setVotesPerPerson", count: 1 }, HOST, NOW);
    const [first, second] = room.retro?.cards ?? [];
    expect(first && second).toBeTruthy();
    room = applyOp(room, { type: "retro.vote", cardId: first!.id, voting: true }, HOST, NOW);
    expect(() => applyOp(room, { type: "retro.vote", cardId: second!.id, voting: true }, HOST, NOW)).toThrow(CadenceError);
    const repeat = applyOp(room, { type: "retro.vote", cardId: first!.id, voting: true }, HOST, NOW);
    expect(repeat.version).toBe(room.version);
    room = applyOp(room, { type: "retro.vote", cardId: first!.id, voting: false }, HOST, NOW);
    expect(votesLeft(room.retro as RetroState, HOST)).toBe(1);
    room = applyOp(room, { type: "retro.vote", cardId: first!.id, voting: true }, HOST, NOW);
    expect(votesLeft(room.retro as RetroState, HOST)).toBe(0);
  });

  it("drops extra dots when the room lowers the vote limit", () => {
    let room = retroRoom();
    room = applyOp(room, { type: "retro.setPhase", phase: "brainstorm" }, HOST, NOW);
    for (const body of ["One", "Two", "Three"]) {
      room = applyOp(room, { type: "retro.addCard", columnId: "continue", body, anonymous: false }, HOST, NOW);
    }
    room = applyOp(room, { type: "retro.setPhase", phase: "vote" }, HOST, NOW);
    room = applyOp(room, { type: "retro.setVotesPerPerson", count: 2 }, HOST, NOW);
    const cards = room.retro?.cards ?? [];
    expect(cards).toHaveLength(3);
    room = applyOp(room, { type: "retro.vote", cardId: cards[0]!.id, voting: true }, HOST, NOW);
    room = applyOp(room, { type: "retro.vote", cardId: cards[1]!.id, voting: true }, HOST, NOW);
    room = applyOp(room, { type: "retro.setVotesPerPerson", count: 1 }, HOST, NOW);
    expect(votesUsed(room.retro as RetroState, HOST)).toBe(1);
    expect(votesLeft(room.retro as RetroState, HOST)).toBe(0);
    expect(room.retro?.cards[0]?.votes).toEqual([HOST]);
    expect(room.retro?.cards[1]?.votes).toEqual([]);
  });

  it("refuses to change someone else's note while notes are hidden", () => {
    let room = retroRoom();
    room = joinRoom(room, { id: "person_alexdemo01", name: "Alex Rivera" }, NOW).room;
    room = applyOp(room, { type: "retro.setPhase", phase: "brainstorm" }, HOST, NOW);
    room = applyOp(
      room,
      { type: "retro.addCard", columnId: "start", body: "Ship the retry button", anonymous: false },
      "person_alexdemo01",
      NOW,
    );
    const cardId = room.retro?.cards[0]?.id ?? "";
    expect(() => applyOp(room, { type: "retro.deleteCard", cardId }, HOST, NOW)).toThrow(/private/);
    expect(() => applyOp(room, { type: "retro.editCard", cardId, body: "Changed" }, HOST, NOW)).toThrow(/private/);
    const removed = applyOp(room, { type: "retro.deleteCard", cardId }, "person_alexdemo01", NOW);
    expect(removed.retro?.cards).toHaveLength(0);
  });

  it("plays the added icebreaker games and hides a lie until it is revealed", () => {
    let room = retroRoom();
    room = joinRoom(room, { id: "person_alexdemo01", name: "Alex Rivera" }, NOW).room;

    room = applyOp(room, { type: "retro.setIcebreaker", game: "weather" }, HOST, NOW);
    room = applyOp(room, { type: "retro.answerIcebreaker", body: "Stormy — too many handoffs" }, HOST, NOW);
    expect(room.retro?.icebreakerAnswers.at(-1)?.body).toBe("Stormy — too many handoffs");
    expect(() => applyOp(room, { type: "retro.answerIcebreaker", body: "Snowy" }, HOST, NOW)).toThrow(/forecast/);

    room = applyOp(room, { type: "retro.setIcebreaker", game: "this-or-that" }, HOST, NOW);
    room = applyOp(room, { type: "retro.answerIcebreaker", body: "Morning" }, HOST, NOW);
    room = applyOp(room, { type: "retro.nextIcebreakerRound", step: 1 }, HOST, NOW);
    room = applyOp(room, { type: "retro.answerIcebreaker", body: "Tea" }, HOST, NOW);
    expect(room.retro?.icebreakerAnswers.filter((answer) => answer.game === "this-or-that").map((answer) => [answer.round, answer.body])).toEqual([
      [0, "Morning"],
      [1, "Tea"],
    ]);

    room = applyOp(room, { type: "retro.setIcebreaker", game: "one-word-sprint" }, HOST, NOW);
    room = applyOp(room, { type: "retro.answerIcebreaker", body: "Ready — we shipped" }, HOST, NOW);
    expect(() => applyOp(room, { type: "retro.answerIcebreaker", body: "two words" }, HOST, NOW)).toThrow(/one word/);

    room = applyOp(room, { type: "retro.setIcebreaker", game: "gif" }, HOST, NOW);
    expect(() => applyOp(room, { type: "retro.answerIcebreaker", body: "http://example.com/a.gif" }, HOST, NOW)).toThrow(/https/);

    room = applyOp(room, { type: "retro.setIcebreaker", game: "two-truths" }, HOST, NOW);
    room = applyOp(
      room,
      { type: "retro.answerIcebreaker", body: "I shipped\nI learned\nI attended zero meetings\n#3" },
      HOST,
      NOW,
    );
    const answer = room.retro?.icebreakerAnswers.find((item) => item.game === "two-truths");
    expect(answer?.lie).toBe(2);
    expect(answer?.body).toBe("I shipped\nI learned\nI attended zero meetings");
    room = applyOp(room, { type: "retro.guessIcebreaker", targetId: answer?.id ?? "", index: 2 }, "person_alexdemo01", NOW);
    const guestView = presentRoom(room, "person_alexdemo01", NOW).retro?.icebreakerAnswers.find((item) => item.game === "two-truths");
    const hostView = presentRoom(room, HOST, NOW).retro?.icebreakerAnswers.find((item) => item.game === "two-truths");
    // Only one guest is in the room, so their guess auto-reveals the lie and every pick.
    expect(guestView?.lie).toBe(2);
    expect(guestView?.revealed).toBe(true);
    expect(guestView?.guesses).toEqual([{ authorId: "person_alexdemo01", index: 2 }]);
    expect(hostView?.lie).toBe(2);
    expect(hostView?.displayOrder).toEqual([0, 1, 2]);
    expect(guestView?.displayOrder).toEqual(truthDisplayOrder(`${answer?.id}:person_alexdemo01`));
    expect(guestView?.displayOrder?.slice().sort()).toEqual([0, 1, 2]);
    expect(presentRoom(room, "person_alexdemo01", NOW).retro?.icebreakerAnswers.find((item) => item.game === "two-truths")?.lie).toBe(2);

    room = applyOp(room, { type: "retro.setIcebreaker", game: "draw" }, HOST, NOW);
    room = applyOp(room, { type: "retro.answerIcebreaker", body: "d:10,10 20,20" }, HOST, NOW);
    expect(() => applyOp(room, { type: "retro.answerIcebreaker", body: "a sketch" }, HOST, NOW)).toThrow(/draw/i);
  });

  it("lets the host rewrite This or That pairs", () => {
    let room = retroRoom();
    room = joinRoom(room, { id: "person_alexdemo01", name: "Alex Rivera" }, NOW).room;
    room = applyOp(room, { type: "retro.setIcebreaker", game: "this-or-that" }, HOST, NOW);
    expect(() =>
      applyOp(
        room,
        { type: "retro.setIcebreakerPairs", pairs: [{ question: "Ship or slip?", left: "Ship", right: "Slip" }] },
        "person_alexdemo01",
        NOW,
      ),
    ).toThrow(/host/);
    expect(() => applyOp(room, { type: "retro.setIcebreakerPairs", pairs: [] }, HOST, NOW)).toThrow(/at least one/);
    expect(() =>
      applyOp(room, { type: "retro.setIcebreakerPairs", pairs: [{ question: "Same?", left: "A", right: "a" }] }, HOST, NOW),
    ).toThrow(/different/);

    room = applyOp(room, { type: "retro.answerIcebreaker", body: "Morning" }, HOST, NOW);
    room = applyOp(room, { type: "retro.nextIcebreakerRound", step: 1 }, HOST, NOW);
    room = applyOp(room, { type: "retro.answerIcebreaker", body: "Tea" }, "person_alexdemo01", NOW);
    room = applyOp(
      room,
      {
        type: "retro.setIcebreakerPairs",
        pairs: [
          { question: "Ignore this", left: "Ship", right: "Slip" },
          { question: "Ignore this too", left: "Coffee", right: "Tea" },
        ],
      },
      HOST,
      NOW,
    );
    expect(room.retro?.icebreakerPairs?.map((pair) => pair.question)).toEqual(["Ship or Slip?", "Coffee or Tea?"]);
    expect(room.retro?.icebreakerRound).toBe(1);
    expect(room.retro?.icebreakerAnswers.filter((item) => item.game === "this-or-that").map((item) => item.body)).toEqual(["Tea"]);
    expect(() => applyOp(room, { type: "retro.answerIcebreaker", body: "Morning" }, HOST, NOW)).toThrow(/choices/);
    room = applyOp(room, { type: "retro.answerIcebreaker", body: "Coffee" }, HOST, NOW);
    expect(room.retro?.icebreakerAnswers.some((item) => item.round === 1 && item.body === "Coffee")).toBe(true);

    room = applyOp(room, { type: "retro.setIcebreaker", game: "one-word" }, HOST, NOW);
    room = applyOp(room, { type: "retro.setIcebreaker", game: "this-or-that" }, HOST, NOW);
    expect(room.retro?.icebreakerPairs?.[0]?.left).toBe("Ship");

    room = applyOp(
      room,
      { type: "retro.setIcebreakerPairs", pairs: [{ question: "Ship or slip?", left: "Ship", right: "Slip" }] },
      HOST,
      NOW,
    );
    expect(room.retro?.icebreakerRound).toBe(0);
    expect(room.retro?.icebreakerAnswers.filter((item) => item.game === "this-or-that")).toHaveLength(0);
    expect(applyOp(room, { type: "retro.nextIcebreakerRound", step: 1 }, HOST, NOW).retro?.icebreakerRound).toBe(0);

    room = applyOp(room, { type: "retro.setPhase", phase: "brainstorm" }, HOST, NOW);
    expect(() =>
      applyOp(room, { type: "retro.setIcebreakerPairs", pairs: [{ question: "Later?", left: "Yes", right: "No" }] }, HOST, NOW),
    ).toThrow(/warm-up/);

    const aged = structuredClone(retroRoom());
    if (aged.retro) {
      aged.retro.icebreaker = "this-or-that";
      delete (aged.retro as { icebreakerPairs?: unknown }).icebreakerPairs;
    }
    expect(presentRoom(aged, HOST, NOW).retro?.icebreakerPairs).toBeNull();
    expect(applyOp(aged, { type: "retro.answerIcebreaker", body: "Morning" }, HOST, NOW).retro?.icebreakerAnswers[0]?.body).toBe(
      "Morning",
    );
  });

  it("lets each person answer every pair before other answers appear", () => {
    let room = retroRoom();
    const guest = "person_alexdemo01";
    room = joinRoom(room, { id: guest, name: "Alex Rivera" }, NOW).room;
    room = applyOp(room, { type: "retro.setIcebreaker", game: "this-or-that" }, HOST, NOW);
    room = applyOp(room, { type: "retro.answerIcebreaker", body: "Morning", round: 0 }, HOST, NOW);
    room = applyOp(room, { type: "retro.answerIcebreaker", body: "Tea", round: 1 }, HOST, NOW);
    room = applyOp(room, { type: "retro.answerIcebreaker", body: "Quiet workspace", round: 2 }, HOST, NOW);
    expect(room.retro?.icebreakerRound).toBe(0);
    expect(room.retro?.icebreakerAnswers.map((answer) => [answer.round, answer.body])).toEqual([
      [0, "Morning"],
      [1, "Tea"],
      [2, "Quiet workspace"],
    ]);

    room = applyOp(room, { type: "retro.answerIcebreaker", body: "Evening", round: 0 }, guest, NOW);
    const guestEarly = presentRoom(room, guest, NOW).retro?.icebreakerAnswers.filter((answer) => answer.game === "this-or-that") ?? [];
    expect(guestEarly.map((answer) => answer.authorId)).toEqual([guest]);
    const hostEarly = presentRoom(room, HOST, NOW).retro?.icebreakerAnswers.filter((answer) => answer.game === "this-or-that") ?? [];
    expect(hostEarly.some((answer) => answer.authorId === guest && answer.body === "Evening")).toBe(true);
    expect(() => applyOp(room, { type: "retro.answerIcebreaker", body: "Morning", round: 9 }, guest, NOW)).toThrow(/pair/);

    room = applyOp(room, { type: "retro.answerIcebreaker", body: "Coffee", round: 1 }, guest, NOW);
    room = applyOp(room, { type: "retro.answerIcebreaker", body: "Background music", round: 2 }, guest, NOW);
    const guestDone = presentRoom(room, guest, NOW).retro?.icebreakerAnswers.filter((answer) => answer.game === "this-or-that") ?? [];
    expect(guestDone).toHaveLength(6);
  });

  it("lets only the host move between sections", () => {
    let room = retroRoom();
    room = joinRoom(room, { id: "person_alexdemo01", name: "Alex Rivera" }, NOW).room;
    expect(room.hostId).toBe(HOST);
    expect(() => applyOp(room, { type: "retro.setPhase", phase: "brainstorm" }, "person_alexdemo01", NOW)).toThrow(/host/);
    room = applyOp(room, { type: "retro.setPhase", phase: "brainstorm" }, HOST, NOW);
    expect(room.retro?.phase).toBe("brainstorm");

    const legacy = retroRoom();
    delete (legacy as { hostId?: string }).hostId;
    const joined = joinRoom(legacy, { id: "person_alexdemo01", name: "Alex Rivera" }, NOW).room;
    expect(presentRoom(joined, "person_alexdemo01", NOW).hostId).toBe(HOST);
    expect(() => applyOp(joined, { type: "retro.setPhase", phase: "discuss" }, "person_alexdemo01", NOW)).toThrow(/host/);
  });

  it("keeps a countdown timer on each section", () => {
    let room = retroRoom();
    room = applyOp(room, { type: "retro.startTimer", seconds: 180, phase: "icebreak" }, HOST, NOW);
    expect(room.retro?.timers.icebreak).toBeTruthy();
    expect(room.retro?.timerEndsAt).toBe(room.retro?.timers.icebreak);
    const icebreakEnds = room.retro?.timers.icebreak;
    room = applyOp(room, { type: "retro.setPhase", phase: "brainstorm" }, HOST, NOW);
    expect(room.retro?.timerEndsAt).toBeNull();
    expect(room.retro?.timers.icebreak).toBe(icebreakEnds);
    room = applyOp(room, { type: "retro.startTimer", seconds: 300, phase: "brainstorm" }, HOST, NOW);
    expect(room.retro?.timers.brainstorm).toBeTruthy();
    expect(room.retro?.timers.icebreak).toBe(icebreakEnds);
    expect(room.retro?.timers.brainstorm).not.toBe(icebreakEnds);
    room = applyOp(room, { type: "retro.setPhase", phase: "icebreak" }, HOST, NOW);
    expect(room.retro?.timerEndsAt).toBe(icebreakEnds);
    room = applyOp(room, { type: "retro.clearTimer", phase: "icebreak" }, HOST, NOW);
    expect(room.retro?.timers.icebreak).toBeUndefined();
    expect(room.retro?.timers.brainstorm).toBeTruthy();
    expect(room.retro?.timerEndsAt).toBeNull();

    // A leftover top-level timer must not copy onto a different section.
    const contaminated = retroRoom();
    contaminated.retro!.timers = { icebreak: "2026-11-07T12:03:00.000Z" };
    contaminated.retro!.timerEndsAt = "2026-11-07T12:03:00.000Z";
    contaminated.retro!.phase = "vote";
    const cleaned = presentRoom(contaminated, HOST, NOW).retro;
    expect(cleaned?.timers).toEqual({ icebreak: "2026-11-07T12:03:00.000Z" });
    expect(cleaned?.timerEndsAt).toBeNull();
  });

  it("runs a separate stopwatch for each section when the section is opened", () => {
    let room = retroRoom();
    expect(room.retro?.stopwatchRunningSince).toBe(NOW);
    expect(sectionStopwatchMs(room.retro!, "icebreak", "2026-11-06T12:01:00.000Z")).toBe(60_000);

    room = applyOp(room, { type: "retro.setPhase", phase: "brainstorm" }, HOST, "2026-11-06T12:01:00.000Z");
    expect(room.retro?.stopwatchMs.icebreak).toBe(60_000);
    expect(room.retro?.phase).toBe("brainstorm");
    expect(room.retro?.stopwatchRunningSince).toBe("2026-11-06T12:01:00.000Z");
    expect(sectionStopwatchMs(room.retro!, "icebreak", "2026-11-06T12:05:00.000Z")).toBe(60_000);
    expect(sectionStopwatchMs(room.retro!, "brainstorm", "2026-11-06T12:01:30.000Z")).toBe(30_000);

    room = applyOp(room, { type: "retro.setPhase", phase: "vote" }, HOST, "2026-11-06T12:01:30.000Z");
    expect(room.retro?.stopwatchMs.brainstorm).toBe(30_000);
    expect(room.retro?.stopwatchMs.icebreak).toBe(60_000);
    room = applyOp(room, { type: "retro.setPhase", phase: "icebreak" }, HOST, "2026-11-06T12:02:00.000Z");
    expect(sectionStopwatchMs(room.retro!, "icebreak", "2026-11-06T12:02:15.000Z")).toBe(75_000);
    expect(sectionStopwatchMs(room.retro!, "vote", "2026-11-06T12:02:15.000Z")).toBe(30_000);
  });

  it("lets only the host choose the icebreaker", () => {
    let room = retroRoom();
    room = joinRoom(room, { id: "person_alexdemo01", name: "Alex Rivera" }, NOW).room;
    expect(() => applyOp(room, { type: "retro.setIcebreaker", game: "weather" }, "person_alexdemo01", NOW)).toThrow(/host/);
    room = applyOp(room, { type: "retro.setIcebreaker", game: "this-or-that" }, HOST, NOW);
    expect(room.retro?.icebreaker).toBe("this-or-that");
    expect(() => applyOp(room, { type: "retro.nextIcebreakerRound", step: 1 }, "person_alexdemo01", NOW)).toThrow(/host/);
    room = applyOp(room, { type: "retro.nextIcebreakerRound", step: 1 }, HOST, NOW);
    expect(room.retro?.icebreakerRound).toBe(1);
  });

  it("refuses votes before the vote phase and ignores a repeated phase change", () => {
    let room = retroRoom();
    const version = room.version;
    const same = applyOp(room, { type: "retro.setPhase", phase: "icebreak" }, HOST, NOW);
    expect(same.version).toBe(version);
    expect(same).toBe(room);

    room = applyOp(room, { type: "retro.setPhase", phase: "brainstorm" }, HOST, NOW);
    room = applyOp(room, { type: "retro.addCard", columnId: "start", body: "A note", anonymous: false }, HOST, NOW);
    const cardId = room.retro?.cards[0]?.id ?? "";
    expect(() => applyOp(room, { type: "retro.vote", cardId, voting: true }, HOST, NOW)).toThrow(/vote phase/);
    room = applyOp(room, { type: "retro.setPhase", phase: "discuss" }, HOST, NOW);
    expect(() => applyOp(room, { type: "retro.vote", cardId, voting: true }, HOST, NOW)).toThrow(/vote phase/);
    expect(() => applyOp(room, { type: "retro.addAction", body: "Do the thing", sourceCardId: null }, HOST, NOW)).toThrow(/actions section/);
  });

  it("keeps note writing, discussion, voting, and actions in their own sections", () => {
    let room = retroRoom();
    expect(() => applyOp(room, { type: "retro.addCard", columnId: "start", body: "Too early", anonymous: false }, HOST, NOW)).toThrow(/notes section/);
    room = applyOp(room, { type: "retro.setPhase", phase: "brainstorm" }, HOST, NOW);
    room = applyOp(room, { type: "retro.addCard", columnId: "start", body: "A note", anonymous: false }, HOST, NOW);
    const cardId = room.retro?.cards[0]?.id ?? "";
    room = applyOp(room, { type: "retro.setPhase", phase: "discuss" }, HOST, NOW);
    expect(() => applyOp(room, { type: "retro.editCard", cardId, body: "Changed" }, HOST, NOW)).toThrow(/notes section/);
    room = applyOp(room, { type: "retro.focusCard", cardId }, HOST, NOW);
    expect(room.retro?.discussedCardId).toBe(cardId);
    room = applyOp(room, { type: "retro.setPhase", phase: "vote" }, HOST, NOW);
    expect(() => applyOp(room, { type: "retro.focusCard", cardId }, HOST, NOW)).toThrow(/discuss section/);
    room = applyOp(room, { type: "retro.vote", cardId, voting: true }, HOST, NOW);
    expect(room.retro?.cards[0]?.votes).toEqual([HOST]);
    room = applyOp(room, { type: "retro.setPhase", phase: "act" }, HOST, NOW);
    expect(() => applyOp(room, { type: "retro.vote", cardId, voting: false }, HOST, NOW)).toThrow(/vote phase/);
    room = applyOp(room, { type: "retro.addAction", body: "Follow up", sourceCardId: cardId }, HOST, NOW);
    expect(room.retro?.actions[0]?.body).toBe("Follow up");
    expect(room.retro?.actions[0]?.sourceCardId).toBe(cardId);
  });

  it("lets the host discuss by status or by author while notes stay in status columns", () => {
    let room = retroRoom();
    room = joinRoom(room, { id: "person_alexdemo01", name: "Alex Rivera" }, NOW).room;
    room = applyOp(room, { type: "retro.setPhase", phase: "brainstorm" }, HOST, NOW);
    room = applyOp(room, { type: "retro.addCard", columnId: "stop", body: "Late reviews", anonymous: false }, HOST, NOW);
    room = applyOp(
      room,
      { type: "retro.addCard", columnId: "start", body: "Ship retries", anonymous: false },
      "person_alexdemo01",
      NOW,
    );
    room = applyOp(
      room,
      { type: "retro.addCard", columnId: "continue", body: "Pairing", anonymous: true },
      "person_alexdemo01",
      NOW,
    );
    expect(() => applyOp(room, { type: "retro.setDiscussionBy", by: "author" }, HOST, NOW)).toThrow(/discuss section/);
    room = applyOp(room, { type: "retro.setPhase", phase: "discuss" }, HOST, NOW);
    expect(() => applyOp(room, { type: "retro.setDiscussionBy", by: "author" }, "person_alexdemo01", NOW)).toThrow(/host/);

    const statusView = presentRoom(room, HOST, NOW).retro;
    expect(statusView?.discussionBy).toBe("status");
    const status = discussionGroups(statusView!, room.participants);
    expect(status.map((group) => [group.key, group.label])).toEqual([
      ["start", "Start"],
      ["stop", "Stop"],
      ["continue", "Continue"],
    ]);
    expect(status[0]?.cards[0]?.body).toBe("Ship retries");

    room = applyOp(room, { type: "retro.setDiscussionBy", by: "author" }, HOST, NOW);
    expect(room.retro?.discussedGroupKey).toBeNull();
    const authors = discussionGroups(presentRoom(room, HOST, NOW).retro!, room.participants);
    expect(authors.map((group) => group.label)).toEqual(["Rifqi", "Alex Rivera", "Anonymous"]);
    expect(authors[0]?.cards.map((card) => card.columnId)).toEqual(["stop"]);
    expect(authors[1]?.cards.map((card) => card.columnId)).toEqual(["start"]);
    expect(authors[2]?.cards.map((card) => card.columnId)).toEqual(["continue"]);

    room = applyOp(room, { type: "retro.focusGroup", key: "person_alexdemo01" }, "person_alexdemo01", NOW);
    expect(room.retro?.discussedGroupKey).toBe("person_alexdemo01");
    expect(() => applyOp(room, { type: "retro.focusGroup", key: "start" }, HOST, NOW)).toThrow(/no notes/);

    const legacy = retroRoom();
    delete (legacy.retro as { discussionBy?: string }).discussionBy;
    expect(presentRoom(legacy, HOST, NOW).retro?.discussionBy).toBe("status");
  });

  it("turns each note into an action only once", () => {
    let room = retroRoom();
    room = applyOp(room, { type: "retro.setPhase", phase: "brainstorm" }, HOST, NOW);
    room = applyOp(room, { type: "retro.addCard", columnId: "start", body: "A note", anonymous: false }, HOST, NOW);
    const cardId = room.retro?.cards[0]?.id ?? "";
    room = applyOp(room, { type: "retro.setPhase", phase: "act" }, HOST, NOW);
    room = applyOp(room, { type: "retro.addAction", body: "", sourceCardId: cardId }, HOST, NOW);
    expect(room.retro?.actions).toHaveLength(1);
    expect(room.retro?.actions[0]?.body).toBe("A note");
    expect(() => applyOp(room, { type: "retro.addAction", body: "Again", sourceCardId: cardId }, HOST, NOW)).toThrow(
      /already an action/,
    );
    const actionId = room.retro?.actions[0]?.id ?? "";
    room = applyOp(room, { type: "retro.deleteAction", actionId }, HOST, NOW);
    room = applyOp(room, { type: "retro.addAction", body: "Again", sourceCardId: cardId }, HOST, NOW);
    expect(room.retro?.actions.map((action) => action.body)).toEqual(["Again"]);
  });

  it("does not mutate the previous room", () => {
    const room = retroRoom();
    room.retro!.phase = "brainstorm";
    const before = structuredClone(room);
    applyOp(room, { type: "retro.addCard", columnId: "start", body: "New", anonymous: false }, HOST, NOW);
    expect(room).toEqual(before);
  });
});

describe("sprint review", () => {
  it("tracks who checked a required item and the shared decision", () => {
    let room = createRoom(
      { code: "REVIEW", kind: "review", title: "Review", hostId: HOST, hostName: "Rifqi" },
      NOW,
    );
    room = joinRoom(room, { id: "person_samdemo001", name: "Sam Okonkwo" }, NOW).room;
    const before = checklistProgress(room.review!);
    expect(before.requiredDone).toBe(0);
    expect(before.requiredTotal).toBeGreaterThan(5);
    room = applyOp(room, { type: "review.setItemDone", itemId: "dod", done: true }, HOST, NOW);
    room = applyOp(room, { type: "review.setItemDone", itemId: "dod", done: true }, "person_samdemo001", NOW);
    expect(room.review?.sections[0]?.items.find((item) => item.id === "dod")?.doneBy).toEqual([
      HOST,
      "person_samdemo001",
    ]);
    room = applyOp(room, { type: "review.setItemDone", itemId: "dod", done: false }, HOST, NOW);
    expect(room.review?.sections[0]?.items.find((item) => item.id === "dod")?.doneBy).toEqual([
      "person_samdemo001",
    ]);
    room = applyOp(room, { type: "review.setDecision", decision: "iterate" }, HOST, NOW);
    expect(room.review?.decision).toBe("iterate");
    expect(checklistProgress(room.review!).requiredDone).toBe(1);
  });
});

describe("roadmap scoring", () => {
  const payout: Initiative = {
    id: "bet_payout0001",
    title: "Self-serve payout retry",
    outcome: "Merchants recover without support.",
    assumption: "",
    reach: 400,
    impact: 2,
    confidence: 0.8,
    effort: 2,
    iceImpact: 8,
    iceConfidence: 7,
    iceEase: 6,
    value: 8,
    complexityTechnical: 2,
    complexityDependency: 2,
    complexityUncertainty: 2,
    horizon: "now",
    ownerId: null,
  };

  it("computes RICE as reach × impact × confidence / effort", () => {
    expect(scoreInitiative(payout, "rice")).toBe(320);
    expect(formulaLine(payout, "rice")).toBe("(400 × 2 × 0.8) / 2 = 320");
    expect(scoreInitiative(payout, "ice")).toBe(336);
    expect(formatScore(1530)).toBe("1.5k");
  });

  it("ranks a demo roadmap into do-first, big-bet, fill-in, and reconsider", () => {
    const room = createRoom(
      { code: "ROAD01", kind: "roadmap", title: "Bets", hostId: HOST, hostName: "Rifqi", demo: true },
      NOW,
    );
    const ranked = scoreRoadmap(room.roadmap!);
    const byTitle = Object.fromEntries(ranked.map((item) => [item.initiative.title, item]));
    expect(byTitle["Self-serve payout retry"]?.quadrant).toBe("do-first");
    expect(byTitle["Usage-based billing"]?.quadrant).toBe("big-bet");
    expect(byTitle["Usage-based billing"]?.insight.title).toBe("Thin confidence");
    expect(byTitle["Admin theme refresh"]?.quadrant).toBe("fill-in");
    expect(byTitle["Replace the ledger database"]?.quadrant).toBe("reconsider");
    expect(ranked[0]?.rank).toBe(1);
    expect(ranked[0]?.score).toBeGreaterThan(ranked[1]?.score ?? 0);
  });

  it("rejects an impact value outside the RICE scale", () => {
    const room = createRoom(
      { code: "ROAD02", kind: "roadmap", title: "Bets", hostId: HOST, hostName: "Rifqi" },
      NOW,
    );
    const withBet = applyOp(room, { type: "roadmap.addInitiative" }, HOST, NOW);
    const id = withBet.roadmap?.initiatives[0]?.id ?? "";
    expect(() =>
      applyOp(withBet, { type: "roadmap.patchInitiative", initiativeId: id, patch: { impact: 4 as never } }, HOST, NOW),
    ).toThrow(/Impact/);
    expect(() =>
      applyOp(withBet, { type: "roadmap.patchInitiative", initiativeId: id, patch: { effort: 0.1 } }, HOST, NOW),
    ).toThrow(/Effort/);
  });
});

describe("parseOp", () => {
  it("rejects unknown updates", () => {
    expect(() => parseOp({ type: "retro.dropTable" })).toThrow(CadenceError);
    expect(parseOp({ type: "review.setDecision", decision: null })).toEqual({
      type: "review.setDecision",
      decision: null,
    });
  });
});
