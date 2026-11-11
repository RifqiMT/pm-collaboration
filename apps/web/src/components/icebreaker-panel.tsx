"use client";

import {
  ICEBREAKER_GROUPS,
  ICEBREAKERS,
  icebreakerById,
  icebreakerChoices,
  icebreakerHead,
  previewMediaCandidates,
  pairQuestion,
  resolvedThisOrThatPairs,
  thisOrThatGame,
  type IcebreakerAnswer,
  type IcebreakerGame,
  type IcebreakerPair,
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
  const game = retro.icebreaker === "this-or-that" ? thisOrThatGame(retro.icebreakerPairs) : icebreakerById(retro.icebreaker);
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
        {game.id === "this-or-that" ? (
          <ThisOrThat
            game={game}
            answers={retro.icebreakerAnswers.filter((answer) => answer.game === "this-or-that")}
            actorId={actorId}
            nameOf={nameOf}
            send={send}
            host={host}
            pairs={resolvedThisOrThatPairs(retro.icebreakerPairs)}
          />
        ) : (
          <>
            <div className="ice-stage-head">
              <p className="eyebrow">Your turn</p>
              <h3>{prompt}</h3>
              <p className="ice-how">{game.how}</p>
            </div>
            <Play
              game={game}
              round={round}
              answers={answers}
              mine={mine}
              actorId={actorId}
              nameOf={nameOf}
              send={send}
              participantIds={room.participants.map((person) => person.id)}
            />
          </>
        )}
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

function openingPair(total: number, answered: number[]): number {
  const have = new Set(answered);
  for (let index = 0; index < total; index += 1) {
    if (!have.has(index)) return index;
  }
  return total;
}

function ThisOrThat({
  game,
  answers,
  actorId,
  nameOf,
  send,
  host,
  pairs,
}: {
  game: IcebreakerGame;
  answers: IcebreakerAnswer[];
  actorId: string;
  nameOf: (id: string) => string;
  send: (op: Op) => Promise<boolean>;
  host: boolean;
  pairs: IcebreakerPair[];
}) {
  const rounds = game.rounds ?? [];
  const total = rounds.length;
  const mine = answers.filter((answer) => answer.authorId === actorId);
  const [step, setStep] = useState(() => openingPair(total, mine.map((answer) => answer.round)));
  useEffect(() => {
    setStep((current) => Math.min(current, total));
  }, [total]);

  const complete = openingPair(total, mine.map((answer) => answer.round)) >= total;
  const showingResults = step >= total;
  const prompt = showingResults ? "How the room answered" : (game.questions?.[step] ?? game.prompt);
  const mineHere = mine.find((answer) => answer.round === step);
  const [openPairs, setOpenPairs] = useState<number[]>([]);

  async function choose(choice: string) {
    await send({ type: "retro.answerIcebreaker", body: choice, round: step });
  }

  function togglePair(index: number) {
    setOpenPairs((current) => (current.includes(index) ? current.filter((item) => item !== index) : [...current, index]));
  }

  const answeredCount = mine.length;
  const progressPct = total === 0 ? 0 : Math.round((Math.min(answeredCount, total) / total) * 100);
  const sides = rounds[step] ?? [];
  const allOpen = total > 0 && openPairs.length === total;

  return (
    <>
      <div className="ice-stage-head">
        <p className="eyebrow">{showingResults ? "Results" : "Your turn"}</p>
        <h3>{prompt}</h3>
        <p className="ice-how">
          {showingResults ? "Your pick is highlighted. Expand a pair for the full split." : game.how}
        </p>
      </div>
      {showingResults ? (
        <div className="pair-results">
          <div className="pair-results-toolbar">
            <p>
              {answers.length} {answers.length === 1 ? "answer" : "answers"} across {total}{" "}
              {total === 1 ? "pair" : "pairs"}
            </p>
            <button
              type="button"
              className="btn ghost tiny"
              onClick={() => setOpenPairs(allOpen ? [] : rounds.map((_, index) => index))}
            >
              {allOpen ? "Collapse all" : "Expand all"}
            </button>
          </div>
          <div className="pair-accordion">
            {rounds.map((roundSides, index) => {
              const roundAnswers = answers.filter((answer) => answer.round === index);
              const own = mine.find((answer) => answer.round === index);
              const ownHead = own ? icebreakerHead(own.body).head : "";
              const open = openPairs.includes(index);
              const panelId = `pair-result-${index}`;
              const tallies = roundSides.map((side) => ({
                side,
                people: roundAnswers.filter((answer) => icebreakerHead(answer.body).head === side),
              }));
              const countedVotes = tallies.reduce((sum, item) => sum + item.people.length, 0);
              const totalVotes = Math.max(countedVotes, 1);
              const lead = Math.max(0, ...tallies.map((item) => item.people.length));
              const tied = countedVotes > 0 && tallies.every((item) => item.people.length === lead);
              const winner = !tied && countedVotes > 0 ? tallies.find((item) => item.people.length === lead)?.side : null;
              const leftShare = countedVotes === 0 ? 50 : Math.round(((tallies[0]?.people.length ?? 0) / totalVotes) * 100);
              const rightShare = countedVotes === 0 ? 50 : 100 - leftShare;

              const ownSideIndex = tallies.findIndex((item) => item.side === ownHead);
              const ownTone = ownSideIndex === 0 ? "a" : ownSideIndex === 1 ? "b" : "";

              return (
                <article className={`pair-result${open ? " open" : ""}`} key={index}>
                  <button
                    type="button"
                    className="pair-result-summary"
                    aria-expanded={open}
                    aria-controls={panelId}
                    aria-label={`${game.questions?.[index] ?? `Pair ${index + 1}`}${ownHead ? `, your pick ${ownHead}` : ""}`}
                    onClick={() => togglePair(index)}
                  >
                    <span className="pair-result-index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="pair-result-main">
                      <strong className="pair-result-title">{game.questions?.[index] ?? `Pair ${index + 1}`}</strong>
                      <span className="pair-result-meta">
                        {tallies.map((item, sideIndex) => (
                          <em key={item.side}>
                            <span>{sideIndex === 0 ? "A" : "B"}</span>
                            {item.people.length}
                          </em>
                        ))}
                        {winner ? <small>{winner} leads</small> : tied ? <small>Tied</small> : null}
                      </span>
                    </span>
                    {ownHead && ownTone ? (
                      <span className={`pair-pick tone-${ownTone}`}>
                        <span className="pair-pick-mark" aria-hidden="true">
                          {ownTone.toUpperCase()}
                        </span>
                        <span className="pair-pick-label">{ownHead}</span>
                      </span>
                    ) : (
                      <span className="pair-result-muted">No pick</span>
                    )}
                    <span className="pair-chevron" aria-hidden="true">
                      {open ? "▴" : "▾"}
                    </span>
                  </button>
                  {open ? (
                    <div className="pair-result-panel" id={panelId}>
                      <div className="pair-result-track" aria-hidden="true">
                        <i className={ownSideIndex === 0 ? "tone-a" : ""} style={{ width: `${leftShare}%` }} />
                        <b className={ownSideIndex === 1 ? "tone-b" : ""} style={{ width: `${rightShare}%` }} />
                      </div>
                      <div className="pair-choice-row">
                        {tallies.map((item, sideIndex) => {
                          const mineSide = ownHead === item.side;
                          const tone = sideIndex === 0 ? "a" : "b";
                          const share = Math.round((item.people.length / totalVotes) * 100);
                          return (
                            <div
                              key={item.side}
                              className={`pair-choice-chip${mineSide ? ` on tone-${tone}` : ""}${item.people.length === 0 ? " vacant" : ""}`}
                            >
                              <span className="pair-choice-mark" aria-hidden="true">
                                {mineSide ? "✓" : tone.toUpperCase()}
                              </span>
                              <span className="pair-choice-copy">
                                <strong>{item.side}</strong>
                                <small>
                                  {item.people.length} {item.people.length === 1 ? "person" : "people"}
                                  {mineSide ? " · you" : ""}
                                </small>
                              </span>
                              <em>{share}%</em>
                              {item.people.length > 0 ? (
                                <ul className="pair-people">
                                  {item.people.map((answer) => (
                                    <li key={answer.authorId}>
                                      <span className="pair-chip-mark" aria-hidden="true">
                                        {initials(nameOf(answer.authorId))}
                                      </span>
                                      {nameOf(answer.authorId)}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="pair-empty">No one yet</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
          <button type="button" className="btn ghost" onClick={() => setStep(0)}>
            Change my answers
          </button>
        </div>
      ) : (
        <div className="pair-play">
          <div className="pair-progress" aria-label={`Pair ${step + 1} of ${total}`}>
            <div className="pair-progress-copy">
              <span>
                Pair {step + 1} of {total}
              </span>
              <strong>{answeredCount}/{total} answered</strong>
            </div>
            <div className="pair-progress-bar" aria-hidden="true">
              <i style={{ width: `${progressPct}%` }} />
            </div>
            <div className="pair-progress-dots" role="tablist" aria-label="Pairs">
              {rounds.map((_, index) => {
                const done = mine.some((answer) => answer.round === index);
                return (
                  <button
                    key={index}
                    type="button"
                    className={`pair-dot${done ? " done" : ""}${index === step ? " current" : ""}`}
                    aria-label={`Pair ${index + 1}${done ? ", answered" : ""}`}
                    aria-current={index === step ? "step" : undefined}
                    onClick={() => setStep(index)}
                  />
                );
              })}
            </div>
          </div>

          <div className="pair-vote" role="group" aria-label={prompt}>
            {sides.map((choice, index) => {
              const chosen = mineHere ? icebreakerHead(mineHere.body).head === choice : false;
              const live = answers.filter((answer) => answer.round === step && icebreakerHead(answer.body).head === choice);
              const tone = index === 0 ? "a" : "b";
              return (
                <button
                  key={choice}
                  type="button"
                  className={`pair-option${chosen ? ` on tone-${tone}` : ""}`}
                  aria-pressed={chosen}
                  onClick={() => void choose(choice)}
                >
                  <span className="pair-option-mark" aria-hidden="true">
                    {chosen ? "✓" : tone.toUpperCase()}
                  </span>
                  <span className="pair-option-copy">
                    <strong>{choice}</strong>
                    <small>
                      {chosen
                        ? "Your pick"
                        : live.length > 0
                          ? `${live.length} ${live.length === 1 ? "person" : "people"} so far`
                          : "Choose this side"}
                    </small>
                    {live.length > 0 ? (
                      <span className="pair-live">
                        {live.slice(0, 4).map((answer) => (
                          <span key={answer.authorId} className="pair-chip-mark" title={nameOf(answer.authorId)}>
                            {initials(nameOf(answer.authorId))}
                          </span>
                        ))}
                        {live.length > 4 ? <em>+{live.length - 4}</em> : null}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
            {sides.length === 2 ? (
              <span className="pair-or" aria-hidden="true">
                or
              </span>
            ) : null}
          </div>

          <div className="ice-rounds">
            <button type="button" className="btn ghost tiny" disabled={step <= 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>
              Previous
            </button>
            <button
              type="button"
              className="btn tiny primary"
              disabled={!mineHere || (step >= total - 1 && !complete)}
              onClick={() => setStep((current) => (current >= total - 1 ? total : current + 1))}
            >
              {step >= total - 1 ? "See results" : "Next pair"}
            </button>
          </div>
        </div>
      )}
      {host ? <PairEditor pairs={pairs} send={send} /> : null}
    </>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function PairEditor({ pairs, send }: { pairs: IcebreakerPair[]; send: (op: Op) => Promise<boolean> }) {
  const [draft, setDraft] = useState(pairs);
  const [note, setNote] = useState<string | null>(null);
  const saved = JSON.stringify(pairs);
  useEffect(() => {
    setDraft(JSON.parse(saved) as IcebreakerPair[]);
  }, [saved]);

  function update(index: number, field: keyof IcebreakerPair, value: string) {
    setDraft((current) => current.map((pair, item) => (item === index ? { ...pair, [field]: value } : pair)));
    setNote(null);
  }

  async function save() {
    for (const pair of draft) {
      if (!pair.left.trim() || !pair.right.trim()) {
        setNote("Each pair needs two sides.");
        return;
      }
      if (pair.left.trim().toLowerCase() === pair.right.trim().toLowerCase()) {
        setNote("The two sides need different names.");
        return;
      }
    }
    await send({
      type: "retro.setIcebreakerPairs",
      pairs: draft.map((pair) => ({ ...pair, question: pairQuestion(pair.left, pair.right) })),
    });
  }

  const dirty = JSON.stringify(draft) !== saved;

  return (
    <div className="pair-editor">
      <div className="pair-editor-head">
        <h4>Customize the pairs</h4>
        <p>Name the two sides. The question is written from them.</p>
      </div>
      {draft.map((pair, index) => {
        const question = pairQuestion(pair.left, pair.right);
        return (
        <div className="pair-row" key={index}>
          <p className={question ? "pair-question" : "pair-question pending"}>{question || "The question appears when both sides have names."}</p>
          <label>
            <span>Side A</span>
            <input
              value={pair.left}
              maxLength={40}
              aria-label={`Side A ${index + 1}`}
              onChange={(event) => update(index, "left", event.target.value)}
            />
          </label>
          <label>
            <span>Side B</span>
            <input
              value={pair.right}
              maxLength={40}
              aria-label={`Side B ${index + 1}`}
              onChange={(event) => update(index, "right", event.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn tiny"
            disabled={draft.length <= 1}
            onClick={() => {
              setNote(null);
              setDraft((current) => current.filter((_, item) => item !== index));
            }}
          >
            Remove
          </button>
        </div>
        );
      })}
      <div className="pair-editor-actions">
        <button
          type="button"
          className="btn tiny"
          disabled={draft.length >= 8}
          onClick={() => {
            setNote(null);
            setDraft((current) => [...current, { question: "", left: "", right: "" }]);
          }}
        >
          Add a pair
        </button>
        <button type="button" className="btn tiny primary" disabled={!dirty} onClick={() => void save()}>
          Save pairs
        </button>
      </div>
      {note ? (
        <p className="pair-note" role="status">
          {note}
        </p>
      ) : null}
    </div>
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
  participantIds,
}: {
  game: IcebreakerGame;
  round: number;
  answers: IcebreakerAnswer[];
  mine: IcebreakerAnswer | undefined;
  actorId: string;
  nameOf: (id: string) => string;
  send: (op: Op) => Promise<boolean>;
  participantIds: string[];
}) {
  if (game.mode === "choice" || game.mode === "pairs" || game.mode === "note") {
    return <Choices game={game} round={round} answers={answers} mine={mine} nameOf={nameOf} send={send} />;
  }
  if (game.mode === "emoji") return <EmojiCheck answers={answers} mine={mine} game={game} nameOf={nameOf} send={send} />;
  if (game.mode === "gif") return <GifShare answers={answers} mine={mine} nameOf={nameOf} send={send} />;
  if (game.mode === "draw") return <DrawShare seconds={game.seconds ?? 60} answers={answers} mine={mine} nameOf={nameOf} send={send} />;
  if (game.mode === "truths") {
    return (
      <Truths
        answers={answers}
        mine={mine}
        actorId={actorId}
        nameOf={nameOf}
        send={send}
        participantIds={participantIds}
      />
    );
  }
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
  const layout =
    game.id === "energy" ? "feelings meter" : game.mode === "pairs" ? "pair-vote" : "feelings";

  return (
    <>
      <div className={layout} role="group" aria-label={game.name}>
        {choices.map((choice, index) => {
          const picked = answers.filter((answer) => icebreakerHead(answer.body).head === choice);
          const chosen = selected.head === choice;
          const pairMode = game.mode === "pairs";
          return (
            <button
              key={choice}
              type="button"
              className={`${pairMode ? "pair-option" : ""}${chosen ? " on" : ""}`}
              aria-pressed={chosen}
              onClick={() => {
                const extra = note.trim();
                const body = game.mode === "note" && extra ? `${choice} — ${extra}` : choice;
                void send({ type: "retro.answerIcebreaker", body });
              }}
            >
              {pairMode ? (
                <span className="pair-option-mark" aria-hidden="true">
                  {chosen ? "✓" : index === 0 ? "A" : "B"}
                </span>
              ) : null}
              <span className={pairMode ? "pair-option-copy" : undefined}>
                <strong>{choice}</strong>
                <small>
                  {picked.length} {picked.length === 1 ? "person" : "people"}
                </small>
                {picked.length > 0 && !pairMode ? <em>{picked.map((answer) => nameOf(answer.authorId)).join(", ")}</em> : null}
                {pairMode && picked.length > 0 ? (
                  <span className="pair-live">
                    {picked.slice(0, 4).map((answer) => (
                      <span key={answer.authorId} className="pair-chip-mark" title={nameOf(answer.authorId)}>
                        {initials(nameOf(answer.authorId))}
                      </span>
                    ))}
                    {picked.length > 4 ? <em>+{picked.length - 4}</em> : null}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
        {game.mode === "pairs" && choices.length === 2 ? (
          <span className="pair-or" aria-hidden="true">
            or
          </span>
        ) : null}
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
  participantIds,
}: {
  answers: IcebreakerAnswer[];
  mine: IcebreakerAnswer | undefined;
  actorId: string;
  nameOf: (id: string) => string;
  send: (op: Op) => Promise<boolean>;
  participantIds: string[];
}) {
  const saved = truthStatements(mine?.body ?? "");
  const [lines, setLines] = useState<[string, string, string]>([saved[0] ?? "", saved[1] ?? "", saved[2] ?? ""]);
  const [lie, setLie] = useState(mine?.lie ?? 2);
  const [pending, setPending] = useState(false);
  const [editing, setEditing] = useState(!mine);
  useEffect(() => {
    const next = truthStatements(mine?.body ?? "");
    setLines([next[0] ?? "", next[1] ?? "", next[2] ?? ""]);
    if (mine?.lie != null) setLie(mine.lie);
    setEditing(!mine);
  }, [mine?.body, mine?.lie, mine?.id]);

  const ready = lines.every((line) => line.trim().length > 0);
  const others = answers.filter((answer) => answer.authorId !== actorId);
  const labels = ["A", "B", "C"];
  const mineProgress = mine ? guessProgress(mine, participantIds) : null;

  async function saveStatements() {
    const statements = lines.map((line) => line.trim());
    if (statements.some((line) => line.length === 0) || pending) return;
    setPending(true);
    const ok = await send({ type: "retro.answerIcebreaker", body: `${statements.join("\n")}\n#${lie + 1}` });
    setPending(false);
    if (ok) setEditing(false);
  }

  return (
    <div className="truth-board">
      {editing || !mine ? (
        <form
          className="truth-compose"
          onSubmit={(event) => {
            event.preventDefault();
            void saveStatements();
          }}
        >
          <header className="truth-compose-head">
            <div>
              <p className="eyebrow">Your turn</p>
              <h4>Two truths and one lie</h4>
            </div>
            <p>Write three statements, mark the lie, then share. Everyone else sees them shuffled.</p>
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
                    placeholder={
                      index === 0 ? "I shipped the retry flow" : index === 1 ? "I learned a new shortcut" : "I attended zero meetings"
                    }
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
                    {marked ? "Lie" : "Mark lie"}
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="truth-compose-actions">
            <p className="muted">Only you see the lie mark until everyone has guessed — or you reveal early.</p>
            <div className="truth-compose-btns">
              {mine ? (
                <button type="button" className="btn ghost tiny" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              ) : null}
              <button type="submit" className="btn primary" disabled={!ready || pending}>
                {pending ? "Saving…" : mine ? "Save changes" : "Share with the room"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <article className={`truth-card mine${mine.revealed ? " revealed" : ""}`}>
          <header>
            <div>
              <p className="eyebrow">Your card</p>
              <h4>{mine.revealed ? "Results" : "Waiting on guesses"}</h4>
            </div>
            <div className="truth-card-tools">
              <span className={mine.revealed ? "truth-status open" : "truth-status"}>
                {mine.revealed ? "Revealed" : "Hidden"}
              </span>
              {!mine.revealed ? (
                <button type="button" className="btn ghost tiny" onClick={() => setEditing(true)}>
                  Edit
                </button>
              ) : null}
            </div>
          </header>
          {mineProgress && mineProgress.total > 0 ? (
            <div className="truth-progress" aria-label={`${mineProgress.done} of ${mineProgress.total} guessed`}>
              <div className="truth-progress-copy">
                <span>
                  {mineProgress.done}/{mineProgress.total} guessed
                </span>
                <strong>
                  {mine.revealed
                    ? "Everyone’s picks are in"
                    : mineProgress.done >= mineProgress.total
                      ? "Revealing…"
                      : "Auto-reveals when everyone guesses"}
                </strong>
              </div>
              <div className="truth-progress-bar" aria-hidden="true">
                <i style={{ width: `${Math.round((mineProgress.done / mineProgress.total) * 100)}%` }} />
              </div>
            </div>
          ) : null}
          <TruthChoices answer={mine} own actorId={actorId} labels={labels} nameOf={nameOf} send={send} showGuesses />
          <footer>
            {mine.revealed ? (
              <p>{guessSummary(mine, nameOf)}</p>
            ) : (
              <>
                <p>Or reveal early once you’re ready.</p>
                <button type="button" className="btn tiny primary" onClick={() => void send({ type: "retro.revealIcebreaker" })}>
                  Reveal the lie
                </button>
              </>
            )}
          </footer>
        </article>
      )}

      <section className="truth-room" aria-label="Room guesses">
        <header className="truth-room-head">
          <div>
            <p className="eyebrow">The room</p>
            <h4>{others.length === 0 ? "Waiting for others" : "Guess the lie"}</h4>
          </div>
          <p>
            {others.length === 0
              ? "When someone shares, their statements appear here shuffled for you."
              : "Tap the false one. Everyone’s picks appear when all guests have guessed."}
          </p>
        </header>
        {others.length === 0 ? (
          <div className="truth-empty">
            <strong>No other cards yet</strong>
            <span>Invite the room to share three statements.</span>
          </div>
        ) : (
          <div className="truths">
            {others.map((answer) => {
              const guess = answer.guesses?.find((item) => item.authorId === actorId);
              return (
                <article key={answer.id} className={`truth-card${answer.revealed ? " revealed" : ""}`}>
                  <header>
                    <div>
                      <p className="eyebrow">Shared by</p>
                      <h4>{nameOf(answer.authorId)}</h4>
                    </div>
                    <span className={answer.revealed ? "truth-status open" : guess ? "truth-status locked" : "truth-status turn"}>
                      {answer.revealed ? "Revealed" : guess ? "Guessed" : "Your turn"}
                    </span>
                  </header>
                  <TruthChoices
                    answer={answer}
                    own={false}
                    actorId={actorId}
                    labels={labels}
                    nameOf={nameOf}
                    send={send}
                    showGuesses={Boolean(answer.revealed)}
                  />
                  <footer>
                    <p>
                      {answer.revealed
                        ? guessSummary(answer, nameOf)
                        : guess
                          ? "You can change your guess until everyone has guessed."
                          : "Pick one statement."}
                    </p>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function TruthChoices({
  answer,
  own,
  actorId,
  labels,
  nameOf,
  send,
  showGuesses,
}: {
  answer: IcebreakerAnswer;
  own: boolean;
  actorId: string;
  labels: string[];
  nameOf: (id: string) => string;
  send: (op: Op) => Promise<boolean>;
  showGuesses: boolean;
}) {
  const statements = truthStatements(answer.body);
  const order = answer.displayOrder?.length === 3 ? answer.displayOrder : [0, 1, 2];
  const guess = answer.guesses?.find((item) => item.authorId === actorId);
  const guesses = answer.guesses ?? [];
  return (
    <div className="truth-choices" role="group" aria-label="Statements">
      {order.map((index, position) => {
        const statement = statements[index] ?? "";
        const revealedLie = Boolean(answer.revealed && answer.lie === index);
        const privateLie = Boolean(own && !answer.revealed && answer.lie === index);
        const picked = guess?.index === index;
        const voters = guesses.filter((item) => item.index === index);
        const className = [
          "truth-choice",
          revealedLie ? "lie" : "",
          privateLie ? "private-lie" : "",
          picked && !answer.revealed ? "on" : "",
          answer.revealed && picked && answer.lie === index ? "correct" : "",
          answer.revealed && picked && answer.lie !== index ? "miss" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const body = (
          <>
            <span className="truth-choice-top">
              <span className="truth-letter">{labels[position]}</span>
              {privateLie ? <em>Your lie</em> : null}
              {revealedLie ? <em>The lie</em> : null}
              {!answer.revealed && !own ? (
                <span className="truth-choice-hint">{picked ? "Your guess" : "Tap to guess"}</span>
              ) : null}
              {answer.revealed && picked ? <span className="truth-choice-hint">{answer.lie === index ? "You got it" : "Your guess"}</span> : null}
            </span>
            <span className="truth-choice-body">{statement}</span>
            {showGuesses ? (
              voters.length > 0 ? (
                <ul className="truth-guessers">
                  {voters.map((item) => (
                    <li key={item.authorId} className={item.index === answer.lie ? "hit" : undefined}>
                      <span className="pair-chip-mark" aria-hidden="true">
                        {initials(nameOf(item.authorId))}
                      </span>
                      {nameOf(item.authorId)}
                    </li>
                  ))}
                </ul>
              ) : answer.revealed ? (
                <p className="truth-empty-guess">No guesses here</p>
              ) : null
            ) : null}
          </>
        );

        if (own || answer.revealed) {
          return (
            <div key={index} className={className}>
              {body}
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
            {body}
          </button>
        );
      })}
    </div>
  );
}

function truthStatements(body: string) {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !/^#\d+$/.test(line));
}

function guessProgress(answer: IcebreakerAnswer, participantIds: string[]) {
  const eligible = participantIds.filter((id) => id !== answer.authorId);
  const guesses = answer.guesses ?? [];
  const done = eligible.filter((id) => guesses.some((guess) => guess.authorId === id)).length;
  return { done, total: eligible.length };
}

function guessSummary(answer: IcebreakerAnswer, nameOf: (id: string) => string) {
  const guesses = answer.guesses ?? [];
  if (guesses.length === 0) return "No guesses yet.";
  const right = guesses.filter((guess) => guess.index === answer.lie);
  if (right.length === 0) return "Nobody spotted the lie.";
  if (right.length === guesses.length) return "Everyone spotted the lie.";
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
