"use client";

import {
  checklistHow,
  checklistProgress,
  checklistRitual,
  checklistStopwatchMs,
  type FeedbackKind,
  type Op,
  type RoomView,
} from "@cadence/core";
import { useEffect, useState } from "react";
import { initials } from "./identity";
import { formatElapsed } from "./retro-ui";
import { SharedField } from "./shared-field";

const feedbackKinds: { id: FeedbackKind; label: string }[] = [
  { id: "praise", label: "Praise" },
  { id: "change", label: "Change" },
  { id: "question", label: "Question" },
];

export function ReviewBoard({
  room,
  actorId,
  send,
}: {
  room: RoomView;
  actorId: string;
  send: (op: Op) => Promise<boolean>;
}) {
  const review = room.review;
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!review) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [review?.activeSectionId, review?.stopwatchRunningSince, Boolean(review)]);

  if (!review) return null;

  const ritual = checklistRitual(room.kind);
  const decisions = ritual.decisions;
  const progress = checklistProgress(review);
  const ratio = progress.requiredTotal === 0 ? 0 : progress.requiredDone / progress.requiredTotal;
  const percent = Math.round(ratio * 100);
  const activeSection =
    review.sections.find((section) => section.id === (review.activeSectionId || review.sections[0]?.id)) ??
    review.sections[0]!;
  const sectionIndex = Math.max(
    0,
    review.sections.findIndex((section) => section.id === activeSection.id),
  );
  const decisionMeta = decisions.find((item) => item.id === review.decision);
  const how = checklistHow(room.kind, activeSection.id);
  const requiredOpen = progress.requiredTotal - progress.requiredDone;
  const sectionDone = activeSection.items.filter((item) => item.doneBy.length > 0).length;
  const activeElapsed = checklistStopwatchMs(review, activeSection.id, now);

  const goToSection = (sectionId: string) => {
    if (sectionId === activeSection.id) return;
    void send({ type: "review.setSection", sectionId });
  };

  return (
    <div className={`ritual review kind-${room.kind}`}>
      <header className="ritual-hero review-hero">
        <div className="ritual-hero-main">
          <div className="ritual-hero-copy">
            <p className="eyebrow">{ritual.eyebrow}</p>
            <h2>{ritual.headline}</h2>
            <p>{ritual.lede}</p>
          </div>
          <section className="ritual-focus" aria-label={ritual.goalLabel}>
            <div className="ritual-focus-label">
              <span className="eyebrow">{ritual.goalLabel}</span>
              <span>{ritual.goalHint}</span>
            </div>
            <span className="field-shell ritual-focus-shell">
              <SharedField
                value={review.goal}
                onCommit={(goal) => send({ type: "review.setGoal", goal })}
                ariaLabel={ritual.goalLabel}
                placeholder={ritual.goalPlaceholder}
                multiline
                rows={2}
                maxLength={240}
                className="field-control ritual-focus-field"
              />
            </span>
          </section>
        </div>
        <aside className="ritual-hero-aside review-progress" aria-label="Required checklist progress">
          <p className="eyebrow">{ritual.progressLabel}</p>
          <strong className="ritual-hero-stat">{percent}%</strong>
          <div className="review-meter-bar" aria-hidden="true">
            <span style={{ width: `${percent}%` }} />
          </div>
          <ul className="ritual-hero-chips">
            <li>
              <span>Required</span>
              <strong>
                {progress.requiredDone}/{progress.requiredTotal}
              </strong>
            </li>
            <li>
              <span>{requiredOpen > 0 ? "Open" : "Status"}</span>
              <strong>{requiredOpen > 0 ? requiredOpen : "Clear"}</strong>
            </li>
            {decisionMeta ? (
              <li>
                <span>Call</span>
                <strong>{decisionMeta.label}</strong>
              </li>
            ) : null}
          </ul>
        </aside>
      </header>

      <div className="review-layout">
        <div className="review-main">
          <nav
            className="review-steps"
            aria-label="Checklist sections"
            style={{ ["--review-steps" as string]: review.sections.length }}
          >
            {review.sections.map((section, index) => {
              const done = section.items.filter((item) => item.doneBy.length > 0).length;
              const total = section.items.length;
              const requiredLeft = section.items.filter(
                (item) => item.required && item.doneBy.length === 0,
              ).length;
              const complete = requiredLeft === 0 && done > 0;
              const on = section.id === activeSection.id;
              const running = on && Boolean(review.stopwatchRunningSince);
              const elapsed = checklistStopwatchMs(review, section.id, now);
              const stepRatio = total === 0 ? 0 : done / total;
              return (
                <button
                  key={section.id}
                  type="button"
                  className={`review-step${on ? " on" : ""}${complete ? " complete" : ""}${done > 0 && !complete ? " progress" : ""}`}
                  aria-current={on ? "step" : undefined}
                  aria-label={`${section.title}, ${done} of ${total} checked${complete ? ", complete" : ""}, stopwatch ${formatElapsed(elapsed)}`}
                  onClick={() => goToSection(section.id)}
                >
                  <span className="review-step-index" aria-hidden="true">
                    {complete ? (
                      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
                        <path
                          d="M3.5 8.2 6.4 11l6.1-6.5"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </span>
                  <span className="review-step-copy">
                    <span className="review-step-label">{section.title}</span>
                    <span className={`review-step-clock${running ? " on" : ""}`} title="Stopwatch">
                      <StopwatchIcon />
                      <span>{formatElapsed(elapsed)}</span>
                    </span>
                    <span className="review-step-meta">
                      <span className="review-step-meter" aria-hidden="true">
                        <span style={{ width: `${Math.round(stepRatio * 100)}%` }} />
                      </span>
                      <span className="review-step-count">
                        {done}/{total}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          <section className="review-stage" key={activeSection.id}>
            <header className="review-stage-head">
              <div>
                <p className="eyebrow">
                  Step {sectionIndex + 1} of {review.sections.length}
                  {sectionDone === activeSection.items.length
                    ? " · Clear"
                    : ` · ${activeSection.items.length - sectionDone} open`}
                  {" · "}
                  <span className="review-stage-clock" title="Stopwatch">
                    <StopwatchIcon />
                    {formatElapsed(activeElapsed)}
                  </span>
                </p>
                <h3>{activeSection.title}</h3>
                <p>{activeSection.intent}</p>
              </div>
              <div className="review-stage-nav">
                <button
                  type="button"
                  className="btn tiny ghost"
                  disabled={sectionIndex <= 0}
                  onClick={() => goToSection(review.sections[sectionIndex - 1]!.id)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn tiny primary"
                  disabled={sectionIndex >= review.sections.length - 1}
                  onClick={() => goToSection(review.sections[sectionIndex + 1]!.id)}
                >
                  Next section
                </button>
              </div>
            </header>

            {how.length > 0 ? (
              <aside className="review-how" aria-label="How to do it">
                <header className="review-how-head">
                  <div>
                    <p className="eyebrow">How to do it</p>
                    <strong>Work this section in order</strong>
                  </div>
                  <span className="review-how-count">{how.length}</span>
                </header>
                <ol>
                  {how.map((step, index) => (
                    <li key={step}>
                      <span className="review-how-step" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
              </aside>
            ) : null}

            <ul className="review-checks">
              {activeSection.items.map((item) => {
                const mine = item.doneBy.includes(actorId);
                const people = item.doneBy
                  .map((id) => room.participants.find((person) => person.id === id))
                  .filter((person) => person != null);
                const noteOpen = openNotes[item.id] ?? Boolean(item.note);
                return (
                  <li
                    key={item.id}
                    className={`review-check${mine ? " checked" : ""}${item.required ? " required-item" : ""}`}
                  >
                    <div className="check-row">
                      <button
                        type="button"
                        className={mine ? "tick on" : "tick"}
                        aria-pressed={mine}
                        onClick={() => void send({ type: "review.setItemDone", itemId: item.id, done: !mine })}
                      >
                        <span className="sr">{mine ? "Uncheck" : "Check"}</span>
                        {mine ? "✓" : ""}
                      </button>
                      <div className="review-check-copy">
                        <div className="review-check-title">
                          <p>{item.label}</p>
                          {item.required ? <span className="required">Required</span> : null}
                        </div>
                        <p className="muted">{item.detail}</p>
                        <div className="review-check-meta">
                          {people.length > 0 ? (
                            <ul className="who" aria-label="Checked by">
                              {people.map((person) => (
                                <li key={person.id} title={person.name}>
                                  <span className="avatar" style={{ background: person.color }}>
                                    {initials(person.name)}
                                  </span>
                                  <span className="who-name">{person.name}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="review-check-empty">Unchecked</span>
                          )}
                          <button
                            type="button"
                            className={`review-note-toggle${noteOpen || item.note ? " on" : ""}`}
                            aria-expanded={noteOpen}
                            onClick={() =>
                              setOpenNotes((current) => ({ ...current, [item.id]: !noteOpen }))
                            }
                          >
                            {item.note ? `Edit ${ritual.noteLabel.toLowerCase()}` : `Add ${ritual.noteLabel.toLowerCase()}`}
                          </button>
                        </div>
                        {noteOpen ? (
                          <label className="field evidence-field">
                            <span className="field-label">
                              <span>{ritual.noteLabel}</span>
                              <span className="field-hint">Links or caveats</span>
                            </span>
                            <span className="field-shell">
                              <SharedField
                                value={item.note}
                                onCommit={(note) => send({ type: "review.setItemNote", itemId: item.id, note })}
                                ariaLabel={`Note for ${item.label}`}
                                placeholder={ritual.notePlaceholder}
                                maxLength={800}
                                className="field-control"
                                rows={2}
                              />
                            </span>
                          </label>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <AddItem sectionId={activeSection.id} send={send} />
          </section>
        </div>

        <aside className="review-side">
          <section className="review-outcome">
            <header className="review-outcome-head">
              <p className="eyebrow">{ritual.decisionHeading}</p>
              <h2>{decisionMeta ? decisionMeta.label : "Not called"}</h2>
              <p>{decisionMeta ? decisionMeta.detail : ritual.decisionIdle}</p>
            </header>
            <div className="decision-pills" role="radiogroup" aria-label={ritual.decisionHeading}>
              {decisions.map((decision) => (
                <button
                  key={decision.id}
                  type="button"
                  className={review.decision === decision.id ? `decision-pill on ${decision.id}` : `decision-pill ${decision.id}`}
                  aria-pressed={review.decision === decision.id}
                  onClick={() =>
                    void send({
                      type: "review.setDecision",
                      decision: review.decision === decision.id ? null : decision.id,
                    })
                  }
                >
                  {decision.label}
                </button>
              ))}
            </div>
            <label className="field">
              <span className="field-label">
                <span>{ritual.decisionNotesLabel}</span>
                <span className="field-hint">Optional</span>
              </span>
              <span className="field-shell">
                <SharedField
                  value={review.decisionNotes}
                  onCommit={(notes) => send({ type: "review.setDecisionNotes", notes })}
                  ariaLabel="Decision notes"
                  placeholder={ritual.decisionNotesPlaceholder}
                  multiline
                  rows={3}
                  maxLength={2000}
                  className="field-control"
                />
              </span>
            </label>
          </section>

          <section className="review-feedback">
            <header className="review-outcome-head">
              <p className="eyebrow">Live feedback</p>
              <h2>{review.feedback.length || "None"} yet</h2>
              <p>{ritual.feedbackLede}</p>
            </header>
            <FeedbackComposer send={send} placeholder={ritual.feedbackLede} />
            {review.feedback.length === 0 ? (
              <div className="review-empty">
                <p>No feedback yet</p>
                <span>{ritual.feedbackEmpty}</span>
              </div>
            ) : (
              <ul className="feedback">
                {review.feedback.map((note) => {
                  const author = room.participants.find((person) => person.id === note.authorId);
                  const kind = feedbackKinds.find((item) => item.id === note.kind);
                  return (
                    <li key={note.id} className={`kind-${note.kind}`}>
                      <header>
                        <span>{kind?.label ?? note.kind}</span>
                        <span>{author?.name ?? "Someone"}</span>
                      </header>
                      <p>{note.body}</p>
                      <button
                        type="button"
                        className="btn tiny ghost"
                        onClick={() => void send({ type: "review.deleteFeedback", feedbackId: note.id })}
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function AddItem({ sectionId, send }: { sectionId: string; send: (op: Op) => Promise<boolean> }) {
  const [label, setLabel] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <form
      className="review-add field"
      onSubmit={async (event) => {
        event.preventDefault();
        const text = label.trim();
        if (!text || pending) return;
        setPending(true);
        const saved = await send({ type: "review.addItem", sectionId, label: text });
        if (saved) setLabel("");
        setPending(false);
      }}
    >
      <span className="field-label">
        <span>Add a check</span>
        <span className="field-hint">Custom for this section</span>
      </span>
      <div className="field-shell inline">
        <span className="field-affordance" aria-hidden="true">
          +
        </span>
        <input
          className="field-control"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          aria-label="Add a checklist item"
          placeholder="e.g. Analytics events verified in staging"
          maxLength={180}
        />
        <button type="submit" className="btn tiny primary" disabled={pending || !label.trim()}>
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
    </form>
  );
}

function FeedbackComposer({ send, placeholder }: { send: (op: Op) => Promise<boolean>; placeholder: string }) {
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<FeedbackKind>("change");
  const [pending, setPending] = useState(false);
  return (
    <form
      className="feedback-composer"
      onSubmit={async (event) => {
        event.preventDefault();
        const text = body.trim();
        if (!text || pending) return;
        setPending(true);
        const saved = await send({ type: "review.addFeedback", body: text, kind });
        if (saved) setBody("");
        setPending(false);
      }}
    >
      <div className="feedback-kinds" role="radiogroup" aria-label="Feedback type">
        {feedbackKinds.map((item) => (
          <button
            key={item.id}
            type="button"
            className={kind === item.id ? `on kind-${item.id}` : `kind-${item.id}`}
            aria-pressed={kind === item.id}
            onClick={() => setKind(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="field">
        <span className="field-label">
          <span>Your note</span>
          <span className="field-hint">{body.length}/500</span>
        </span>
        <span className="field-shell">
          <textarea
            className="field-control"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            aria-label="Feedback"
            placeholder={placeholder}
            rows={3}
            maxLength={500}
          />
        </span>
      </label>
      <button type="submit" className="btn primary" disabled={pending || !body.trim()}>
        {pending ? "Adding…" : "Add feedback"}
      </button>
    </form>
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
