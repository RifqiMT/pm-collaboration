"use client";

import {
  DIRECTION_FRAMEWORKS,
  directionFramework,
  directionParts,
  directionReadback,
  type DirectionFrameworkId,
  type Op,
  type RoomView,
} from "@cadence/core";
import { useEffect, useId, useState } from "react";
import { SharedField } from "./shared-field";

function groupReadbackRows(
  rows: { label: string; text: string; part?: string }[],
): { title: string; rows: { label: string; text: string; part?: string }[] }[] {
  const groups: { title: string; rows: { label: string; text: string; part?: string }[] }[] = [];
  for (const row of rows) {
    const title = row.part ?? "Readback";
    const last = groups[groups.length - 1];
    if (last && last.title === title) last.rows.push(row);
    else groups.push({ title, rows: [row] });
  }
  return groups;
}

export function DirectionBoard({
  room,
  send,
}: {
  room: RoomView;
  send: (op: Op) => Promise<boolean>;
}) {
  const direction = room.direction;
  const howId = useId();
  const [howOpen, setHowOpen] = useState(false);
  const [activePart, setActivePart] = useState(0);
  const frameworkId = direction?.framework ?? "vision-board";
  const framework = directionFramework(frameworkId);
  const filledCount = direction
    ? framework.fields.filter((field) => (direction.answers[field.id] ?? "").trim().length > 0).length
    : 0;

  useEffect(() => {
    setActivePart(0);
    setHowOpen(false);
  }, [frameworkId]);

  if (!direction) return null;

  const readback = directionReadback(direction);
  const parts = directionParts(framework);
  const readbackGroups = readback.mode === "rows" ? groupReadbackRows(readback.rows) : [];
  const fields = framework.fields;
  const filled = filledCount;
  const total = fields.length;
  const percent = total === 0 ? 0 : Math.round((filled / total) * 100);
  const open = Math.max(0, total - filled);
  const isVision = framework.group === "vision";
  const safePart = Math.min(activePart, Math.max(0, parts.length - 1));
  const visionFrameworks = DIRECTION_FRAMEWORKS.filter((item) => item.group === "vision");
  const strategyFrameworks = DIRECTION_FRAMEWORKS.filter((item) => item.group === "strategy");

  const setFramework = (id: DirectionFrameworkId) => {
    if (id === direction.framework) return;
    void send({ type: "direction.setFramework", framework: id });
  };

  const partProgress = parts.map((part) => {
    const partFilled = part.fields.filter((field) => (direction.answers[field.id] ?? "").trim()).length;
    return {
      label: part.part || "Prompts",
      filled: partFilled,
      total: part.fields.length,
      complete: part.fields.length > 0 && partFilled === part.fields.length,
    };
  });

  return (
    <div className={`ritual direction tone-${framework.group}`}>
      <header className="direction-masthead">
        <div className="direction-masthead-copy">
          <p className="eyebrow">Product direction</p>
          <h2>{isVision ? "Aim the product." : "Choose how you win."}</h2>
          <p>
            Pick a framework, write the prompts together, and read the direction back as one statement the room can
            keep.
          </p>
        </div>
        <div className="direction-meter" aria-label="Board fill">
          <div className="direction-meter-ring" aria-hidden="true">
            <svg viewBox="0 0 72 72">
              <circle className="direction-meter-track" cx="36" cy="36" r="30" />
              <circle
                className="direction-meter-progress"
                cx="36"
                cy="36"
                r="30"
                style={{ strokeDasharray: `${(percent / 100) * 188.4} 188.4` }}
              />
            </svg>
            <strong>{percent}%</strong>
          </div>
          <ul>
            <li>
              <span>Filled</span>
              <strong>
                {filled}/{total}
              </strong>
            </li>
            <li>
              <span>{open > 0 ? "Open" : "Status"}</span>
              <strong>{open > 0 ? open : "Clear"}</strong>
            </li>
            <li>
              <span>Shelf</span>
              <strong>{isVision ? "Vision" : "Strategy"}</strong>
            </li>
          </ul>
        </div>
      </header>

      <nav className="direction-rail" aria-label="Frameworks">
        <div className="direction-rail-group">
          <p className="eyebrow">Vision</p>
          <div className="direction-rail-track" role="radiogroup" aria-label="Product vision frameworks">
            {visionFrameworks.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`direction-rail-item${direction.framework === item.id ? " on" : ""}`}
                aria-pressed={direction.framework === item.id}
                onClick={() => setFramework(item.id)}
              >
                <strong>{item.name}</strong>
                <span>{item.source}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="direction-rail-group">
          <p className="eyebrow">Strategy</p>
          <div className="direction-rail-track" role="radiogroup" aria-label="Product strategy frameworks">
            {strategyFrameworks.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`direction-rail-item${direction.framework === item.id ? " on" : ""}`}
                aria-pressed={direction.framework === item.id}
                onClick={() => setFramework(item.id)}
              >
                <strong>{item.name}</strong>
                <span>{item.source}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="direction-stage">
        <div className="direction-studio">
          <header className="direction-studio-head">
            <div>
              <p className="eyebrow">{framework.source}</p>
              <h3>{framework.name}</h3>
              <p>{framework.summary}</p>
            </div>
            <span className="direction-shelf-pill">{isVision ? "Vision" : "Strategy"}</span>
          </header>

          {framework.how.length > 0 ? (
            <div className="direction-guide">
              <button
                type="button"
                className={`direction-guide-toggle${howOpen ? " open" : ""}`}
                aria-expanded={howOpen}
                aria-controls={howId}
                onClick={() => setHowOpen((value) => !value)}
              >
                <span>
                  <span className="eyebrow">How to do it</span>
                  <strong>{howOpen ? "Hide facilitation steps" : "Show facilitation steps"}</strong>
                </span>
                <em aria-hidden="true">{howOpen ? "−" : "+"}</em>
              </button>
              {howOpen ? (
                <ol id={howId} className="direction-guide-list">
                  {framework.how.map((step, index) => (
                    <li key={step}>
                      <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          ) : null}

          {parts.length > 1 ? (
            <div className="direction-chapters" role="tablist" aria-label="Framework parts">
              {partProgress.map((part, index) => (
                <button
                  key={`${part.label}-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={safePart === index}
                  className={`direction-chapter${safePart === index ? " on" : ""}${part.complete ? " complete" : ""}`}
                  onClick={() => {
                    setActivePart(index);
                    document.getElementById(`direction-part-${index}`)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                >
                  <span className="direction-chapter-index" aria-hidden="true">
                    {part.complete ? (
                      <svg viewBox="0 0 16 16" width="11" height="11" fill="none">
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
                  <span className="direction-chapter-copy">
                    <strong>{part.label}</strong>
                    <span>
                      {part.filled}/{part.total}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="direction-chapters-body">
            {parts.map((part, index) => {
              const progress = partProgress[index]!;
              return (
                <section
                  key={part.part || `part-${index}`}
                  id={`direction-part-${index}`}
                  className={`direction-part${safePart === index ? " focus" : ""}`}
                >
                  {part.part ? (
                    <header className="direction-part-head">
                      <div>
                        <p className="eyebrow">Part {String(index + 1).padStart(2, "0")}</p>
                        <h4>{part.part}</h4>
                      </div>
                      <span className={progress.complete ? "ok" : ""}>
                        {progress.filled}/{progress.total} filled
                      </span>
                    </header>
                  ) : null}
                  <div className="direction-fields">
                    {part.fields.map((field) => {
                      const value = direction.answers[field.id] ?? "";
                      const hasValue = value.trim().length > 0;
                      return (
                        <label
                          key={field.id}
                          className={`field direction-field${hasValue ? " filled" : ""}`}
                        >
                          <span className="field-label">
                            <span>{field.label}</span>
                            <span className={`direction-field-status${hasValue ? " on" : ""}`}>
                              {hasValue ? "Filled" : "Open"}
                            </span>
                          </span>
                          <p className="muted">{field.prompt}</p>
                          <span className="field-shell">
                            <SharedField
                              value={value}
                              onCommit={(next) =>
                                send({ type: "direction.setAnswer", fieldId: field.id, value: next })
                              }
                              ariaLabel={field.label}
                              placeholder={field.placeholder}
                              multiline
                              rows={3}
                              maxLength={800}
                              className="field-control"
                            />
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <aside className="direction-canvas" aria-label="Direction statement">
          <header className="direction-canvas-head">
            <div>
              <p className="eyebrow">Live readback</p>
              <h3>{framework.name}</h3>
            </div>
            <span className="direction-canvas-fill">{percent}%</span>
          </header>

          {readback.mode === "empty" ? (
            <div className="direction-canvas-empty">
              <strong>Nothing to read back yet</strong>
              <p>Fill the prompts on the left. Each answer lands here as a clear beat the room can say aloud.</p>
            </div>
          ) : null}

          {readback.mode === "prose" ? (
            <blockquote className="direction-canvas-prose">
              <p>{readback.text}</p>
            </blockquote>
          ) : null}

          {readback.mode === "rows" ? (
            <div className="direction-canvas-scroll">
              {readbackGroups.map((group, groupIndex) => (
                <section key={`${group.title}-${groupIndex}`} className="direction-canvas-group">
                  {readbackGroups.length > 1 ? (
                    <p className="direction-canvas-group-label">{group.title}</p>
                  ) : null}
                  <ul className="direction-canvas-beats">
                    {group.rows.map((row, rowIndex) => {
                      const featured = groupIndex === 0 && rowIndex === 0;
                      return (
                        <li
                          key={`${row.label}-${rowIndex}`}
                          className={`direction-canvas-beat${featured ? " featured" : ""}`}
                          style={{ animationDelay: `${Math.min(groupIndex * 4 + rowIndex, 10) * 35}ms` }}
                        >
                          <span className="direction-canvas-beat-label">{row.label}</span>
                          <p>{row.text}</p>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          ) : null}

          <footer className="direction-canvas-foot">
            <p>
              {filled === 0
                ? "Answers appear here as the room fills the prompts."
                : open === 0
                  ? "Ready to read back with the room."
                  : `${open} prompt${open === 1 ? "" : "s"} still open.`}
            </p>
            <span>
              {isVision ? "Vision" : "Strategy"} · {framework.source}
            </span>
          </footer>
        </aside>
      </div>
    </div>
  );
}
