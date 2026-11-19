"use client";

import {
  ICEBREAKER_GROUPS,
  ICEBREAKERS,
  icebreakerById,
  icebreakerChoices,
  icebreakerHead,
  acceptedShowMedia,
  formatShowAndTell,
  HEALTH_CHECK,
  formatHealthAverage,
  healthCategoryAverage,
  healthOverallAverage,
  healthPointLabel,
  parseHealthScores,
  previewMediaCandidates,
  showAndTellMediaSources,
  showAndTellParts,
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
import dynamic from "next/dynamic";

const TravelMap = dynamic(() => import("./travel-map").then((mod) => mod.TravelMap), {
  loading: () => <p className="muted">Loading the map…</p>,
});

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

  const group = ICEBREAKER_GROUPS.find((item) => item.id === game.group);

  return (
    <section className="icebox" aria-label="Icebreaker">
      <header className="ice-hero">
        <div className="ice-hero-copy">
          <p className="eyebrow">Before the retro</p>
          <h2>Icebreaker</h2>
          <p>
            {host
              ? "Warm up together with one short game. Notes stay closed until you start."
              : "Join the game the host chose. Notes stay closed until the host starts."}
          </p>
        </div>
        {host ? (
          <IcebreakerPicker
            selectedId={retro.icebreaker}
            selected={game}
            groupLabel={group?.label}
            groupMinutes={group?.minutes}
            onSelect={(next) => void send({ type: "retro.setIcebreaker", game: next })}
          />
        ) : (
          <div className="ice-selected" aria-label="Selected game">
            <span className="eyebrow">Now playing</span>
            <strong>{game.name}</strong>
            <small>{game.blurb}</small>
            {group ? <em>{group.label} · {group.minutes}</em> : null}
          </div>
        )}
      </header>

      {host ? null : <p className="ice-guest-note">Only the host can choose the icebreaker.</p>}

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

function IcebreakerPicker({
  selectedId,
  selected,
  groupLabel,
  groupMinutes,
  onSelect,
}: {
  selectedId: string;
  selected: IcebreakerGame;
  groupLabel?: string;
  groupMinutes?: string;
  onSelect: (game: IcebreakerGame["id"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listId = "icebreaker-picker-list";

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`ice-picker${open ? " open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="ice-picker-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="ice-picker-copy">
          <span className="eyebrow">Choose a game</span>
          <strong>{selected.name}</strong>
          <small>{selected.blurb}</small>
          {groupLabel && groupMinutes ? (
            <em>
              {groupLabel} · {groupMinutes}
            </em>
          ) : null}
        </span>
        <span className="ice-picker-caret" aria-hidden="true" />
      </button>

      {open ? (
        <div className="ice-picker-menu" id={listId} role="listbox" aria-label="Icebreaker games">
          {ICEBREAKER_GROUPS.map((group) => {
            const games = ICEBREAKERS.filter((item) => item.group === group.id);
            return (
              <div key={group.id} className="ice-picker-group" role="group" aria-label={group.label}>
                <div className="ice-picker-group-head">
                  <span>{group.label}</span>
                  <em>{group.minutes}</em>
                </div>
                <ul>
                  {games.map((item) => {
                    const active = item.id === selectedId;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          className={active ? "on" : ""}
                          onClick={() => {
                            onSelect(item.id);
                            setOpen(false);
                          }}
                        >
                          <span className="ice-picker-option-copy">
                            <strong>{item.name}</strong>
                            <span>{item.blurb}</span>
                          </span>
                          {active ? <span className="ice-picker-check" aria-hidden="true">✓</span> : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
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
  if (game.id === "show-and-tell") return <ShowAndTell answers={answers} mine={mine} nameOf={nameOf} send={send} />;
  if (game.mode === "scale") return <HealthCheck answers={answers} mine={mine} send={send} />;
  if (game.mode === "map") {
    return (
      <TravelMap
        answers={answers}
        mine={mine}
        nameOf={nameOf}
        send={send}
        participantIds={participantIds}
      />
    );
  }
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

  if (game.id === "energy") {
    return (
      <EnergyMeter
        choices={choices}
        answers={answers}
        selected={selected}
        note={note}
        placeholder={game.placeholder ?? "A short note, if you want one"}
        nameOf={nameOf}
        onNoteChange={setNote}
        onPick={(choice, extra) => {
          const body = extra ? `${choice} — ${extra}` : choice;
          void send({ type: "retro.answerIcebreaker", body });
        }}
      />
    );
  }

  const layout = game.mode === "pairs" ? "pair-vote" : "feelings";

  return (
    <>
      <div className={layout} role="group" aria-label={game.name}>
        {choices.map((choice, index) => {
          const picked = answers.filter((answer) => icebreakerHead(answer.body).head === choice);
          const chosen = selected.head === choice;
          const pairMode = game.mode === "pairs";
          const countLabel = `${picked.length} ${picked.length === 1 ? "person" : "people"}`;
          const names = picked.map((answer) => nameOf(answer.authorId)).join(", ");
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
              <span className={pairMode ? "pair-option-copy" : "feelings-copy"}>
                <strong>{choice}</strong>
                <small>{countLabel}</small>
                {picked.length > 0 && !pairMode ? <em>{names}</em> : null}
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

function EnergyMeter({
  choices,
  answers,
  selected,
  note,
  placeholder,
  nameOf,
  onNoteChange,
  onPick,
}: {
  choices: readonly string[];
  answers: IcebreakerAnswer[];
  selected: { head: string; note: string };
  note: string;
  placeholder: string;
  nameOf: (id: string) => string;
  onNoteChange: (value: string) => void;
  onPick: (choice: string, note: string) => void;
}) {
  const scores = answers
    .map((answer) => Number(icebreakerHead(answer.body).head))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 5);
  const average = scores.length === 0 ? null : scores.reduce((sum, value) => sum + value, 0) / scores.length;
  const peak = Math.max(1, ...choices.map((choice) => answers.filter((answer) => icebreakerHead(answer.body).head === choice).length));
  const mineLabel = selected.head ? `Your energy · ${selected.head}` : "Choose your energy";

  return (
    <div className="energy-board">
      <div className="energy-summary">
        <div className="energy-summary-copy">
          <p className="eyebrow">Your rating</p>
          <strong>{mineLabel}</strong>
          <span>{scores.length === 0 ? "Waiting for the first rating." : `${scores.length} ${scores.length === 1 ? "person has" : "people have"} rated`}</span>
        </div>
        <div className={`energy-avg${average == null ? " empty" : ""}`} aria-live="polite">
          <span className="eyebrow">Room avg</span>
          <strong>{average == null ? "—" : formatHealthAverage(average)}</strong>
          <small>/ 5</small>
        </div>
      </div>

      <div className="energy-scale" role="radiogroup" aria-label="Energy from 1 to 5">
        {choices.map((choice) => {
          const picked = answers.filter((answer) => icebreakerHead(answer.body).head === choice);
          const chosen = selected.head === choice;
          const share = Math.round((picked.length / peak) * 100);
          return (
            <button
              key={choice}
              type="button"
              role="radio"
              aria-checked={chosen}
              className={`energy-option${chosen ? " on" : ""}`}
              data-level={choice}
              onClick={() => onPick(choice, note.trim())}
            >
              <span className="energy-option-score">{choice}</span>
              <span className="energy-option-bar" aria-hidden="true">
                <i style={{ height: `${Math.max(picked.length > 0 ? 18 : 8, share)}%` }} />
              </span>
              <small>
                {picked.length}
                <span className="sr"> {picked.length === 1 ? "person" : "people"}</span>
              </small>
            </button>
          );
        })}
      </div>
      <div className="energy-ends">
        <span>Low</span>
        <span>High</span>
      </div>

      {answers.length > 0 ? (
        <ul className="energy-people" aria-label="Who rated what">
          {choices.map((choice) => {
            const picked = answers.filter((answer) => icebreakerHead(answer.body).head === choice);
            if (picked.length === 0) return null;
            return (
              <li key={choice}>
                <strong>{choice}</strong>
                <span>{picked.map((answer) => nameOf(answer.authorId)).join(", ")}</span>
              </li>
            );
          })}
        </ul>
      ) : null}

      <form
        className="energy-note"
        onSubmit={(event) => {
          event.preventDefault();
          if (!selected.head) return;
          onPick(selected.head, note.trim());
        }}
      >
        <label className="field" htmlFor="energy-note-input">
          <span className="field-label">
            <span>Optional note</span>
          </span>
          <span className="field-shell">
            <input
              id="energy-note-input"
              className="field-control"
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder={placeholder}
              maxLength={140}
              disabled={!selected.head}
            />
          </span>
        </label>
        <button type="submit" className="btn tiny" disabled={!selected.head}>
          {selected.note === note.trim() ? "Saved" : "Save note"}
        </button>
      </form>
    </div>
  );
}

function HealthCheck({
  answers,
  mine,
  send,
}: {
  answers: IcebreakerAnswer[];
  mine: IcebreakerAnswer | undefined;
  send: (op: Op) => Promise<boolean>;
}) {
  const saved = parseHealthScores(mine?.body ?? "");
  const [scores, setScores] = useState<(number | null)[]>(saved ?? HEALTH_CHECK.map(() => null));
  useEffect(() => {
    setScores(parseHealthScores(mine?.body ?? "") ?? HEALTH_CHECK.map(() => null));
  }, [mine?.body]);
  const answered = scores.filter((score) => score != null).length;
  const ready = answered === HEALTH_CHECK.length;
  const revealed = Boolean(mine);
  const sharedCount = answers.length;
  const roomAverage = revealed ? healthOverallAverage(answers) : null;
  const progress = answered / HEALTH_CHECK.length;

  return (
    <form
      className="health-check"
      onSubmit={(event) => {
        event.preventDefault();
        if (!ready) return;
        void send({ type: "retro.answerIcebreaker", body: scores.join(",") });
      }}
    >
      <div className="health-summary">
        <div className="health-progress" aria-label={`${answered} of ${HEALTH_CHECK.length} rated`}>
          <div className="health-progress-copy">
            <span>
              {answered} of {HEALTH_CHECK.length} rated
            </span>
            <strong>{Math.round(progress * 100)}%</strong>
          </div>
          <div className="health-progress-bar" aria-hidden="true">
            <i style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        {revealed && roomAverage != null ? (
          <div className="health-room-average" aria-live="polite">
            <span className="eyebrow">Room average</span>
            <strong>{formatHealthAverage(roomAverage)}</strong>
            <small>
              / 7 · {sharedCount} {sharedCount === 1 ? "response" : "responses"}
            </small>
            <div className="health-avg-meter" aria-hidden="true">
              <i style={{ width: `${(roomAverage / 7) * 100}%` }} data-level={Math.round(roomAverage)} />
            </div>
          </div>
        ) : (
          <div className="health-room-average empty">
            <span className="eyebrow">Room average</span>
            <strong>—</strong>
            <small>Appears after you share</small>
          </div>
        )}
      </div>

      <ol className="health-list">
        {HEALTH_CHECK.map((question, index) => {
          const counts = healthPointCounts(answers, index);
          const mineScore = scores[index];
          const categoryAverage = revealed ? healthCategoryAverage(answers, index) : null;
          return (
            <li key={question.title} className={`health-card${mineScore != null ? " rated" : ""}`}>
              <header className="health-card-head">
                <div className="health-card-title">
                  <p className="eyebrow">{question.title}</p>
                  <p>{question.statement}</p>
                </div>
                {categoryAverage != null ? (
                  <div className="health-card-avg" aria-label={`${question.title} average ${formatHealthAverage(categoryAverage)} of 7`}>
                    <span>Avg</span>
                    <strong>{formatHealthAverage(categoryAverage)}</strong>
                  </div>
                ) : mineScore != null ? (
                  <div className="health-card-avg yours" aria-label={`Your rating ${healthPointLabel(mineScore)}`}>
                    <span>Yours</span>
                    <strong>{mineScore}</strong>
                  </div>
                ) : null}
              </header>

              <div className="health-scale" role="radiogroup" aria-label={question.title}>
                {HEALTH_POINTS.map((point) => {
                  const selected = mineScore === point;
                  const count = counts[point - 1] ?? 0;
                  return (
                    <button
                      key={point}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={`${healthPointLabel(point)}${revealed ? `, ${count} ${count === 1 ? "person" : "people"}` : ""}`}
                      className={`health-point health-${point}${selected ? " on" : ""}`}
                      onClick={() =>
                        setScores((current) => current.map((value, valueIndex) => (valueIndex === index ? point : value)))
                      }
                    >
                      <span className="health-point-mark" aria-hidden="true">
                        {point}
                      </span>
                      {revealed ? <small>{count}</small> : null}
                    </button>
                  );
                })}
              </div>

              <div className="health-ends">
                <span>Strongly disagree</span>
                <span>Strongly agree</span>
              </div>

              {mineScore != null ? (
                <p className="health-pick">
                  Your pick · <strong>{healthPointLabel(mineScore)}</strong>
                  {categoryAverage != null ? (
                    <>
                      {" "}
                      · Room avg <strong>{formatHealthAverage(categoryAverage)}</strong>
                    </>
                  ) : null}
                </p>
              ) : (
                <p className="health-pick muted">Choose a rating for this category</p>
              )}

              {categoryAverage != null ? (
                <div className="health-avg-meter" aria-hidden="true">
                  <i style={{ width: `${(categoryAverage / 7) * 100}%` }} data-level={Math.round(categoryAverage)} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="health-actions">
        <button type="submit" className="btn primary" disabled={!ready}>
          {mine ? "Update ratings" : "Share ratings"}
        </button>
        {revealed ? (
          <p className="muted">Averages update as people share their ratings.</p>
        ) : (
          <p className="muted">Share your ratings to unlock room averages and counts.</p>
        )}
      </div>
    </form>
  );
}

const HEALTH_POINTS = [1, 2, 3, 4, 5, 6, 7] as const;

function healthPointCounts(answers: IcebreakerAnswer[], questionIndex: number): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const answer of answers) {
    const scores = parseHealthScores(answer.body);
    const score = scores?.[questionIndex];
    if (score) counts[score - 1] = (counts[score - 1] ?? 0) + 1;
  }
  return counts;
}

function ShowAndTell({
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
  const saved = showAndTellParts(mine?.body ?? "");
  const [text, setText] = useState(saved.text);
  const [link, setLink] = useState(saved.media.startsWith("data:") ? "" : saved.media);
  const [fileData, setFileData] = useState(saved.media.startsWith("data:") ? saved.media : "");
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const next = showAndTellParts(mine?.body ?? "");
    setText(next.text);
    setLink(next.media.startsWith("data:") ? "" : next.media);
    setFileData(next.media.startsWith("data:") ? next.media : "");
    setError("");
  }, [mine?.body]);

  const picture = link.trim() || fileData;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setReading(true);
    try {
      const data = await pictureFromFile(file);
      setFileData(data);
      setLink("");
    } catch (fileError) {
      console.error("[cadence] show-and-tell picture failed", {
        message: fileError instanceof Error ? fileError.message : "unknown",
      });
      setError(fileError instanceof Error ? fileError.message : "Could not use that picture.");
    } finally {
      setReading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="ice-answers">
      <form
        className="show-tell-form"
        onSubmit={(event) => {
          event.preventDefault();
          const caption = text.trim();
          if (!caption) return;
          const verdict = acceptedShowMedia(picture);
          if (verdict === "large") {
            setError("That picture is too large. Paste an https link instead.");
            return;
          }
          if (verdict === "type") {
            setError("Paste an https link to a picture or GIF.");
            return;
          }
          setError("");
          void send({ type: "retro.answerIcebreaker", body: formatShowAndTell(caption, picture) });
        }}
      >
        <div className="ice-answer-form">
          <label className="ice-answer-field" htmlFor="show-tell-caption">
            <span className="ice-answer-label">What are you sharing?</span>
            <input
              id="show-tell-caption"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="A chipped mug from launch week"
              maxLength={180}
            />
          </label>
          <button type="submit" className="btn primary" disabled={text.trim().length === 0 || reading}>
            {mine ? "Update" : "Share"}
          </button>
        </div>
        <div className="show-media">
          <input
            ref={fileRef}
            type="file"
            accept="image/gif,image/png,image/jpeg,image/webp"
            aria-label="Picture or GIF file"
            onChange={(event) => void onFile(event.target.files?.[0])}
          />
          <button type="button" className="btn tiny" disabled={reading} onClick={() => fileRef.current?.click()}>
            {reading ? "Reading…" : "Picture or GIF"}
          </button>
          <input
            value={link}
            onChange={(event) => {
              setLink(event.target.value);
              setFileData("");
              setError("");
            }}
            aria-label="Picture or GIF link"
            placeholder="Or paste an https link"
            maxLength={400}
          />
          {picture ? (
            <button
              type="button"
              className="btn tiny"
              onClick={() => {
                setLink("");
                setFileData("");
                setError("");
              }}
            >
              Remove
            </button>
          ) : null}
        </div>
        {error ? (
          <p className="pair-note" role="alert">
            {error}
          </p>
        ) : null}
        <ShowPicture media={picture} alt={text.trim() || "Picture preview"} />
      </form>

      <div className="ice-answers-board">
        <header>
          <p className="eyebrow">Room shares</p>
          <strong>
            {answers.length} {answers.length === 1 ? "share" : "shares"}
          </strong>
        </header>
        {answers.length === 0 ? (
          <div className="ice-answers-empty">
            <p>No one has shared yet</p>
            <span>Add a caption and optional picture.</span>
          </div>
        ) : (
          <ul className="shout-list">
            {answers.map((answer, index) => {
              const parts = showAndTellParts(answer.body);
              return (
                <li
                  key={answer.id}
                  className={answer.authorId === mine?.authorId ? "mine" : ""}
                  style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                >
                  <span className="ice-chip-avatar" aria-hidden="true">
                    {initials(nameOf(answer.authorId))}
                  </span>
                  <div className="ice-chip-copy">
                    <p>
                      <strong>{parts.text}</strong>
                    </p>
                    <ShowPicture media={parts.media} alt={parts.text} />
                    <small>{nameOf(answer.authorId)}</small>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function ShowPicture({ media, alt }: { media: string; alt: string }) {
  const sources = showAndTellMediaSources(media);
  const src = sources[0];
  if (!src) return null;
  if (src.startsWith("data:")) return <img className="gif-preview" src={src} alt={alt || "Picture"} />;
  return <MediaPreview url={media} alt={alt || "Picture"} />;
}

function pictureFromFile(file: File): Promise<string> {
  const type = file.type.toLowerCase();
  if (type === "image/gif") {
    if (file.size > 48_000) return Promise.reject(new Error("That GIF is too large. Paste an https link instead."));
    return readPicture(file).then((data) => {
      if (!data.startsWith("data:image/gif;base64,") || data.length > 70_000) {
        throw new Error("That GIF is too large. Paste an https link instead.");
      }
      return data;
    });
  }
  if (type !== "image/png" && type !== "image/jpeg" && type !== "image/webp") {
    return Promise.reject(new Error("Use a GIF, PNG, JPEG, or WebP picture."));
  }
  return readPicture(file).then(
    (data) =>
      new Promise<string>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          const max = 480;
          const scale = Math.min(1, max / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("Could not prepare that picture."));
            return;
          }
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          let quality = 0.72;
          let jpeg = canvas.toDataURL("image/jpeg", quality);
          while (jpeg.length > 70_000 && quality > 0.4) {
            quality = Math.round((quality - 0.1) * 10) / 10;
            jpeg = canvas.toDataURL("image/jpeg", quality);
          }
          if (jpeg.length > 70_000) {
            reject(new Error("That picture is too large. Paste an https link instead."));
            return;
          }
          resolve(jpeg);
        };
        image.onerror = () => reject(new Error("Could not read that picture."));
        image.src = data;
      }),
  );
}

function readPicture(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read that file."));
    };
    reader.readAsDataURL(file);
  });
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
  const association = game.id === "word-association";
  return (
    <div className="ice-answers">
      <AnswerForm
        key={`${game.id}-${mine?.body ?? ""}`}
        initial={mine?.body ?? ""}
        placeholder={game.placeholder ?? ""}
        label="Your answer"
        maxLength={words ? 24 : 180}
        submitLabel={mine ? "Update" : "Share"}
        onSubmit={(body) => send({ type: "retro.answerIcebreaker", body })}
      />

      {association ? (
        <div className="ice-chain" aria-label="Word association chain">
          <header>
            <p className="eyebrow">Chain so far</p>
            <strong>
              {answers.length} {answers.length === 1 ? "link" : "links"}
            </strong>
          </header>
          {answers.length === 0 ? (
            <div className="ice-answers-empty">
              <p>Chain starts with Sprint</p>
              <span>Add the next word.</span>
            </div>
          ) : (
            <p className="chain">
              <span>Sprint</span>
              {answers.map((answer) => (
                <span key={answer.id}>
                  <i aria-hidden="true">→</i>
                  <strong>{answer.body}</strong>
                </span>
              ))}
            </p>
          )}
        </div>
      ) : (
        <div className="ice-answers-board">
          <header>
            <p className="eyebrow">Room answers</p>
            <strong>
              {answers.length} {answers.length === 1 ? "share" : "shares"}
            </strong>
          </header>
          {answers.length === 0 ? (
            <div className="ice-answers-empty">
              <p>No one has shared yet</p>
              <span>You can go first.</span>
            </div>
          ) : (
            <ul className="shout-list">
              {answers.map((answer, index) => {
                const parts = game.mode === "sprint" ? icebreakerHead(answer.body) : { head: answer.body, note: "" };
                return (
                  <li
                    key={answer.id}
                    className={answer.authorId === mine?.authorId ? "mine" : ""}
                    style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                  >
                    <span className="ice-chip-avatar" aria-hidden="true">
                      {initials(nameOf(answer.authorId))}
                    </span>
                    <div className="ice-chip-copy">
                      <p>
                        <strong>{parts.head}</strong>
                        {parts.note ? <span className="ice-chip-note"> — {parts.note}</span> : null}
                      </p>
                      <SharedMedia body={answer.body} />
                      <small>{nameOf(answer.authorId)}</small>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
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
    <div className="ice-answers">
      <div className="emoji-pick" role="group" aria-label="Emoji">
        {(game.choices ?? []).map((item) => (
          <button
            key={item}
            type="button"
            className={emoji === item ? "on" : ""}
            aria-pressed={emoji === item}
            onClick={() => setEmoji(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <form
        className="ice-answer-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!emoji || !sentence.trim()) return;
          void send({ type: "retro.answerIcebreaker", body: `${emoji} ${sentence.trim()}` });
        }}
      >
        <label className="ice-answer-field" htmlFor="emoji-sentence-input">
          <span className="ice-answer-label">One sentence</span>
          <input
            id="emoji-sentence-input"
            value={sentence}
            onChange={(event) => setSentence(event.target.value)}
            placeholder={game.placeholder}
            maxLength={160}
          />
        </label>
        <button type="submit" className="btn primary" disabled={!emoji || sentence.trim().length === 0}>
          {mine ? "Update" : "Share"}
        </button>
      </form>
      <div className="ice-answers-board">
        <header>
          <p className="eyebrow">Room check-ins</p>
          <strong>
            {answers.length} {answers.length === 1 ? "share" : "shares"}
          </strong>
        </header>
        {answers.length === 0 ? (
          <div className="ice-answers-empty">
            <p>No one has shared yet</p>
            <span>Pick an emoji and add a sentence.</span>
          </div>
        ) : (
          <ul className="shout-list">
            {answers.map((answer, index) => (
              <li
                key={answer.id}
                className={answer.authorId === mine?.authorId ? "mine" : ""}
                style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
              >
                <span className="ice-chip-avatar" aria-hidden="true">
                  {initials(nameOf(answer.authorId))}
                </span>
                <div className="ice-chip-copy">
                  <p>{answer.body}</p>
                  <SharedMedia body={answer.body} />
                  <small>{nameOf(answer.authorId)}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
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
    <div className="ice-answers">
      <form
        className="show-tell-form"
        onSubmit={(event) => {
          event.preventDefault();
          const link = url.trim();
          const note = caption.trim();
          if (!link) return;
          void send({ type: "retro.answerIcebreaker", body: note ? `${link} — ${note}` : link });
        }}
      >
        <div className="ice-answer-form">
          <label className="ice-answer-field" htmlFor="gif-link-input">
            <span className="ice-answer-label">GIF link</span>
            <input
              id="gif-link-input"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://"
              maxLength={400}
            />
          </label>
          <button type="submit" className="btn primary" disabled={url.trim().length === 0}>
            {mine ? "Update" : "Share"}
          </button>
        </div>
        <label className="ice-answer-field" htmlFor="gif-caption-input">
          <span className="ice-answer-label">Caption</span>
          <input
            id="gif-caption-input"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="A short caption"
            maxLength={140}
          />
        </label>
        <MediaPreview url={url.trim()} alt={caption.trim() || "GIF preview"} />
      </form>
      <div className="ice-answers-board">
        <header>
          <p className="eyebrow">Room GIFs</p>
          <strong>
            {answers.length} {answers.length === 1 ? "share" : "shares"}
          </strong>
        </header>
        {answers.length === 0 ? (
          <div className="ice-answers-empty">
            <p>No GIFs yet</p>
            <span>Paste a link to go first.</span>
          </div>
        ) : (
          <div className="gif-grid">
            {answers.map((answer) => (
              <GifCard key={answer.id} body={answer.body} name={nameOf(answer.authorId)} mine={answer.authorId === mine?.authorId} />
            ))}
          </div>
        )}
      </div>
    </div>
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
  const inputId = "ice-answer-input";

  useEffect(() => {
    setText(initial);
  }, [initial]);

  return (
    <form
      className="ice-answer-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const body = text.trim();
        if (!body || pending) return;
        setPending(true);
        try {
          await onSubmit(body);
        } finally {
          setPending(false);
        }
      }}
    >
      <label className="ice-answer-field" htmlFor={inputId}>
        <span className="ice-answer-label">{label}</span>
        <input
          id={inputId}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete="off"
          spellCheck={maxLength > 40}
        />
      </label>
      <button type="submit" className="btn primary" disabled={pending || text.trim().length === 0}>
        {pending ? "Sharing…" : submitLabel}
      </button>
    </form>
  );
}
