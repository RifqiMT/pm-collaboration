"use client";

import { checklistProgress, type FeedbackKind, type Op, type ReviewDecision, type RoomView } from "@cadence/core";
import { useState } from "react";
import { initials } from "./identity";
import { SharedField } from "./shared-field";

const decisions: { id: ReviewDecision; label: string; detail: string }[] = [
  { id: "ship", label: "Ship", detail: "Fit to release." },
  { id: "iterate", label: "Iterate", detail: "Direction is right; slice is not done." },
  { id: "hold", label: "Hold", detail: "Close the gaps first." },
];

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
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});
  if (!review) return null;

  const progress = checklistProgress(review);
  const ratio = progress.requiredTotal === 0 ? 0 : progress.requiredDone / progress.requiredTotal;
  const percent = Math.round(ratio * 100);
  const activeSection =
    review.sections.find((section) => section.id === (activeSectionId ?? review.sections[0]?.id)) ??
    review.sections[0]!;
  const sectionIndex = Math.max(
    0,
    review.sections.findIndex((section) => section.id === activeSection.id),
  );
  const decisionMeta = decisions.find((item) => item.id === review.decision);
  const requiredOpen = progress.requiredTotal - progress.requiredDone;
  const sectionDone = activeSection.items.filter((item) => item.doneBy.length > 0).length;

  return (
    <div className="ritual review">
      <header className="ritual-hero review-hero">
        <div className="ritual-hero-main">
          <div className="ritual-hero-copy">
            <p className="eyebrow">Sprint review</p>
            <h2>Walk the increment. Leave with a call.</h2>
            <p>Check the bar together, capture evidence, then make the ship call.</p>
          </div>
          <section className="ritual-focus" aria-label="Sprint goal">
            <div className="ritual-focus-label">
              <span className="eyebrow">Sprint goal</span>
              <span>Visible for the whole room</span>
            </div>
            <span className="field-shell ritual-focus-shell">
              <SharedField
                value={review.goal}
                onCommit={(goal) => send({ type: "review.setGoal", goal })}
                ariaLabel="Sprint goal"
                placeholder="What should be true when this review ends?"
                multiline
                rows={2}
                maxLength={240}
                className="field-control ritual-focus-field"
              />
            </span>
          </section>
        </div>
        <aside className="ritual-hero-aside review-progress" aria-label="Required checklist progress">
          <p className="eyebrow">Checklist bar</p>
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
          <nav className="review-steps" aria-label="Review sections">
            {review.sections.map((section, index) => {
              const done = section.items.filter((item) => item.doneBy.length > 0).length;
              const requiredLeft = section.items.filter(
                (item) => item.required && item.doneBy.length === 0,
              ).length;
              const complete = requiredLeft === 0 && done > 0;
              const on = section.id === activeSection.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  className={`review-step${on ? " on" : ""}${complete ? " complete" : ""}`}
                  aria-current={on ? "step" : undefined}
                  onClick={() => setActiveSectionId(section.id)}
                >
                  <span className="review-step-index" aria-hidden="true">
                    {complete ? "✓" : index + 1}
                  </span>
                  <span className="review-step-label">{section.title}</span>
                  <span className="review-step-count">
                    {done}/{section.items.length}
                  </span>
                </button>
              );
            })}
          </nav>

          <section className="review-stage" key={activeSection.id}>
            <header className="review-stage-head">
              <div>
                <p className="eyebrow">
                  {sectionIndex + 1} / {review.sections.length} · {sectionDone}/{activeSection.items.length} checked
                </p>
                <h3>{activeSection.title}</h3>
                <p>{activeSection.intent}</p>
              </div>
              <div className="review-stage-nav">
                <button
                  type="button"
                  className="btn tiny ghost"
                  disabled={sectionIndex <= 0}
                  onClick={() => setActiveSectionId(review.sections[sectionIndex - 1]!.id)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn tiny primary"
                  disabled={sectionIndex >= review.sections.length - 1}
                  onClick={() => setActiveSectionId(review.sections[sectionIndex + 1]!.id)}
                >
                  Next section
                </button>
              </div>
            </header>

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
                            {item.note ? "Edit evidence" : "Add evidence"}
                          </button>
                        </div>
                        {noteOpen ? (
                          <label className="field evidence-field">
                            <span className="field-label">
                              <span>Evidence</span>
                              <span className="field-hint">Links or caveats</span>
                            </span>
                            <span className="field-shell">
                              <SharedField
                                value={item.note}
                                onCommit={(note) => send({ type: "review.setItemNote", itemId: item.id, note })}
                                ariaLabel={`Note for ${item.label}`}
                                placeholder="Paste a link, metric, or caveat"
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
              <p className="eyebrow">Release decision</p>
              <h2>{decisionMeta ? decisionMeta.label : "Not called"}</h2>
              <p>{decisionMeta ? decisionMeta.detail : "Pick one before people leave."}</p>
            </header>
            <div className="decision-pills" role="radiogroup" aria-label="Release decision">
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
                <span>Decision notes</span>
                <span className="field-hint">Optional</span>
              </span>
              <span className="field-shell">
                <SharedField
                  value={review.decisionNotes}
                  onCommit={(notes) => send({ type: "review.setDecisionNotes", notes })}
                  ariaLabel="Decision notes"
                  placeholder="What did the room agree, and what is still open?"
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
              <p>Write it down before the call ends.</p>
            </header>
            <FeedbackComposer send={send} />
            {review.feedback.length === 0 ? (
              <div className="review-empty">
                <p>No feedback yet</p>
                <span>Praise, change, or a question for the next sprint.</span>
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

function FeedbackComposer({ send }: { send: (op: Op) => Promise<boolean> }) {
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
            placeholder="What should the team hear before this review ends?"
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
