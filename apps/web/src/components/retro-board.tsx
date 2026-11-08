"use client";

import {
  discussionGroups,
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
import {
  RETRO_PHASES,
  authorLabel,
  formatClock,
  formatElapsed,
  notesEditable,
  phaseProgress,
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
                  <span className={running ? "phase-clock on" : "phase-clock"} aria-label={`${item.label} stopwatch`}>
                    <StopwatchIcon />
                    <span>{formatElapsed(elapsed)}</span>
                  </span>
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
        </div>

        {retro.phase === "icebreak" ? null : (
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
            <PhaseTimer
              remaining={remaining}
              endsAt={sectionEndsAt}
              phase={retro.phase}
              send={send}
            />
          </div>
        )}
      </header>

      {showDiscuss ? (
        <DiscussWalk
          host={host}
          discussionBy={discussionBy}
          groups={groups}
          focus={focusGroup}
          columns={retro.columns}
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
  discussionBy,
  groups,
  focus,
  columns,
  templateId,
  send,
  onAdvance,
}: {
  host: boolean;
  discussionBy: DiscussionBy;
  groups: DiscussionGroup[];
  focus: DiscussionGroup | null;
  columns: { id: string; title: string; tone?: string }[];
  templateId: string;
  send: (op: Op) => Promise<boolean>;
  onAdvance: () => void;
}) {
  const nextLabel = discussionBy === "author" ? "Next author" : "Next status";
  const focusIndex = focus ? groups.findIndex((group) => group.key === focus.key) : -1;
  return (
    <div className="discuss-walk">
      <div className="discuss-toolbar">
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
        {focus && groups.length > 1 ? (
          <p className="discuss-progress">
            {focusIndex + 1} of {groups.length}
          </p>
        ) : null}
      </div>
      {focus ? (
        <article className="spotlight" key={focus.key}>
          <div className="spotlight-top">
            <div className="spotlight-copy">
              <p className="eyebrow">Now discussing · {discussionBy === "author" ? "Author" : "Status"}</p>
              <h2>
                {discussionBy === "status" ? <RetroGlyph templateId={templateId} columnId={focus.key} /> : null}
                {focus.label}
              </h2>
              <p className="spotlight-count">
                {focus.cards.length} {focus.cards.length === 1 ? "note" : "notes"}
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
                  <section key={column.id} className={column.tone ? `tone-${column.tone}` : undefined}>
                    <h3>
                      <RetroGlyph templateId={templateId} columnId={column.id} />
                      {column.title}
                    </h3>
                    <ul>
                      {notes.map((card) => (
                        <li key={card.id}>{card.body}</li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          ) : (
            <ul className="discuss-notes">
              {focus.cards.map((card) => (
                <li key={card.id}>
                  <p>{card.body}</p>
                  <span>{authorLabel(card)}</span>
                </li>
              ))}
            </ul>
          )}
          {groups.length > 1 ? (
            <ol className="spotlight-queue" aria-label="Discussion order">
              {groups.map((group, index) => (
                <li key={group.key} className={group.key === focus.key ? "on" : ""}>
                  <button type="button" onClick={() => void send({ type: "retro.focusGroup", key: group.key })}>
                    <span className="queue-rank">{index + 1}</span>
                    <span className="queue-body">
                      {discussionBy === "status" ? <RetroGlyph templateId={templateId} columnId={group.key} /> : null}
                      <span>{group.label}</span>
                    </span>
                    <span className="queue-meta">{group.cards.length}</span>
                  </button>
                </li>
              ))}
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
    remaining == null ? "Ready when you are" : remaining <= 0 ? "Time is up" : "Counting down";

  return (
    <div
      className={`phase-timer tone-${tone}${running ? " on" : ""}${progress != null ? " has-progress" : ""}`}
      aria-live="polite"
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
          <span className="phase-timer-label">{remaining == null ? "Timer" : remaining <= 0 ? "Done" : "Left"}</span>
          <strong>{remaining == null ? "Off" : formatClock(remaining)}</strong>
          <span className="phase-timer-status">{status}</span>
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
        d="M6.2 1.4h3.6M8 1.4v1.5M8 14.2a5.4 5.4 0 1 0 0-10.8 5.4 5.4 0 0 0 0 10.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M8 6.2v3.1l2 1.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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
