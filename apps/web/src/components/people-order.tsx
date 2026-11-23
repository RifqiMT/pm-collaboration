"use client";

import { LIMITS, parsePeopleOrder, type IcebreakerAnswer, type Op, type ParticipantView } from "@cadence/core";
import { useEffect, useState } from "react";
import { initials } from "./identity";

export function PeopleOrder({
  host,
  title,
  participants,
  answers,
  mine,
  actorId,
  nameOf,
  send,
}: {
  host: boolean;
  title: string | null;
  participants: ParticipantView[];
  answers: IcebreakerAnswer[];
  mine: IcebreakerAnswer | undefined;
  actorId: string;
  nameOf: (id: string) => string;
  send: (op: Op) => Promise<boolean>;
}) {
  const ids = participants.map((person) => person.id);
  const signature = `${ids.join(",")}|${mine?.body ?? ""}`;
  const [order, setOrder] = useState<string[]>(() => startingOrder(mine?.body, ids));
  const [draft, setDraft] = useState(title ?? "");
  const [note, setNote] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  useEffect(() => {
    setOrder(startingOrder(mine?.body, ids));
    // The signature already covers membership and the saved order.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);
  useEffect(() => {
    setDraft(title ?? "");
  }, [title]);

  function move(index: number, direction: -1 | 1) {
    setOrder((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      if (!item) return current;
      next.splice(nextIndex, 0, item);
      return next;
    });
    setNote("");
  }

  function dropOn(targetId: string) {
    if (!dragId || dragId === targetId) return;
    setOrder((current) => {
      const next = current.filter((id) => id !== dragId);
      const index = next.indexOf(targetId);
      if (index < 0) return current;
      next.splice(index, 0, dragId);
      return next;
    });
    setDragId(null);
    setOverId(null);
    setNote("");
  }

  const saved = mine?.body ?? "";
  const ready = order.length > 0 && order.join(",") !== saved;
  const named = Boolean(title);

  return (
    <div className="order-board">
      {host ? (
        <form
          className="order-title"
          onSubmit={(event) => {
            event.preventDefault();
            const next = draft.trim();
            if (!next || next === (title ?? "")) return;
            setNote("");
            void send({ type: "retro.setOrderTitle", title: next }).then((ok) => {
              if (!ok) setNote("That title did not save. Try again.");
            });
          }}
        >
          <label className="order-title-field">
            <span>Lineup title</span>
            <input
              className="field"
              value={draft}
              maxLength={LIMITS.title}
              placeholder="Years on the team"
              onChange={(event) => {
                setDraft(event.target.value);
                setNote("");
              }}
            />
          </label>
          <div className="order-title-actions">
            <button className="btn tiny" type="submit" disabled={!draft.trim() || draft.trim() === (title ?? "")}>
              Save title
            </button>
            {answers.length > 0 ? (
              <p className="muted">Saving a new title clears the orders already shared.</p>
            ) : (
              <p className="muted">Name what the order means. Everyone lines the room up under that title.</p>
            )}
          </div>
        </form>
      ) : null}
      {!named && !host ? <p className="muted order-wait">The host can name what this order means.</p> : null}

      <section className="order-compose" aria-label="Your lineup">
        <header className="order-compose-head">
          <div>
            <h4>{title?.trim() || "Your lineup"}</h4>
            <p>Drag a row, or move people up and down. Share when the order feels right.</p>
          </div>
          <span className="order-count">{order.length}</span>
        </header>

        <ol className="order-list">
          {order.map((id, index) => {
            const person = participants.find((item) => item.id === id);
            const personName = person?.name ?? nameOf(id);
            const label = id === actorId ? "You" : personName;
            const dragging = dragId === id;
            const over = overId === id && dragId != null && dragId !== id;
            return (
              <li
                key={id}
                className={`order-row${dragging ? " dragging" : ""}${over ? " over" : ""}${id === actorId ? " mine" : ""}`}
                draggable
                onDragStart={() => setDragId(id)}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (dragId && dragId !== id) setOverId(id);
                }}
                onDragLeave={() => {
                  if (overId === id) setOverId(null);
                }}
                onDrop={() => dropOn(id)}
              >
                <span className="order-grip" aria-hidden="true">
                  <GripIcon />
                </span>
                <span className="order-rank">{index + 1}</span>
                <span className="order-person">
                  <span
                    className="order-avatar"
                    style={{ background: person?.color ?? "#12141a" }}
                    aria-hidden="true"
                  >
                    {initials(personName)}
                  </span>
                  <span className="order-name">{label}</span>
                </span>
                <span className="order-moves">
                  <button
                    type="button"
                    className="order-move"
                    aria-label={`Move ${label} up`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ChevronUpIcon />
                  </button>
                  <button
                    type="button"
                    className="order-move"
                    aria-label={`Move ${label} down`}
                    disabled={index === order.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ChevronDownIcon />
                  </button>
                </span>
              </li>
            );
          })}
        </ol>

        {note ? (
          <p className="pair-note" role="alert">
            {note}
          </p>
        ) : null}

        <div className="order-compose-foot">
          <button
            type="button"
            className="btn primary"
            disabled={!ready}
            onClick={() => {
              setNote("");
              void send({ type: "retro.answerIcebreaker", body: order.join(",") }).then((ok) => {
                if (!ok) setNote("That order did not save. Try again.");
              });
            }}
          >
            {mine ? "Update lineup" : "Share lineup"}
          </button>
          {!ready && mine ? <p className="muted">Saved — reorder to update.</p> : null}
          {!mine ? <p className="muted">Share to see how everyone else lined the room up.</p> : null}
        </div>
      </section>

      {mine && answers.length > 0 ? (
        <section className="order-room" aria-label="Shared lineups">
          <header className="order-room-head">
            <div className="order-room-copy">
              <p className="eyebrow">Room lineups</p>
              <h4>{title?.trim() || "Shared lineups"}</h4>
              <p>
                {answers.length === 1
                  ? "1 person shared their order."
                  : `${answers.length} people shared their order.`}
              </p>
            </div>
            <span className="order-count" aria-label={`${answers.length} shared`}>
              {answers.length}
            </span>
          </header>
          <ul className="order-room-list">
            {answers.map((answer) => {
              const isMine = answer.authorId === actorId;
              const authorPerson = participants.find((person) => person.id === answer.authorId);
              const authorName = authorPerson?.name ?? nameOf(answer.authorId);
              const author = isMine ? "You" : authorName;
              const ranks = answer.body
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean);
              return (
                <li key={answer.id} className={`order-card${isMine ? " mine" : ""}`}>
                  <div className="order-card-top">
                    <span className="order-card-author">
                      <span
                        className="order-avatar"
                        style={{ background: authorPerson?.color ?? "#12141a" }}
                        aria-hidden="true"
                      >
                        {initials(authorName)}
                      </span>
                      <span className="order-card-author-copy">
                        <strong>{author}</strong>
                        {isMine ? <em>Your lineup</em> : <em>Shared lineup</em>}
                      </span>
                    </span>
                    {isMine ? <span className="order-chip">Yours</span> : null}
                  </div>
                  <ol className="order-card-ranks">
                    {ranks.map((id, index) => {
                      const person = participants.find((item) => item.id === id);
                      const personName = person?.name ?? nameOf(id);
                      const label = id === actorId ? "You" : personName;
                      return (
                        <li key={`${answer.id}-${id}`}>
                          <span className="order-card-place">{index + 1}</span>
                          <span
                            className="order-avatar sm"
                            style={{ background: person?.color ?? "#12141a" }}
                            aria-hidden="true"
                          >
                            {initials(personName)}
                          </span>
                          <em>{label}</em>
                        </li>
                      );
                    })}
                  </ol>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function startingOrder(body: string | undefined, participantIds: string[]): string[] {
  const exact = body ? parsePeopleOrder(body, participantIds) : null;
  if (exact) return exact;
  const previous = (body ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((id) => participantIds.includes(id));
  const rest = participantIds.filter((id) => !previous.includes(id));
  return [...previous, ...rest];
}

function GripIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <circle cx="5.5" cy="4" r="1.1" fill="currentColor" />
      <circle cx="10.5" cy="4" r="1.1" fill="currentColor" />
      <circle cx="5.5" cy="8" r="1.1" fill="currentColor" />
      <circle cx="10.5" cy="8" r="1.1" fill="currentColor" />
      <circle cx="5.5" cy="12" r="1.1" fill="currentColor" />
      <circle cx="10.5" cy="12" r="1.1" fill="currentColor" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        d="M4.2 9.6 8 5.8l3.8 3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        d="M4.2 6.4 8 10.2l3.8-3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
