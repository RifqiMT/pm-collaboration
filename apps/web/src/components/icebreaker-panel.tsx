"use client";

import {
  ICEBREAKER_GROUPS,
  ICEBREAKERS,
  icebreakerById,
  icebreakerChoices,
  icebreakerHead,
  previewMediaCandidates,
  type IcebreakerAnswer,
  type IcebreakerGame,
  type Op,
  type RoomView,
} from "@cadence/core";
import { useEffect, useRef, useState } from "react";

export function IcebreakerPanel({
  room,
  actorId,
  send,
}: {
  room: RoomView;
  actorId: string;
  send: (op: Op) => Promise<boolean>;
}) {
  const retro = room.retro;
  if (!retro) return null;
  const host = room.hostId === actorId;
  const game = icebreakerById(retro.icebreaker);
  const round = game.rounds ? retro.icebreakerRound : 0;
  const answers = retro.icebreakerAnswers
    .filter((answer) => answer.game === game.id && answer.round === round)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const mine = answers.find((answer) => answer.authorId === actorId);
  const nameOf = (id: string) => room.participants.find((person) => person.id === id)?.name ?? "Someone";
  const prompt = game.questions?.[round] ?? game.prompt;

  return (
    <section className="icebox" aria-label="Icebreaker">
      <header className="ice-hero">
        <div>
          <p className="eyebrow">Before the retro</p>
          <h2>Icebreaker</h2>
          <p>
            {host
              ? "Warm up together with one short game. Notes stay closed until you start."
              : "Join the game the host chose. Notes stay closed until the host starts."}
          </p>
        </div>
        <div className="ice-selected" aria-label="Selected game">
          <span className="eyebrow">Now playing</span>
          <strong>{game.name}</strong>
          <small>{game.blurb}</small>
        </div>
      </header>

      {host ? (
        <div className="ice-groups">
          {ICEBREAKER_GROUPS.map((group) => (
            <div key={group.id} className="ice-group">
              <p>
                {group.label}
                <span>{group.minutes}</span>
              </p>
              <div className="ice-games" role="tablist" aria-label={group.label}>
                {ICEBREAKERS.filter((item) => item.group === group.id).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={retro.icebreaker === item.id}
                    className={retro.icebreaker === item.id ? "ice-game on" : "ice-game"}
                    title={item.blurb}
                    onClick={() => void send({ type: "retro.setIcebreaker", game: item.id })}
                  >
                    <strong>{item.name}</strong>
                    <span>{item.blurb}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="ice-guest-note">Only the host can choose the icebreaker.</p>
      )}

      <div className="ice-stage">
        <div className="ice-stage-head">
          <p className="eyebrow">Your turn</p>
          <h3>{prompt}</h3>
          <p className="ice-how">{game.how}</p>
        </div>
        {game.rounds ? (
          <div className="ice-rounds">
            <button
              type="button"
              className="btn tiny"
              disabled={!host || round <= 0}
              onClick={() => void send({ type: "retro.nextIcebreakerRound", step: -1 })}
            >
              Previous
            </button>
            <span>
              Pair {round + 1} of {game.rounds.length}
            </span>
            <button
              type="button"
              className="btn tiny"
              disabled={!host || round >= game.rounds.length - 1}
              onClick={() => void send({ type: "retro.nextIcebreakerRound", step: 1 })}
            >
              Next
            </button>
          </div>
        ) : null}
        <Play game={game} round={round} answers={answers} mine={mine} actorId={actorId} nameOf={nameOf} send={send} />
      </div>

      <footer className="ice-footer">
        {host ? (
          <button
            type="button"
            className="btn primary ice-start"
            onClick={() => void send({ type: "retro.setPhase", phase: "brainstorm" })}
          >
            Start the retrospective
          </button>
        ) : (
          <p className="muted">Waiting for the host to start the retrospective.</p>
        )}
      </footer>
    </section>
  );
}

function Play({
  game,
  round,
  answers,
  mine,
  actorId,
  nameOf,
  send,
}: {
  game: IcebreakerGame;
  round: number;
  answers: IcebreakerAnswer[];
  mine: IcebreakerAnswer | undefined;
  actorId: string;
  nameOf: (id: string) => string;
  send: (op: Op) => Promise<boolean>;
}) {
  if (game.mode === "choice" || game.mode === "pairs" || game.mode === "note") {
    return <Choices game={game} round={round} answers={answers} mine={mine} nameOf={nameOf} send={send} />;
  }
  if (game.mode === "emoji") return <EmojiCheck answers={answers} mine={mine} game={game} nameOf={nameOf} send={send} />;
  if (game.mode === "gif") return <GifShare answers={answers} mine={mine} nameOf={nameOf} send={send} />;
  if (game.mode === "draw") return <DrawShare seconds={game.seconds ?? 60} answers={answers} mine={mine} nameOf={nameOf} send={send} />;
  if (game.mode === "truths") return <Truths answers={answers} mine={mine} actorId={actorId} nameOf={nameOf} send={send} />;
  return <Lines game={game} answers={answers} mine={mine} nameOf={nameOf} send={send} />;
}

function Choices({
  game,
  round,
  answers,
  mine,
  nameOf,
  send,
}: {
  game: IcebreakerGame;
  round: number;
  answers: IcebreakerAnswer[];
  mine: IcebreakerAnswer | undefined;
  nameOf: (id: string) => string;
  send: (op: Op) => Promise<boolean>;
}) {
  const choices = icebreakerChoices(game, round);
  const selected = mine ? icebreakerHead(mine.body) : { head: "", note: "" };
  const [note, setNote] = useState(selected.note);
  useEffect(() => setNote(selected.note), [selected.note, game.id]);
  const layout = game.id === "energy" ? "feelings meter" : game.mode === "pairs" ? "feelings pair" : "feelings";

  return (
    <>
      <div className={layout} role="group" aria-label={game.name}>
        {choices.map((choice) => {
          const picked = answers.filter((answer) => icebreakerHead(answer.body).head === choice);
          const chosen = selected.head === choice;
          return (
            <button
              key={choice}
              type="button"
              className={chosen ? "on" : ""}
              aria-pressed={chosen}
              onClick={() => {
                const extra = note.trim();
                const body = game.mode === "note" && extra ? `${choice} — ${extra}` : choice;
                void send({ type: "retro.answerIcebreaker", body });
              }}
            >
              <strong>{choice}</strong>
              <small>
                {picked.length} {picked.length === 1 ? "person" : "people"}
              </small>
              {picked.length > 0 ? <em>{picked.map((answer) => nameOf(answer.authorId)).join(", ")}</em> : null}
            </button>
          );
        })}
      </div>
      {game.mode === "note" ? (
        <form
          className="composer inline"
          onSubmit={(event) => {
            event.preventDefault();
            if (!selected.head) return;
            const extra = note.trim();
            void send({ type: "retro.answerIcebreaker", body: extra ? `${selected.head} — ${extra}` : selected.head });
          }}
        >
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            aria-label="Optional note"
            placeholder={game.placeholder}
            maxLength={140}
          />
          <button type="submit" className="btn tiny" disabled={!selected.head}>
            Add note
          </button>
        </form>
      ) : null}
    </>
  );
}

function Lines({
  game,
  answers,
  mine,
  nameOf,
  send,
}: {
  game: IcebreakerGame;
  answers: IcebreakerAnswer[];
  mine: IcebreakerAnswer | undefined;
  nameOf: (id: string) => string;
  send: (op: Op) => Promise<boolean>;
}) {
  const words = game.mode === "word";
  return (
    <>
      <AnswerForm
        key={`${game.id}-${mine?.body ?? ""}`}
        initial={mine?.body ?? ""}
        placeholder={game.placeholder ?? ""}
        label={words ? "Your word" : "Your answer"}
        maxLength={words ? 24 : 180}
        submitLabel={mine ? "Update" : "Share"}
        onSubmit={(body) => send({ type: "retro.answerIcebreaker", body })}
      />
      {game.id === "word-association" ? (
        <p className="chain">Sprint{answers.map((answer) => ` → ${answer.body}`).join("")}</p>
      ) : null}
      {answers.length === 0 ? <p className="muted">No one has shared yet. You can go first.</p> : null}
      {words && game.id !== "word-association" ? (
        <ul className="word-cloud">
          {answers.map((answer) => (
            <li key={answer.id} className={answer.authorId === mine?.authorId ? "mine" : ""}>
              <strong>{answer.body}</strong>
              <small>{nameOf(answer.authorId)}</small>
            </li>
          ))}
        </ul>
      ) : game.id === "word-association" ? null : (
        <ul className="shout-list">
          {answers.map((answer) => {
            const parts = game.mode === "sprint" ? icebreakerHead(answer.body) : { head: answer.body, note: "" };
            return (
              <li key={answer.id} className={answer.authorId === mine?.authorId ? "mine" : ""}>
                <p>
                  <strong>{parts.head}</strong>
                  {parts.note ? ` — ${parts.note}` : ""}
                </p>
                <SharedMedia body={answer.body} />
                <small>{nameOf(answer.authorId)}</small>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function EmojiCheck({
  answers,
  mine,
  game,
  nameOf,
  send,
}: {
  answers: IcebreakerAnswer[];
  mine: IcebreakerAnswer | undefined;
  game: IcebreakerGame;
  nameOf: (id: string) => string;
  send: (op: Op) => Promise<boolean>;
}) {
  const current = (game.choices ?? []).find((emoji) => mine?.body.startsWith(emoji)) ?? "";
  const [emoji, setEmoji] = useState(current);
  const [sentence, setSentence] = useState(mine && current ? mine.body.slice(current.length).trim() : "");
  useEffect(() => {
    setEmoji(current);
    setSentence(mine && current ? mine.body.slice(current.length).trim() : "");
  }, [current, mine?.body]);

  return (
    <>
      <div className="emoji-pick" role="group" aria-label="Emoji">
        {(game.choices ?? []).map((item) => (
          <button key={item} type="button" className={emoji === item ? "on" : ""} aria-pressed={emoji === item} onClick={() => setEmoji(item)}>
            {item}
          </button>
        ))}
      </div>
      <form
        className="composer inline"
        onSubmit={(event) => {
          event.preventDefault();
          if (!emoji || !sentence.trim()) return;
          void send({ type: "retro.answerIcebreaker", body: `${emoji} ${sentence.trim()}` });
        }}
      >
        <input value={sentence} onChange={(event) => setSentence(event.target.value)} aria-label="One sentence" placeholder={game.placeholder} maxLength={160} />
        <button type="submit" className="btn tiny primary" disabled={!emoji || sentence.trim().length === 0}>
          {mine ? "Update" : "Share"}
        </button>
      </form>
      <ul className="shout-list">
        {answers.map((answer) => (
          <li key={answer.id} className={answer.authorId === mine?.authorId ? "mine" : ""}>
            <p>{answer.body}</p>
            <SharedMedia body={answer.body} />
            <small>{nameOf(answer.authorId)}</small>
          </li>
        ))}
      </ul>
    </>
  );
}

function GifShare({
  answers,
  mine,
  nameOf,
  send,
}: {
  answers: IcebreakerAnswer[];
  mine: IcebreakerAnswer | undefined;
  nameOf: (id: string) => string;
  send: (op: Op) => Promise<boolean>;
}) {
  const saved = mine ? icebreakerHead(mine.body) : { head: "", note: "" };
  const [url, setUrl] = useState(saved.head);
  const [caption, setCaption] = useState(saved.note);
  useEffect(() => {
    setUrl(saved.head);
    setCaption(saved.note);
  }, [saved.head, saved.note]);

  return (
    <>
      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault();
          const link = url.trim();
          const note = caption.trim();
          if (!link) return;
          void send({ type: "retro.answerIcebreaker", body: note ? `${link} — ${note}` : link });
        }}
      >
        <input value={url} onChange={(event) => setUrl(event.target.value)} aria-label="GIF link" placeholder="https://" maxLength={400} />
        <input value={caption} onChange={(event) => setCaption(event.target.value)} aria-label="Caption" placeholder="A short caption" maxLength={140} />
        <button type="submit" className="btn tiny primary" disabled={url.trim().length === 0}>
          {mine ? "Update" : "Share"}
        </button>
        <MediaPreview url={url.trim()} alt={caption.trim() || "GIF preview"} />
      </form>
      <div className="gif-grid">
        {answers.map((answer) => (
          <GifCard key={answer.id} body={answer.body} name={nameOf(answer.authorId)} mine={answer.authorId === mine?.authorId} />
        ))}
      </div>
    </>
  );
}

function GifCard({ body, name, mine }: { body: string; name: string; mine: boolean }) {
  const { head, note } = icebreakerHead(body);
  return (
    <figure className={mine ? "gif-card mine" : "gif-card"}>
      <MediaPreview url={head} alt={note || "GIF of the sprint"} />
      {note ? <figcaption>{note}</figcaption> : null}
      <small>{name}</small>
    </figure>
  );
}

function SharedMedia({ body }: { body: string }) {
  const found = body.match(/https:\/\/[^\s]+/);
  if (!found?.[0] || previewMediaCandidates(found[0]).length === 0) return null;
  return <MediaPreview url={found[0]} alt="" />;
}

function MediaPreview({ url, alt }: { url: string; alt: string }) {
  const candidates = previewMediaCandidates(url);
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [url]);
  const src = candidates[index];
  if (!url || candidates.length === 0) return null;
  if (!src) return <p className="gif-link">{url}</p>;
  if (/\.(mp4|webm)(?:$|[?#])/i.test(src)) {
    return <video className="gif-preview" src={src} autoPlay loop muted playsInline aria-label={alt} />;
  }
  return <img className="gif-preview" src={src} alt={alt} onError={() => setIndex((current) => current + 1)} />;
}

function DrawShare({
  seconds,
  answers,
  mine,
  nameOf,
  send,
}: {
  seconds: number;
  answers: IcebreakerAnswer[];
  mine: IcebreakerAnswer | undefined;
  nameOf: (id: string) => string;
  send: (op: Op) => Promise<boolean>;
}) {
  return (
    <>
      <DrawPad
        key={mine?.body ?? "blank"}
        seconds={seconds}
        initial={mine?.body ?? ""}
        submitLabel={mine ? "Update drawing" : "Share drawing"}
        onSubmit={(body) => send({ type: "retro.answerIcebreaker", body })}
      />
      {answers.length > 0 ? (
        <div className="doodles">
          {answers.map((answer) => (
            <figure key={answer.id} className={answer.authorId === mine?.authorId ? "doodle-card mine" : "doodle-card"}>
              <Drawing body={answer.body} />
              <figcaption>{nameOf(answer.authorId)}</figcaption>
            </figure>
          ))}
        </div>
      ) : null}
    </>
  );
}

function Drawing({ body }: { body: string }) {
  const strokes = body.startsWith("d:") ? body.slice(2).split(";").filter(Boolean) : [];
  return (
    <svg className="doodle" viewBox="0 0 100 100" role="img" aria-label="Drawing">
      {strokes.map((stroke, index) => (
        <polyline
          key={index}
          points={stroke}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

function DrawPad({
  seconds,
  initial,
  submitLabel,
  onSubmit,
}: {
  seconds: number;
  initial: string;
  submitLabel: string;
  onSubmit: (body: string) => Promise<boolean>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<string[][]>(parseStrokes(initial));
  const activeRef = useRef<string[] | null>(null);
  const [inked, setInked] = useState(strokesRef.current.length > 0);
  const [timing, setTiming] = useState(false);
  const [left, setLeft] = useState(seconds);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const open = !timing || left > 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => paint(canvas, strokesRef.current, activeRef.current);
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [inked, timing]);

  useEffect(() => {
    if (!timing) return;
    const end = Date.now() + seconds * 1000;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) window.clearInterval(timer);
    }, 200);
    return () => window.clearInterval(timer);
  }, [timing, seconds]);

  function locate(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, Math.round(((event.clientX - rect.left) / rect.width) * 100)));
    const y = Math.min(100, Math.max(0, Math.round(((event.clientY - rect.top) / rect.height) * 100)));
    return `${x},${y}`;
  }

  return (
    <div className="draw-pad">
      <div className="ice-rounds">
        <span>{timing ? (left > 0 ? `${left}s left` : "Time") : `${seconds} seconds`}</span>
        {timing ? null : (
          <button type="button" className="btn tiny" onClick={() => setTiming(true)}>
            Start the clock
          </button>
        )}
        <button
          type="button"
          className="btn tiny ghost"
          onClick={() => {
            strokesRef.current = [];
            activeRef.current = null;
            setTiming(false);
            setLeft(seconds);
            setInked(false);
            setNotice(null);
            paint(canvasRef.current, [], null);
          }}
        >
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        aria-label="Drawing board"
        onPointerDown={(event) => {
          if (!open) return;
          if (!timing) setTiming(true);
          event.currentTarget.setPointerCapture(event.pointerId);
          activeRef.current = [locate(event)];
          paint(canvasRef.current, strokesRef.current, activeRef.current);
        }}
        onPointerMove={(event) => {
          if (!open || !activeRef.current) return;
          const next = locate(event);
          const last = activeRef.current[activeRef.current.length - 1];
          if (next !== last) activeRef.current.push(next);
          paint(canvasRef.current, strokesRef.current, activeRef.current);
        }}
        onPointerUp={() => {
          const active = activeRef.current;
          activeRef.current = null;
          if (!active || active.length === 0) return;
          if (active.length === 1) active.push(active[0]!);
          const next = [...strokesRef.current, active];
          const body = serializeStrokes(next);
          if (body.length > 6000) {
            setNotice("That drawing is too detailed. Clear it and try a simpler one.");
            return;
          }
          strokesRef.current = next;
          setInked(true);
          setNotice(null);
          paint(canvasRef.current, next, null);
        }}
      />
      {notice ? <p className="muted">{notice}</p> : null}
      <button
        type="button"
        className="btn tiny primary"
        disabled={!inked || pending}
        onClick={async () => {
          setPending(true);
          await onSubmit(serializeStrokes(strokesRef.current));
          setPending(false);
        }}
      >
        {pending ? "Sharing…" : submitLabel}
      </button>
    </div>
  );
}

function parseStrokes(body: string): string[][] {
  if (!body.startsWith("d:")) return [];
  return body
    .slice(2)
    .split(";")
    .filter(Boolean)
    .map((stroke) => stroke.split(" ").filter(Boolean));
}

function serializeStrokes(strokes: string[][]): string {
  return `d:${strokes.map((stroke) => stroke.join(" ")).join(";")}`;
}

function paint(canvas: HTMLCanvasElement | null, strokes: string[][], active: string[] | null) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(rect.width * ratio));
  canvas.height = Math.max(1, Math.round(rect.height * ratio));
  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, rect.width, rect.height);
  context.lineWidth = 2.4;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "#12141a";
  for (const stroke of active ? [...strokes, active] : strokes) {
    if (stroke.length === 0) continue;
    context.beginPath();
    stroke.forEach((point, index) => {
      const [x, y] = point.split(",").map(Number);
      const px = ((x ?? 0) / 100) * rect.width;
      const py = ((y ?? 0) / 100) * rect.height;
      if (index === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    });
    context.stroke();
  }
}

function Truths({
  answers,
  mine,
  actorId,
  nameOf,
  send,
}: {
  answers: IcebreakerAnswer[];
  mine: IcebreakerAnswer | undefined;
  actorId: string;
  nameOf: (id: string) => string;
  send: (op: Op) => Promise<boolean>;
}) {
  const saved = mine?.body.split("\n") ?? [];
  const [lines, setLines] = useState<[string, string, string]>([saved[0] ?? "", saved[1] ?? "", saved[2] ?? ""]);
  const [lie, setLie] = useState(mine?.lie ?? 2);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    setLines([saved[0] ?? "", saved[1] ?? "", saved[2] ?? ""]);
    if (mine?.lie != null) setLie(mine.lie);
  }, [mine?.body, mine?.lie]);

  const ready = lines.every((line) => line.trim().length > 0);
  const others = answers.filter((answer) => answer.authorId !== actorId);
  const labels = ["A", "B", "C"];

  return (
    <div className="truth-board">
      <form
        className="truth-compose"
        onSubmit={async (event) => {
          event.preventDefault();
          const statements = lines.map((line) => line.trim());
          if (statements.some((line) => line.length === 0) || pending) return;
          setPending(true);
          await send({ type: "retro.answerIcebreaker", body: `${statements.join("\n")}\n#${lie + 1}` });
          setPending(false);
        }}
      >
        <header className="truth-compose-head">
          <div>
            <p className="eyebrow">Your three statements</p>
            <h4>Write two truths and one lie</h4>
          </div>
          <p>Mark the false one. Other people see these in a shuffled order, so the lie is never given away by position.</p>
        </header>
        <ol className="truth-compose-list">
          {lines.map((line, index) => {
            const marked = lie === index;
            return (
              <li key={index} className={marked ? "truth-compose-item lie-on" : "truth-compose-item"}>
                <span className="truth-letter" aria-hidden="true">
                  {labels[index]}
                </span>
                <input
                  value={line}
                  maxLength={120}
                  aria-label={`Statement ${labels[index]}`}
                  placeholder={index === 0 ? "I shipped the retry flow" : index === 1 ? "I learned a new shortcut" : "I attended zero meetings"}
                  onChange={(event) =>
                    setLines((current) => {
                      const next = [...current] as [string, string, string];
                      next[index] = event.target.value;
                      return next;
                    })
                  }
                />
                <button
                  type="button"
                  className={marked ? "truth-mark on" : "truth-mark"}
                  aria-pressed={marked}
                  onClick={() => setLie(index)}
                >
                  {marked ? "The lie" : "Mark as lie"}
                </button>
              </li>
            );
          })}
        </ol>
        <div className="truth-compose-actions">
          <p className="muted">Only you can see which one is marked until you reveal it.</p>
          <button type="submit" className="btn primary" disabled={!ready || pending}>
            {pending ? "Saving…" : mine ? "Update statements" : "Share with the room"}
          </button>
        </div>
      </form>

      {mine ? (
        <article className="truth-card mine">
          <header>
            <div>
              <p className="eyebrow">Your card</p>
              <h4>You</h4>
            </div>
            <span className={mine.revealed ? "truth-status open" : "truth-status"}>
              {mine.revealed ? "Revealed" : "Hidden from the room"}
            </span>
          </header>
          <TruthChoices
            answer={mine}
            own
            actorId={actorId}
            labels={labels}
            send={send}
          />
          <footer>
            {mine.revealed ? (
              <p>{guessSummary(mine, nameOf)}</p>
            ) : (
              <button type="button" className="btn" onClick={() => void send({ type: "retro.revealIcebreaker" })}>
                Reveal the lie
              </button>
            )}
          </footer>
        </article>
      ) : null}

      <div className="truth-room">
        <header className="truth-room-head">
          <p className="eyebrow">The room</p>
          <h4>{others.length === 0 ? "Waiting for others" : "Guess the lie"}</h4>
          <p>
            {others.length === 0
              ? "When someone else shares, their three statements land here in a private order."
              : "Each card is shuffled for you. Tap the one you think is false."}
          </p>
        </header>
        {others.length === 0 ? null : (
          <div className="truths">
            {others.map((answer) => {
              const guess = answer.guesses?.find((item) => item.authorId === actorId);
              return (
                <article key={answer.id} className="truth-card">
                  <header>
                    <div>
                      <p className="eyebrow">Shared by</p>
                      <h4>{nameOf(answer.authorId)}</h4>
                    </div>
                    <span className={answer.revealed ? "truth-status open" : "truth-status"}>
                      {answer.revealed ? "Revealed" : guess ? "Guess locked in" : "Your turn"}
                    </span>
                  </header>
                  <TruthChoices answer={answer} own={false} actorId={actorId} labels={labels} send={send} />
                  <footer>
                    <p>{answer.revealed ? guessSummary(answer, nameOf) : guess ? "You can change your guess until they reveal." : "Pick one statement."}</p>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TruthChoices({
  answer,
  own,
  actorId,
  labels,
  send,
}: {
  answer: IcebreakerAnswer;
  own: boolean;
  actorId: string;
  labels: string[];
  send: (op: Op) => Promise<boolean>;
}) {
  const statements = answer.body.split("\n");
  const order = answer.displayOrder?.length === 3 ? answer.displayOrder : [0, 1, 2];
  const guess = answer.guesses?.find((item) => item.authorId === actorId);
  return (
    <div className="truth-choices" role="group" aria-label="Statements">
      {order.map((index, position) => {
        const statement = statements[index] ?? "";
        const revealedLie = Boolean(answer.revealed && answer.lie === index);
        const privateLie = Boolean(own && !answer.revealed && answer.lie === index);
        const picked = guess?.index === index;
        const className = [
          "truth-choice",
          revealedLie ? "lie" : "",
          privateLie ? "private-lie" : "",
          picked && !answer.revealed ? "on" : "",
        ]
          .filter(Boolean)
          .join(" ");

        if (own || answer.revealed) {
          return (
            <div key={index} className={className}>
              <span className="truth-letter">{labels[position]}</span>
              <p>{statement}</p>
              {privateLie ? <em>Only you see this mark</em> : null}
              {revealedLie ? <em>The lie</em> : null}
            </div>
          );
        }

        return (
          <button
            key={index}
            type="button"
            className={className}
            aria-pressed={picked}
            onClick={() => void send({ type: "retro.guessIcebreaker", targetId: answer.id, index })}
          >
            <span className="truth-letter">{labels[position]}</span>
            <span className="truth-choice-body">{statement}</span>
            <span className="truth-choice-hint">{picked ? "Your guess" : "Tap if this is the lie"}</span>
          </button>
        );
      })}
    </div>
  );
}

function guessSummary(answer: IcebreakerAnswer, nameOf: (id: string) => string) {
  const guesses = answer.guesses ?? [];
  if (guesses.length === 0) return "No guesses yet.";
  const right = guesses.filter((guess) => guess.index === answer.lie);
  if (right.length === 0) return "Nobody spotted the lie.";
  return `${right.map((guess) => nameOf(guess.authorId)).join(", ")} spotted the lie.`;
}

function AnswerForm({
  initial,
  placeholder,
  label,
  maxLength,
  submitLabel,
  onSubmit,
}: {
  initial: string;
  placeholder: string;
  label: string;
  maxLength: number;
  submitLabel: string;
  onSubmit: (body: string) => Promise<boolean>;
}) {
  const [text, setText] = useState(initial);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setText(initial);
  }, [initial]);

  return (
    <form
      className="composer inline"
      onSubmit={async (event) => {
        event.preventDefault();
        const body = text.trim();
        if (!body || pending) return;
        setPending(true);
        await onSubmit(body);
        setPending(false);
      }}
    >
      <input value={text} onChange={(event) => setText(event.target.value)} aria-label={label} placeholder={placeholder} maxLength={maxLength} />
      <button type="submit" className="btn tiny primary" disabled={pending || text.trim().length === 0}>
        {pending ? "Sharing…" : submitLabel}
      </button>
    </form>
  );
}
