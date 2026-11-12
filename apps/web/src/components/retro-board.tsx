"use client";

import {
  discussionGroups,
  retrospectiveCsv,
  retrospectiveExport,
  RETRO_TEMPLATES,
  type ActionItem,
  type DiscussionGroup,
  sectionStopwatchMs,
  votesLeft,
  type DiscussionBy,
  type Op,
  type RetroCardView,
  type RetroColumn,
  type RetroPhase,
  type RoomView,
} from "@cadence/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { IcebreakerPanel } from "./icebreaker-panel";
import { RetroGlyph } from "./retro-glyphs";
import { SharedField } from "./shared-field";
import { initials } from "./identity";
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

export function RetroBoard({
  room,
  actorId,
  send,
}: {
  room: RoomView;
  actorId: string;
  send: (op: Op) => Promise<boolean>;
}) {
  const retro = room.retro;
  const [dragId, setDragId] = useState<string | null>(null);
  const [moveCardId, setMoveCardId] = useState<string | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<
    { kind: "card"; id: string } | { kind: "action"; id: string } | null
  >(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!moveCardId) return;
    const close = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest(`[data-move="${moveCardId}"]`)) setMoveCardId(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoveCardId(null);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [moveCardId]);

  useEffect(() => {
    if (!confirmDelete) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setConfirmDelete(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirmDelete]);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [retro?.phase, retro?.stopwatchRunningSince, retro?.timers]);

  useEffect(() => {
    if (!retro?.columns.length) return;
    setActiveColumnId((current) => {
      if (current && retro.columns.some((column) => column.id === current)) return current;
      return retro.columns[0]!.id;
    });
  }, [retro?.columns]);

  const groups = useMemo(() => {
    if (!retro) return [];
    return discussionGroups(retro, room.participants);
  }, [retro, room.participants]);

  if (!retro) return null;
  const host = room.hostId === actorId;
  const phase = RETRO_PHASES.find((item) => item.id === retro.phase) ?? RETRO_PHASES[0]!;
  const template = RETRO_TEMPLATES[retro.templateId];
  const discussionBy: DiscussionBy = retro.discussionBy === "author" ? "author" : "status";
  const focusGroup = groups.find((group) => group.key === retro.discussedGroupKey) ?? groups[0] ?? null;
  const sectionEndsAt = retro.timers?.[retro.phase] ?? null;
  const remaining = sectionEndsAt ? Math.max(0, Date.parse(sectionEndsAt) - now) : null;
  const left = votesLeft(retro, actorId);
  const canVote = votingOpen(retro.phase);
  const canEditNotes = notesEditable(retro.phase);
  const progress = phaseProgress(retro.phase);
  const showNotes = retro.phase === "brainstorm";
  const showDiscuss = retro.phase === "discuss";
  const showVote = retro.phase === "vote";
  const showBoard = showNotes || showVote;
  const showActions = retro.phase === "act";
  const showSummary = retro.phase === "summary";
  const visibleNotes = (columnId: string) => retro.cards.filter((card) => card.columnId === columnId && !card.hidden);
  const notePeak = Math.max(1, ...retro.columns.map((column) => visibleNotes(column.id).length));

  const advanceGroup = () => {
    if (!focusGroup || groups.length < 2) return;
    const index = groups.findIndex((group) => group.key === focusGroup.key);
    const next = groups[(index + 1) % groups.length];
    if (next) void send({ type: "retro.focusGroup", key: next.key });
  };

  const removeConfirmed = () => {
    if (!confirmDelete) return;
    if (confirmDelete.kind === "card") {
      void send({ type: "retro.deleteCard", cardId: confirmDelete.id });
    } else {
      void send({ type: "retro.deleteAction", actionId: confirmDelete.id });
    }
    setConfirmDelete(null);
  };

  return (
    <div className={`ritual retro phase-${retro.phase}`}>
      <header className="phasebar">
        <div className="phase-progress" aria-hidden="true">
          <span style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="phase-stepper" role="tablist" aria-label="Retrospective phase">
          {RETRO_PHASES.map((item, index) => {
            const elapsed = sectionStopwatchMs(retro, item.id, now);
            const active = item.id === retro.phase;
            const running = active && Boolean(retro.stopwatchRunningSince);
            const done = RETRO_PHASES.findIndex((phaseItem) => phaseItem.id === retro.phase) > index;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`phase-step${active ? " on" : ""}${done ? " done" : ""}`}
                disabled={!host}
                title={host ? undefined : "Only the host can change the section"}
                onClick={() => void send({ type: "retro.setPhase", phase: item.id })}
              >
                <span className="step" aria-hidden="true">
                  {done && !active ? "✓" : index + 1}
                </span>
                <span className="phase-label">
                  <span className="phase-name">{item.label}</span>
                  {item.id === "summary" ? null : (
                    <span
                      className={running ? "phase-clock on" : "phase-clock"}
                      title="Stopwatch"
                      aria-label={`${item.label} stopwatch, counting up`}
                    >
                      <StopwatchIcon />
                      <span>{formatElapsed(elapsed)}</span>
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="phase-meta">
          <div className="phase-copy">
            <div className="phase-kicker">
              <p className="eyebrow">{phase.short}</p>
              <span className="template-name">{template.name}</span>
            </div>
            <h2 className="phase-title">{phase.label}</h2>
            <p className="phase-hint">
              {phase.hint}
              {host ? "" : " Only the host can change the section."}
            </p>
          </div>
          {retro.phase === "icebreak" || retro.phase === "summary" ? null : (
            <PhaseTimer
              remaining={remaining}
              endsAt={sectionEndsAt}
              phase={retro.phase}
              send={send}
            />
          )}
        </div>

        {showNotes || showVote ? (
          <div className="phase-tools" aria-label="Session tools">
            {showNotes ? (
              <span className="tool-chip muted">Only you can see your notes until Discuss</span>
            ) : null}
            {showVote ? (
              <DotPicker
                count={retro.votesPerPerson}
                onChange={(count) => void send({ type: "retro.setVotesPerPerson", count })}
              />
            ) : null}
          </div>
        ) : null}
      </header>

      {showDiscuss ? (
        <DiscussWalk
          host={host}
          actorId={actorId}
          raisedHands={retro.raisedHands}
          discussionBy={discussionBy}
          groups={groups}
          focus={focusGroup}
          columns={retro.columns}
          participants={room.participants}
          templateId={retro.templateId}
          send={send}
          onAdvance={advanceGroup}
        />
      ) : null}

      {retro.phase === "icebreak" ? <IcebreakerPanel room={room} actorId={actorId} send={send} /> : null}

      {canVote ? (
        <div className={`vote-rail${left === 0 ? " spent" : ""}`} role="status">
          <div>
            <p className="eyebrow">Your dots</p>
            <strong>{left === 0 ? "All spent" : `${left} left`}</strong>
          </div>
          <span className="vote-budget-dots" aria-hidden="true">
            {Array.from({ length: retro.votesPerPerson }, (_, index) => (
              <i key={index} className={index < left ? "left" : "used"} />
            ))}
          </span>
          <p>{left === 0 ? "Remove a vote to move a dot." : "Tap Vote on the notes that should become actions."}</p>
        </div>
      ) : null}

      {showBoard ? (
        <>
          <div className="column-tabs" role="tablist" aria-label="Retro columns">
            {retro.columns.map((column) => {
              const count = visibleNotes(column.id).length;
              return (
                <button
                  key={column.id}
                  type="button"
                  role="tab"
                  aria-selected={activeColumnId === column.id}
                  className={`column-tab tone-${column.tone}${activeColumnId === column.id ? " on" : ""}`}
                  onClick={() => setActiveColumnId(column.id)}
                >
                  <RetroGlyph templateId={retro.templateId} columnId={column.id} />
                  <span>{column.title}</span>
                  <em>{count}</em>
                </button>
              );
            })}
          </div>

          <div className={`columns cols-${retro.columns.length}${showVote ? " vote-mode" : ""}`}>
            {retro.columns.map((column) => {
              const cards = visibleNotes(column.id);
              const weight = (0.84 + (cards.length / notePeak) * 0.32).toFixed(3);
              const isActive = activeColumnId === column.id;
              return (
                <section
                  key={column.id}
                  className={`column tone-${column.tone}${isActive ? " active" : ""}`}
                  data-column={column.id}
                  onDragOver={
                    canEditNotes
                      ? (event) => {
                          event.preventDefault();
                        }
                      : undefined
                  }
                  onDrop={
                    canEditNotes
                      ? (event) => {
                          event.preventDefault();
                          const cardId = dragId || event.dataTransfer.getData("text/plain");
                          if (cardId) void send({ type: "retro.moveCard", cardId, columnId: column.id });
                          setDragId(null);
                        }
                      : undefined
                  }
                >
                  <header className="column-head">
                    <span className="column-mark" style={{ ["--weight" as string]: weight }} aria-hidden="true">
                      <RetroGlyph templateId={retro.templateId} columnId={column.id} />
                    </span>
                    <div className="column-copy">
                      <h2>{column.title}</h2>
                      <p>{column.hint}</p>
                    </div>
                    <span className="column-count" aria-label={`${cards.length} visible notes`}>
                      {cards.length}
                    </span>
                  </header>
                  {cards.length === 0 ? (
                    <div className="empty-state">
                      <p>Nothing here yet</p>
                      <span>
                        {canEditNotes
                          ? "Add a note — only you will see it until Discuss."
                          : showVote
                            ? "No notes in this column to vote on."
                            : "No notes were written in this column."}
                      </span>
                    </div>
                  ) : null}
                  <ul>
                    {cards.map((card) => {
                        const authorKey = card.anonymous || !card.authorId ? "anonymous" : card.authorId;
                        const aside =
                          showDiscuss && discussionBy === "author" && focusGroup != null && authorKey !== focusGroup.key;
                        return (
                        <li key={card.id} className={dragId === card.id ? "note dragging" : aside ? "note aside" : "note"}>
                          {canEditNotes ? (
                            <SharedField
                              value={card.body ?? ""}
                              onCommit={(body) => send({ type: "retro.editCard", cardId: card.id, body })}
                              ariaLabel="Note text"
                              className="note-text"
                              multiline
                              rows={2}
                              maxLength={500}
                            />
                          ) : (
                            <p className="note-body">{card.body}</p>
                          )}
                          <footer>
                            <span className="note-author">{authorLabel(card)}</span>
                            {canVote ? (
                              <span
                                className="vote-count"
                                aria-label={`${card.voteCount} ${card.voteCount === 1 ? "vote" : "votes"}`}
                              >
                                <i aria-hidden="true" />
                                {card.voteCount}
                              </span>
                            ) : null}
                          </footer>
                          {canEditNotes || canVote ? (
                          <div className="note-tools" data-move={card.id}>
                            <div className="note-actions">
                              {canEditNotes ? (
                                <button
                                  type="button"
                                  className="note-grip"
                                  draggable
                                  aria-label="Drag note to another column"
                                  onDragStart={(event) => {
                                    event.dataTransfer.setData("text/plain", card.id);
                                    event.dataTransfer.effectAllowed = "move";
                                    setDragId(card.id);
                                    setMoveCardId(null);
                                  }}
                                  onDragEnd={() => setDragId(null)}
                                >
                                  <svg viewBox="0 0 10 16" aria-hidden="true">
                                    <circle cx="2" cy="2.2" r="1.25" />
                                    <circle cx="8" cy="2.2" r="1.25" />
                                    <circle cx="2" cy="8" r="1.25" />
                                    <circle cx="8" cy="8" r="1.25" />
                                    <circle cx="2" cy="13.8" r="1.25" />
                                    <circle cx="8" cy="13.8" r="1.25" />
                                  </svg>
                                </button>
                              ) : null}
                              {canEditNotes ? (
                                <button
                                  type="button"
                                  className="column-chip"
                                  aria-expanded={moveCardId === card.id}
                                  aria-controls={`move-${card.id}`}
                                  onClick={() => setMoveCardId((current) => (current === card.id ? null : card.id))}
                                >
                                  <i className={`tone-${column.tone}`} aria-hidden="true" />
                                  <span>{column.title}</span>
                                  <svg viewBox="0 0 12 12" aria-hidden="true">
                                    <path d="M2.5 4.5 6 8l3.5-3.5" />
                                  </svg>
                                </button>
                              ) : null}
                              {canVote ? (
                                <button
                                  type="button"
                                  className={card.votes.includes(actorId) ? "btn tiny vote-btn on" : "btn tiny vote-btn"}
                                  aria-pressed={card.votes.includes(actorId)}
                                  disabled={left === 0 && !card.votes.includes(actorId)}
                                  onClick={() =>
                                    void send({
                                      type: "retro.vote",
                                      cardId: card.id,
                                      voting: !card.votes.includes(actorId),
                                    })
                                  }
                                >
                                  {card.votes.includes(actorId) ? "Voted" : "Vote"}
                                </button>
                              ) : null}
                              {canEditNotes ? (
                                <button
                                  type="button"
                                  className="note-remove"
                                  onClick={() => setConfirmDelete({ kind: "card", id: card.id })}
                                >
                                  Remove
                                </button>
                              ) : null}
                            </div>
                            {moveCardId === card.id ? (
                              <div
                                id={`move-${card.id}`}
                                className="move-sheet"
                                role="listbox"
                                aria-label="Move note to column"
                              >
                                {retro.columns.map((option) => (
                                  <button
                                    key={option.id}
                                    type="button"
                                    role="option"
                                    aria-selected={option.id === card.columnId}
                                    className={
                                      option.id === card.columnId
                                        ? `on tone-${option.tone}`
                                        : `tone-${option.tone}`
                                    }
                                    onClick={() => {
                                      setMoveCardId(null);
                                      if (option.id !== card.columnId) {
                                        void send({
                                          type: "retro.moveCard",
                                          cardId: card.id,
                                          columnId: option.id,
                                        });
                                      }
                                    }}
                                  >
                                    <i aria-hidden="true" />
                                    <span>{option.title}</span>
                                    <small>{option.hint}</small>
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          ) : null}
                        </li>
                        );
                    })}
                  </ul>
                  {canEditNotes ? <CardComposer columnId={column.id} send={send} /> : null}
                </section>
              );
            })}
          </div>
        </>
      ) : null}

      {showSummary ? <SummaryPanel room={room} /> : null}

      {showActions ? (
        <ActionsPanel
          actions={retro.actions}
          cards={retro.cards}
          columns={retro.columns}
          templateId={retro.templateId}
          participants={room.participants}
          send={send}
          onRemove={(id) => setConfirmDelete({ kind: "action", id })}
        />
      ) : null}

      {confirmDelete ? (
        <div className="confirm-layer" role="presentation" onClick={() => setConfirmDelete(null)}>
          <div
            className="confirm-sheet"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-copy"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="eyebrow">Please confirm</p>
            <h2 id="confirm-title">
              {confirmDelete.kind === "card" ? "Remove this note?" : "Remove this action?"}
            </h2>
            <p id="confirm-copy" className="muted">
              This cannot be undone for the room.
            </p>
            <div className="row">
              <button type="button" className="btn" onClick={() => setConfirmDelete(null)}>
                Keep it
              </button>
              <button type="button" className="btn primary danger" onClick={removeConfirmed}>
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DiscussWalk({
  host,
  actorId,
  raisedHands,
  discussionBy,
  groups,
  focus,
  columns,
  participants,
  templateId,
  send,
  onAdvance,
}: {
  host: boolean;
  actorId: string;
  raisedHands: string[];
  discussionBy: DiscussionBy;
  groups: DiscussionGroup[];
  focus: DiscussionGroup | null;
  columns: RetroColumn[];
  participants: RoomView["participants"];
  templateId: string;
  send: (op: Op) => Promise<boolean>;
  onAdvance: () => void;
}) {
  const nextLabel = discussionBy === "author" ? "Next author" : "Next status";
  const focusIndex = focus ? groups.findIndex((group) => group.key === focus.key) : -1;
  const progressRatio = groups.length > 1 && focusIndex >= 0 ? (focusIndex + 1) / groups.length : 0;
  const focusTone =
    discussionBy === "status" ? columns.find((column) => column.id === focus?.key)?.tone : undefined;
  const sortedNotes = useMemo(() => (focus ? sortDiscussNotes(focus.cards) : []), [focus]);
  const colorFor = (card: RetroCardView) => {
    if (card.anonymous || !card.authorId) return undefined;
    return participants.find((person) => person.id === card.authorId)?.color;
  };

  return (
    <div className="discuss-walk">
      <div className="discuss-toolbar">
        <div className="discuss-controls">
          <div className="discuss-basis" role="group" aria-label="Discussion basis">
            <span>Walk by</span>
            {(
              [
                ["status", "Status"],
                ["author", "Author"],
              ] as const
            ).map(([by, label]) => (
              <button
                key={by}
                type="button"
                className={discussionBy === by ? "on" : ""}
                aria-pressed={discussionBy === by}
                disabled={!host}
                title={host ? undefined : "Only the host can choose how the room discusses"}
                onClick={() => {
                  if (discussionBy !== by) void send({ type: "retro.setDiscussionBy", by });
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className={`hand-raise${raisedHands.length > 0 ? " live" : ""}`} aria-label="Speaking queue">
            <button
              type="button"
              className={`hand-toggle${raisedHands.includes(actorId) ? " on" : ""}`}
              aria-pressed={raisedHands.includes(actorId)}
              onClick={() => void send({ type: "retro.raiseHand", raised: !raisedHands.includes(actorId) })}
            >
              <span className="hand-toggle-mark" aria-hidden="true">
                {raisedHands.includes(actorId) ? "↓" : "↑"}
              </span>
              {raisedHands.includes(actorId) ? "Lower hand" : "Raise hand"}
            </button>
            {raisedHands.length > 0 ? (
              <ol className="hand-queue" aria-label="Raised hands">
                {raisedHands.map((id, index) => {
                  const person = participants.find((item) => item.id === id);
                  const name = id === actorId ? "You" : person?.name ?? "Someone";
                  const speaking = index === 0;
                  return (
                    <li key={id} className={speaking ? "speaking" : "waiting"}>
                      <span className="hand-place" aria-hidden="true">
                        {speaking ? "●" : index + 1}
                      </span>
                      <span
                        className="discuss-avatar sm"
                        style={person?.color ? { background: person.color } : undefined}
                        aria-hidden="true"
                      >
                        {initials(person?.name ?? name)}
                      </span>
                      <span className="hand-person">
                        <strong>{name}</strong>
                        <em>{speaking ? "Speaking" : `#${index + 1}`}</em>
                      </span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="hand-empty">Raise a hand to join the queue</p>
            )}
          </div>
        </div>
        {focus && groups.length > 1 ? (
          <p className="discuss-progress">
            {focusIndex + 1} of {groups.length}
          </p>
        ) : null}
      </div>

      {focus ? (
        <article
          className={`spotlight discuss-spotlight${focusTone ? ` tone-${focusTone}` : ""}`}
          key={`${discussionBy}-${focus.key}`}
        >
          <div className="discuss-progress-track" aria-hidden="true">
            <span style={{ width: `${progressRatio * 100}%` }} />
          </div>
          <div className="spotlight-top">
            <div className="spotlight-copy">
              <p className="eyebrow">
                Now discussing · {discussionBy === "author" ? "Author" : "Status"}
              </p>
              <h2>
                {discussionBy === "status" ? <RetroGlyph templateId={templateId} columnId={focus.key} /> : null}
                {discussionBy === "author" ? (
                  <span className="discuss-avatar lg" style={avatarStyle(focus.key, focus.label, participants)} aria-hidden="true">
                    {focus.key === "anonymous" ? "?" : initials(focus.label)}
                  </span>
                ) : null}
                {focus.label}
              </h2>
              <p className="spotlight-count">
                {focus.cards.length} {focus.cards.length === 1 ? "note" : "notes"} in this walk
              </p>
            </div>
            <div className="spotlight-actions">
              <button type="button" className="btn primary" onClick={onAdvance} disabled={groups.length < 2}>
                {nextLabel}
              </button>
            </div>
          </div>

          {discussionBy === "author" ? (
            <div className="discuss-statuses">
              {columns.map((column) => {
                const notes = focus.cards.filter((card) => card.columnId === column.id);
                if (notes.length === 0) return null;
                return (
                  <section key={column.id} className={`discuss-status-panel tone-${column.tone}`}>
                    <header>
                      <h3>
                        <RetroGlyph templateId={templateId} columnId={column.id} />
                        {column.title}
                      </h3>
                      <em>{notes.length}</em>
                    </header>
                    <ul className="discuss-note-list">
                      {notes.map((card, index) => (
                        <DiscussNoteCard
                          key={card.id}
                          card={card}
                          index={index}
                          color={colorFor(card)}
                          showAuthor={false}
                          speaking={handUp(card, raisedHands, actorId)}
                        />
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          ) : (
            <ul className="discuss-note-list">
              {sortedNotes.map((card, index) => (
                <DiscussNoteCard
                  key={card.id}
                  card={card}
                  index={index}
                  color={colorFor(card)}
                  showAuthor
                  speaking={handUp(card, raisedHands, actorId)}
                />
              ))}
            </ul>
          )}

          {groups.length > 1 ? (
            <ol className="spotlight-queue" aria-label="Discussion order">
              {groups.map((group, index) => {
                const tone = discussionBy === "status" ? columns.find((column) => column.id === group.key)?.tone : undefined;
                return (
                  <li key={group.key} className={group.key === focus.key ? "on" : ""}>
                    <button type="button" onClick={() => void send({ type: "retro.focusGroup", key: group.key })}>
                      <span className="queue-rank">{index + 1}</span>
                      <span className="queue-body">
                        {discussionBy === "status" ? (
                          <span className={`queue-status${tone ? ` tone-${tone}` : ""}`}>
                            <RetroGlyph templateId={templateId} columnId={group.key} />
                          </span>
                        ) : (
                          <span
                            className="discuss-avatar sm"
                            style={avatarStyle(group.key, group.label, participants)}
                            aria-hidden="true"
                          >
                            {group.key === "anonymous" ? "?" : initials(group.label)}
                          </span>
                        )}
                        <span>{group.label}</span>
                      </span>
                      <span className="queue-meta">{group.cards.length}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          ) : null}
        </article>
      ) : (
        <div className="empty-state compact">
          <p>Nothing to discuss yet</p>
          <span>Notes appear here once the room has written them.</span>
        </div>
      )}
    </div>
  );
}

function handUp(card: RetroCardView, raisedHands: string[], actorId: string): boolean {
  if (card.anonymous) return card.mine && raisedHands.includes(actorId);
  return card.authorId != null && raisedHands.includes(card.authorId);
}

function DiscussNoteCard({
  card,
  index,
  color,
  showAuthor,
  speaking,
}: {
  card: RetroCardView;
  index: number;
  color?: string;
  showAuthor: boolean;
  speaking: boolean;
}) {
  const label = authorLabel(card);
  return (
    <li
      className={speaking ? "discuss-note speaking" : "discuss-note"}
      style={{ animationDelay: `${Math.min(index, 10) * 35}ms`, ["--hand" as string]: color ?? "var(--ink)" }}
    >
      {showAuthor ? (
        <span className="discuss-avatar" style={color ? { background: color } : undefined} aria-hidden="true">
          {card.anonymous ? "?" : initials(label.replace(/^You( · anonymous)?$/, "You"))}
        </span>
      ) : (
        <span className="discuss-note-mark" aria-hidden="true" />
      )}
      <div className="discuss-note-copy">
        <p>{card.body}</p>
        {showAuthor ? <span className="discuss-note-author">{label}</span> : null}
      </div>
    </li>
  );
}

function avatarStyle(
  key: string,
  label: string,
  participants: RoomView["participants"],
): { background?: string } | undefined {
  if (key === "anonymous") return undefined;
  const person = participants.find((item) => item.id === key);
  if (person?.color) return { background: person.color };
  const named = participants.find((item) => item.name === label);
  return named?.color ? { background: named.color } : undefined;
}

function SummaryPanel({ room }: { room: RoomView }) {
  const data = retrospectiveExport(room);
  const retro = room.retro;
  if (!data || !retro) return null;
  const dots = data.notes.reduce((sum, note) => sum + note.votes, 0);
  const open = data.actions.filter((action) => !action.done).length;

  function download() {
    try {
      const csv = retrospectiveCsv(room);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `teamcompass-${room.code}-retrospective.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[cadence] csv download failed", {
        message: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  return (
    <section className="summary-board" aria-label="Summary">
      <div className="summary-toolbar">
        <div className="summary-stats">
          <p>
            <strong>{data.notes.length}</strong>
            <span>{data.notes.length === 1 ? "Note" : "Notes"}</span>
          </p>
          <p>
            <strong>{dots}</strong>
            <span>{dots === 1 ? "Dot" : "Dots"}</span>
          </p>
          <p>
            <strong>{data.actions.length}</strong>
            <span>{open === 0 ? "Actions" : `${open} open`}</span>
          </p>
          <p>
            <strong>{data.people.length}</strong>
            <span>{data.people.length === 1 ? "Person" : "People"}</span>
          </p>
        </div>
        <button type="button" className="btn primary" onClick={download}>
          Download CSV
        </button>
      </div>

      <div className="summary-columns">
        {retro.columns.map((column) => {
          const notes = data.notes.filter((note) => note.column === column.title);
          return (
            <section key={column.id} className="summary-column">
              <h3>
                <RetroGlyph templateId={retro.templateId} columnId={column.id} />
                {column.title}
              </h3>
              {notes.length === 0 ? <p className="muted">No notes in this column.</p> : null}
              <ul>
                {notes.map((note) => (
                  <li key={`${note.createdAt}-${note.body}`}>
                    <p>{note.body}</p>
                    <small>
                      {note.author}
                      {" · "}
                      {note.votes} {note.votes === 1 ? "dot" : "dots"}
                      {note.voters.length > 0 ? ` · ${note.voters.join(", ")}` : ""}
                    </small>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <section className="summary-block">
        <h3>Actions</h3>
        {data.actions.length === 0 ? <p className="muted">No actions were recorded.</p> : null}
        <ul>
          {data.actions.map((action) => (
            <li key={`${action.body}-${action.owner}`}>
              <p>
                {action.done ? "Done" : "Open"} · {action.body}
              </p>
              <small>
                {action.owner}
                {action.source ? ` · From “${action.source}”` : ""}
              </small>
            </li>
          ))}
        </ul>
      </section>

      <section className="summary-block">
        <h3>{data.answers[0] ? `${data.answers[0].game}` : "Icebreaker"}</h3>
        {data.answers.length === 0 ? <p className="muted">No icebreaker answers were shared.</p> : null}
        <ul>
          {data.answers.map((answer) => (
            <li key={`${answer.author}-${answer.round}-${answer.createdAt}`}>
              <p>{answer.body}</p>
              <small>
                {answer.question} · {answer.author}
              </small>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

function ActionsPanel({
  actions,
  cards,
  columns,
  templateId,
  participants,
  send,
  onRemove,
}: {
  actions: ActionItem[];
  cards: RetroCardView[];
  columns: RetroColumn[];
  templateId: string;
  participants: RoomView["participants"];
  send: (op: Op) => Promise<boolean>;
  onRemove: (id: string) => void;
}) {
  const open = actions.filter((action) => !action.done).length;
  const done = actions.length - open;
  const unowned = actions.filter((action) => !action.done && !action.ownerId).length;
  const notes = cards.filter((card) => !card.hidden && card.body);
  const usedNoteIds = new Set(
    actions.map((action) => action.sourceCardId).filter((id): id is string => Boolean(id)),
  );

  return (
    <section className="actions-board" aria-label="Actions">
      <header className="actions-hero">
        <div className="actions-hero-copy">
          <p className="eyebrow">Room commitments</p>
          <p className="actions-lead">
            Capture the next step, put a name on it, and leave with owners—not a pile of observations.
          </p>
          {unowned > 0 ? (
            <p className="actions-nudge">
              {unowned} {unowned === 1 ? "action still needs" : "actions still need"} an owner.
            </p>
          ) : actions.length > 0 ? (
            <p className="actions-nudge ok">Every open action has an owner.</p>
          ) : null}
        </div>
        <dl className="actions-stats" aria-label="Action progress">
          <div>
            <dt>Open</dt>
            <dd>{open}</dd>
          </div>
          <div>
            <dt>Done</dt>
            <dd>{done}</dd>
          </div>
          <div className={unowned ? "warn" : undefined}>
            <dt>Unowned</dt>
            <dd>{unowned}</dd>
          </div>
        </dl>
      </header>

      <div className="actions-compose">
        <NoteSource notes={notes} columns={columns} templateId={templateId} usedNoteIds={usedNoteIds} send={send} />
        <ActionComposer send={send} />
      </div>

      {actions.length === 0 ? (
        <div className="actions-empty">
          <p>No actions yet</p>
          <span>Turn a discussed note into an action, or write the next step yourself.</span>
        </div>
      ) : (
        <ul className="action-list">
          {actions.map((action, index) => {
            const owner = participants.find((person) => person.id === action.ownerId);
            const source = action.sourceCardId
              ? cards.find((card) => card.id === action.sourceCardId)
              : undefined;
            return (
              <li
                key={action.id}
                className={`action-card${action.done ? " done-row" : ""}${owner ? "" : " needs-owner"}`}
                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
              >
                <label className="action-check">
                  <input
                    type="checkbox"
                    checked={action.done}
                    onChange={(event) =>
                      void send({
                        type: "retro.setActionDone",
                        actionId: action.id,
                        done: event.target.checked,
                      })
                    }
                  />
                  <span className="action-tick" aria-hidden="true" />
                  <span className="action-body">
                    <span className={action.done ? "done" : ""}>{action.body || "Untitled action"}</span>
                    {source?.body ? <small className="action-source">From note · {source.body}</small> : null}
                  </span>
                </label>
                <OwnerPicker
                  owner={owner ?? null}
                  participants={participants}
                  onAssign={(ownerId) =>
                    void send({ type: "retro.assignAction", actionId: action.id, ownerId })
                  }
                />
                <button
                  type="button"
                  className="action-remove"
                  aria-label="Remove action"
                  onClick={() => onRemove(action.id)}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function NoteSource({
  notes,
  columns,
  templateId,
  usedNoteIds,
  send,
}: {
  notes: RetroCardView[];
  columns: RetroColumn[];
  templateId: string;
  usedNoteIds: Set<string>;
  send: (op: Op) => Promise<boolean>;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  if (notes.length === 0) return null;
  const available = notes.filter((card) => !usedNoteIds.has(card.id)).length;
  return (
    <div className="note-source">
      <div className="note-source-head">
        <p className="eyebrow">Start from a note</p>
        <span>{available} available</span>
      </div>
      <div className="note-chip-row" role="list">
        {notes.map((card) => {
          const column = columns.find((item) => item.id === card.columnId);
          const votes = `${card.voteCount} ${card.voteCount === 1 ? "vote" : "votes"}`;
          const used = usedNoteIds.has(card.id);
          const pending = pendingId === card.id;
          return (
            <button
              key={card.id}
              type="button"
              role="listitem"
              className={used ? "note-chip used" : "note-chip"}
              disabled={used || pending}
              aria-pressed={used}
              title={used ? "This note is already an action." : card.body ?? undefined}
              onClick={async () => {
                if (pendingId || used) return;
                setPendingId(card.id);
                await send({ type: "retro.addAction", body: "", sourceCardId: card.id });
                setPendingId(null);
              }}
            >
              <span className="note-chip-body">{card.body}</span>
              <span className="note-chip-meta">
                <span className={`note-chip-status tone-${column?.tone ?? "neutral"}`}>
                  {column ? <RetroGlyph templateId={templateId} columnId={column.id} /> : <i aria-hidden="true" />}
                  {column?.title ?? "Note"}
                </span>
                <span className="note-chip-votes" aria-label={votes}>
                  <i aria-hidden="true" />
                  {card.voteCount}
                </span>
              </span>
              <em>{pending ? "Adding…" : used ? "Used" : "Use"}</em>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OwnerPicker({
  owner,
  participants,
  onAssign,
}: {
  owner: { id: string; name: string } | null;
  participants: RoomView["participants"];
  onAssign: (ownerId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (!open) {
      setDropUp(false);
      return;
    }
    const menu = menuRef.current;
    if (!menu) return;
    const rect = menu.getBoundingClientRect();
    const fitsBelow = rect.bottom <= window.innerHeight - 8;
    setDropUp(!fitsBelow && rect.top > rect.height + 8);
  }, [open, participants.length]);

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
    <div className={`owner-picker${open ? " open" : ""}${dropUp ? " drop-up" : ""}${owner ? "" : " empty"}`} ref={rootRef}>
      <button
        type="button"
        className="owner-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={owner ? `Owner ${owner.name}` : "Assign owner"}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={`owner-chip${owner ? "" : " empty"}`} aria-hidden="true">
          {owner ? owner.name.slice(0, 1).toUpperCase() : "?"}
        </span>
        <span className="owner-label">
          <small>{owner ? "Owner" : "Needs owner"}</small>
          <strong>{owner?.name ?? "Unassigned"}</strong>
        </span>
        <span className="owner-caret" aria-hidden="true" />
      </button>
      {open ? (
        <ul className="owner-menu" role="listbox" aria-label="Choose owner" ref={menuRef}>
          <li>
            <button
              type="button"
              role="option"
              aria-selected={!owner}
              className={!owner ? "on" : ""}
              onClick={() => {
                onAssign(null);
                setOpen(false);
              }}
            >
              <span className="owner-chip empty" aria-hidden="true">
                ?
              </span>
              Unassigned
            </button>
          </li>
          {participants.map((person) => (
            <li key={person.id}>
              <button
                type="button"
                role="option"
                aria-selected={owner?.id === person.id}
                className={owner?.id === person.id ? "on" : ""}
                onClick={() => {
                  onAssign(person.id);
                  setOpen(false);
                }}
              >
                <span className="owner-chip" aria-hidden="true">
                  {person.name.slice(0, 1).toUpperCase()}
                </span>
                {person.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function CardComposer({ columnId, send }: { columnId: string; send: (op: Op) => Promise<boolean> }) {
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="composer"
      onSubmit={async (event) => {
        event.preventDefault();
        const text = body.trim();
        if (!text || pending) return;
        setPending(true);
        const saved = await send({ type: "retro.addCard", columnId, body: text, anonymous });
        if (saved) setBody("");
        setPending(false);
      }}
    >
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Add a note"
        aria-label="Note"
        rows={2}
        maxLength={500}
      />
      <div className="row">
        <label className="checkline">
          <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
          Anonymous
        </label>
        <button type="submit" className="btn primary tiny" disabled={pending || !body.trim()}>
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
    </form>
  );
}

function ActionComposer({ send }: { send: (op: Op) => Promise<boolean> }) {
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <form
      className="action-composer"
      onSubmit={async (event) => {
        event.preventDefault();
        const text = body.trim();
        if (!text || pending) return;
        setPending(true);
        const saved = await send({ type: "retro.addAction", body: text, sourceCardId: null });
        if (saved) setBody("");
        setPending(false);
      }}
    >
      <div className="action-composer-head">
        <p className="eyebrow">Or write one</p>
        <span>Be specific and assignable</span>
      </div>
      <div className="action-composer-row">
        <input
          value={body}
          onChange={(event) => setBody(event.target.value)}
          aria-label="New action"
          placeholder="e.g. Name a deploy owner before next staging"
          maxLength={500}
        />
        <button type="submit" className="btn primary" disabled={pending || !body.trim()}>
          {pending ? "Adding…" : "Add action"}
        </button>
      </div>
    </form>
  );
}

const TIMER_PRESETS = [3, 5, 8] as const;
const TIMER_MIN_MINUTES = 1;
const TIMER_MAX_MINUTES = 60;

function PhaseTimer({
  remaining,
  endsAt,
  phase,
  send,
}: {
  remaining: number | null;
  endsAt: string | null;
  phase: RetroPhase;
  send: (op: Op) => Promise<boolean>;
}) {
  const running = endsAt != null;
  const tone = timerTone(remaining);
  const [customOpen, setCustomOpen] = useState(false);
  const [draft, setDraft] = useState("10");
  const [startedSeconds, setStartedSeconds] = useState<number | null>(null);
  const skipBlur = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!running) setStartedSeconds(null);
  }, [running, phase]);

  useEffect(() => {
    if (customOpen) inputRef.current?.focus();
  }, [customOpen]);

  const start = async (seconds: number) => {
    setCustomOpen(false);
    setStartedSeconds(seconds);
    await send({ type: "retro.startTimer", seconds, phase });
  };

  const clear = async () => {
    setCustomOpen(false);
    setStartedSeconds(null);
    await send({ type: "retro.clearTimer", phase });
  };

  const commitCustom = (raw: string) => {
    const minutes = Number(raw);
    setCustomOpen(false);
    if (!Number.isInteger(minutes) || minutes < TIMER_MIN_MINUTES || minutes > TIMER_MAX_MINUTES) {
      setDraft("10");
      return;
    }
    setDraft(String(minutes));
    void start(minutes * 60);
  };

  const activePreset =
    startedSeconds && TIMER_PRESETS.some((minutes) => minutes * 60 === startedSeconds)
      ? startedSeconds / 60
      : null;
  const customActive = Boolean(startedSeconds && activePreset == null);
  const progress =
    remaining != null && startedSeconds && startedSeconds > 0
      ? Math.max(0, Math.min(1, remaining / (startedSeconds * 1000)))
      : null;
  const status =
    remaining == null ? null : remaining <= 0 ? "Time's up" : tone === "urgent" ? "Almost done" : null;

  return (
    <div
      className={`phase-timer tone-${tone}${running ? " on" : ""}${progress != null ? " has-progress" : ""}`}
      aria-live="polite"
      aria-label={remaining == null ? "Timer off" : `Timer ${formatClock(remaining)}`}
    >
      <div className="phase-timer-face">
        <span className="phase-timer-ring" aria-hidden="true">
          <svg viewBox="0 0 36 36">
            <circle className="phase-timer-track" cx="18" cy="18" r="15.5" />
            <circle
              className="phase-timer-progress"
              cx="18"
              cy="18"
              r="15.5"
              style={
                progress == null
                  ? undefined
                  : { strokeDasharray: `${(progress * 97.4).toFixed(2)} 97.4` }
              }
            />
          </svg>
          <TimerIcon />
        </span>
        <div className="phase-timer-copy">
          <span className="phase-timer-label">Timer</span>
          <strong>{remaining == null ? "Off" : formatClock(remaining)}</strong>
          {status ? <span className="phase-timer-status">{status}</span> : null}
        </div>
      </div>

      <div className="phase-timer-controls" role="group" aria-label="Timer presets">
        {TIMER_PRESETS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            className={activePreset === minutes ? "on" : ""}
            aria-pressed={activePreset === minutes}
            onClick={() => void start(minutes * 60)}
          >
            {minutes}m
          </button>
        ))}
        {customOpen ? (
          <label className="phase-timer-custom">
            <span className="sr">Custom minutes</span>
            <input
              ref={inputRef}
              type="number"
              min={TIMER_MIN_MINUTES}
              max={TIMER_MAX_MINUTES}
              step={1}
              inputMode="numeric"
              aria-label="Custom timer minutes"
              title={`Whole minutes from ${TIMER_MIN_MINUTES} to ${TIMER_MAX_MINUTES}`}
              placeholder="min"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={() => {
                if (skipBlur.current) {
                  skipBlur.current = false;
                  return;
                }
                commitCustom(draft);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  skipBlur.current = true;
                  commitCustom(draft);
                }
                if (event.key === "Escape") {
                  skipBlur.current = true;
                  setCustomOpen(false);
                }
              }}
            />
            <span>m</span>
          </label>
        ) : (
          <button
            type="button"
            className={customActive ? "on custom" : "custom"}
            aria-pressed={customActive}
            onClick={() => {
              setDraft(startedSeconds ? String(Math.round(startedSeconds / 60)) : "10");
              setCustomOpen(true);
            }}
          >
            {customActive && startedSeconds ? `${Math.round(startedSeconds / 60)}m` : "Custom"}
          </button>
        )}
        {running ? (
          <button type="button" className="clear" onClick={() => void clear()}>
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

function TimerIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="phase-timer-glyph">
      <path
        d="M4.2 1.8h7.6M4.2 14.2h7.6M5 2.2c.2 2.1 1.3 3.3 3 5.8-1.7 2.5-2.8 3.7-3 5.8M11 2.2c-.2 2.1-1.3 3.3-3 5.8 1.7 2.5 2.8 3.7 3 5.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const DOT_PRESETS = [1, 2, 3];

function DotPicker({ count, onChange }: { count: number; onChange: (count: number) => void }) {
  const custom = !DOT_PRESETS.includes(count);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(String(count));
  const skipBlur = useRef(false);

  const commit = (raw: string) => {
    const next = Number(raw);
    setOpen(false);
    if (!Number.isInteger(next) || next < 1 || next > 10) {
      setDraft(String(count));
      return;
    }
    setDraft(String(next));
    if (next !== count) onChange(next);
  };

  return (
    <div className="dot-picker tool-chip" role="group" aria-label="Votes per person">
      <span className="dot-picker-label">Dots each</span>
      <span className="dot-marks" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <i key={index} />
        ))}
      </span>
      {DOT_PRESETS.map((preset) => (
        <button
          key={preset}
          type="button"
          className={count === preset ? "on" : ""}
          aria-pressed={count === preset}
          onClick={() => {
            setOpen(false);
            if (count !== preset) onChange(preset);
          }}
        >
          {preset}
        </button>
      ))}
      {open ? (
        <input
          className="dot-custom"
          type="number"
          min={1}
          max={10}
          step={1}
          inputMode="numeric"
          aria-label="Custom votes per person"
          title="A whole number from 1 to 10"
          placeholder="1–10"
          value={draft}
          autoFocus
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            if (skipBlur.current) {
              skipBlur.current = false;
              return;
            }
            commit(draft);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              skipBlur.current = true;
              commit(draft);
            }
            if (event.key === "Escape") {
              skipBlur.current = true;
              setDraft(String(count));
              setOpen(false);
            }
          }}
        />
      ) : (
        <button
          type="button"
          className={custom ? "on custom" : "custom"}
          aria-pressed={custom}
          aria-label={custom ? `Custom votes per person, ${count}` : "Custom votes per person"}
          onClick={() => {
            setDraft(custom ? String(count) : "");
            setOpen(true);
          }}
        >
          {custom ? count : "Custom"}
        </button>
      )}
    </div>
  );
}

function StopwatchIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M6.2 1.2h3.6c.3 0 .5.2.5.5s-.2.5-.5.5H9.5v.6a6 6 0 1 1-3 0v-.6H6.2c-.3 0-.5-.2-.5-.5s.2-.5.5-.5Zm1.8 3.3a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm.5 1.2v2.7l1.9 1.1c.2.1.3.4.1.6-.1.2-.4.3-.6.1l-2.2-1.3c-.1-.1-.2-.2-.2-.4V5.7c0-.3.2-.5.5-.5s.5.2.5.5Z"
      />
    </svg>
  );
}
