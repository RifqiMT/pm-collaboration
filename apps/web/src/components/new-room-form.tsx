"use client";

import { RETRO_TEMPLATE_GROUPS, RETRO_TEMPLATES, RITUALS, retroColumnCounts, searchRetroTemplates, type RetroTemplateGroup, type RetroTemplateId, type RoomKind } from "@cadence/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { readIdentity, writeIdentity } from "./identity";
import { RetroGlyph } from "./retro-glyphs";

const titles: Record<RoomKind, string> = {
  retro: "Sprint retrospective",
  planning: "Sprint planning",
  refinement: "Backlog refinement",
  review: "Sprint review",
  roadmap: "Roadmap bets",
  direction: "Product direction",
  prd: "Product requirements",
  artifacts: "Artifact examples",
};

const stepHint: Record<Exclude<RoomKind, "retro">, Record<string, string>> = {
  planning: {
    Why: "Say why this Sprint is worth doing. Write that as the Sprint Goal.",
    What: "Pull only what the team can finish to Done this Sprint.",
    How: "Plan the first few days. The team owns that plan.",
    Forecast: "Sprint Goal + selected work + early plan. That is the Sprint Backlog.",
  },
  refinement: {
    Detail: "Who is it for, what changes, and how will you know it worked?",
    Split: "If it won't fit in one Sprint, cut it into smaller slices.",
    Size: "Compare it with work the team has already finished.",
    Order: "Put the most valuable ready work near the top.",
  },
  review: {
    "Sprint Goal": "Start with the goal. Did you meet it?",
    Increment: "Show only work that meets the Definition of Done.",
    Stakeholders: "Invite people who can judge the outcome.",
    Adapt: "Update the backlog before everyone leaves.",
  },
  roadmap: {
    Outcome: "Keep the business result on the same card as the score.",
    Score: "Use RICE, ICE, or value ÷ complexity.",
    Complexity: "How hard is it: tech, dependencies, unknowns?",
    Sequence: "A high score with high complexity is a bet to sequence, not Monday's task.",
  },
  direction: {
    Vision: "Where you're headed — a vision board or positioning sentence.",
    Strategy: "How you'll get there — choices, trade-offs, and what must be true.",
    Statement: "Read the answers back as one direction the team can repeat.",
  },
  prd: {
    Product: "Who needs this, what success looks like, and how you'll check it.",
    Business: "Why it matters, what early signal to watch, and the smallest test.",
    Technical: "What Done means, limits you must keep, and enabling work.",
  },
  artifacts: {
    PRD: "One clear requirement: people, business case, and build quality.",
    "Lean Business Case": "Should we fund the smallest test? Scope, signals, and priority.",
    Epics: "The big bet and the tech work that unlocks the first test.",
    Features: "A mid-size slice: benefit, acceptance, and the stories inside it.",
    "User stories": "Small user-facing slices with clear acceptance checks.",
    "Product Backlog": "The product goal, then one ordered list of work.",
    "Sprint Backlog": "This Sprint's goal, the work pulled in, and the early plan.",
    Increment: "What is finished and usable, and the quality bar that made it Done.",
  },
};

const exampleNote: Record<RoomKind, string> = {
  retro: "Fills this shape with ten notes in every column.",
  planning: "Fills the checklist with a Sprint Goal and a forecast.",
  refinement: "Fills the checklist with items that are selectable, split, or returned.",
  review: "Fills the checklist with evidence on the Increment and a release call.",
  roadmap: "Fills the board with ten scored bets.",
  direction: "Fills the vision and strategy for the Unified Agent Platform.",
  prd: "Fills the requirement for the user, the business hypothesis, and the technical bar.",
  artifacts: "Opens the Contact Center Sprint Backlog. Switch product and artifact inside the room.",
};

const kindBlurb: Record<RoomKind, string> = {
  retro: "Warm up, write notes, discuss, vote, and assign next steps.",
  planning: "Sprint Goal first. Selected work is a forecast, not a promise.",
  refinement: "Add detail and order now. Don't start the Sprint here.",
  review: "Demo what is Done, then decide release, adapt, or hold.",
  roadmap: "Put outcome, score, and difficulty on one card.",
  direction: "Fill a published framework, then read it back as one statement.",
  prd: "Cover who it helps, why the business cares, and what Done means.",
  artifacts: "Switch product and document type. Same guest journey, three platforms.",
};

export function NewRoomForm({ initialKind }: { initialKind: RoomKind }) {
  const router = useRouter();
  const [kind, setKind] = useState<RoomKind>(initialKind);
  const [name, setName] = useState("");
  const [title, setTitle] = useState(titles[initialKind]);
  const [templateId, setTemplateId] = useState<RetroTemplateId>("start-stop-continue");
  const [shapeQuery, setShapeQuery] = useState("");
  const [shapeGroup, setShapeGroup] = useState<RetroTemplateGroup | "">("");
  const [shapeColumns, setShapeColumns] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const ritual = RITUALS.find((item) => item.kind === kind) ?? RITUALS[0]!;
  const selectedTemplate = RETRO_TEMPLATES[templateId];
  const columnCounts = useMemo(() => retroColumnCounts(), []);
  const visibleTemplates = useMemo(
    () =>
      searchRetroTemplates(shapeQuery, {
        group: shapeGroup || undefined,
        columns: shapeColumns ?? undefined,
      }),
    [shapeQuery, shapeGroup, shapeColumns],
  );

  useEffect(() => {
    const saved = readIdentity();
    if (saved?.name) setName(saved.name);
  }, []);

  async function create(demo: boolean) {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          title: kind === "artifacts" ? titles.artifacts : title.trim() || titles[kind],
          hostName: name.trim(),
          hostId: readIdentity()?.id,
          templateId: kind === "retro" ? templateId : undefined,
          demo,
        }),
      });
      const data = await readResponse(response);
      const room = data.room as { code?: string } | undefined;
      const participant = data.participant as { id?: string; name?: string } | undefined;
      if (!response.ok || !room?.code || !participant?.id || !participant.name) {
        setError(typeof data.error === "string" ? data.error : "Could not create the room.");
        return;
      }
      writeIdentity({ id: participant.id, name: participant.name });
      router.push(`/r/${room.code}`);
    } catch (createError) {
      console.error("[cadence] create failed", {
        message: createError instanceof Error ? createError.message : "unknown",
      });
      setError("Could not reach TeamCompass. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={`setup kind-${kind}`} id="main">
      <header className="setup-bar">
        <Link href="/" className="wordmark">
          TeamCompass
        </Link>
        <Link href="/" className="btn ghost tiny">
          Back
        </Link>
      </header>

      <div className="setup-shell">
        <aside className="setup-rail">
          <div className="setup-rail-copy">
            <p className="eyebrow">New {ritual.name.toLowerCase()}</p>
            <h1>{ritual.promise}</h1>
            <p className="setup-lead">{kindBlurb[kind]}</p>
          </div>

          <form
            className="setup-form"
            onSubmit={(event) => {
              event.preventDefault();
              void create(false);
            }}
          >
            <div className="setup-kinds" role="radiogroup" aria-label="Room type">
              {RITUALS.map((item) => (
                <button
                  key={item.kind}
                  type="button"
                  className={`setup-kind${kind === item.kind ? " on" : ""}`}
                  aria-pressed={kind === item.kind}
                  onClick={() => {
                    setKind(item.kind);
                    setTitle((current) => (Object.values(titles).includes(current) ? titles[item.kind] : current));
                  }}
                >
                  <strong>{item.name}</strong>
                  <span>{kindBlurb[item.kind]}</span>
                </button>
              ))}
            </div>

            <label className="field">
              <span className="field-label">
                <span>Your name</span>
              </span>
              <span className="field-shell">
                <input
                  className="field-control"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={40}
                  required
                  autoFocus
                  placeholder="How the room should show you"
                />
              </span>
            </label>

            {kind === "artifacts" ? null : (
              <label className="field">
                <span className="field-label">
                  <span>Session title</span>
                </span>
                <span className="field-shell">
                  <input
                    className="field-control"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={80}
                    required
                    placeholder={titles[kind]}
                  />
                </span>
              </label>
            )}

            {kind === "retro" ? (
              <div className="setup-selected" aria-live="polite">
                <p className="eyebrow">Selected shape</p>
                <strong>{selectedTemplate.name}</strong>
                <span>{selectedTemplate.blurb}</span>
                <ol>
                  {selectedTemplate.columns.map((column) => (
                    <li key={column.id} className={`tone-${column.tone}`}>
                      <RetroGlyph templateId={templateId} columnId={column.id} />
                      {column.title}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {error ? (
              <p className="setup-error" role="alert">
                {error}
              </p>
            ) : null}

            {kind === "artifacts" ? (
              <div className="setup-actions">
                <button type="submit" className="btn primary" disabled={pending}>
                  {pending ? "Opening…" : "Open the examples"}
                </button>
              </div>
            ) : (
              <>
                <div className="setup-actions">
                  <button type="submit" className="btn primary" disabled={pending}>
                    {pending ? "Creating…" : "Create an empty room"}
                  </button>
                  <button type="button" className="btn ghost" disabled={pending} onClick={() => void create(true)}>
                    Start from an example
                  </button>
                </div>
                <p className="muted setup-note">{exampleNote[kind]}</p>
              </>
            )}
          </form>
        </aside>

        {kind === "retro" ? (
          <section className="setup-stage" aria-label="Retrospective shape">
            <header className="setup-stage-head">
              <p className="eyebrow">Board shape</p>
              <h2>Choose a shape</h2>
              <p>Pick the columns the team writes on. Notes can still move later.</p>
            </header>

            <div className="shape-finder" aria-label="Filter shapes">
              <div className={`shape-finder-top${shapeQuery ? " has-query" : ""}`}>
                <label className="shape-search" htmlFor="shape-search-input">
                  <span className="shape-search-icon" aria-hidden="true">
                    <svg viewBox="0 0 20 20" width="18" height="18" focusable="false">
                      <circle cx="8.5" cy="8.5" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.7" />
                      <path
                        d="M12.4 12.4 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span className="shape-search-field">
                    <span className="shape-search-label">Search shapes</span>
                    <input
                      id="shape-search-input"
                      className="shape-search-input"
                      value={shapeQuery}
                      onChange={(event) => setShapeQuery(event.target.value)}
                      placeholder="Name, column, or theme"
                      aria-label="Search retrospective shapes"
                      maxLength={80}
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </span>
                  {shapeQuery ? (
                    <button
                      type="button"
                      className="shape-search-clear"
                      aria-label="Clear search"
                      onClick={() => setShapeQuery("")}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  ) : null}
                  <p className="shape-finder-count" aria-live="polite">
                    <strong>{visibleTemplates.length}</strong>
                    <span>{visibleTemplates.length === 1 ? "match" : "matches"}</span>
                  </p>
                </label>
              </div>

              <div className="shape-filters">
                <div className="shape-filter-block">
                  <span className="shape-filter-label" id="shape-theme-label">
                    Theme
                  </span>
                  <div className="shape-chip-row" role="group" aria-labelledby="shape-theme-label">
                    <button
                      type="button"
                      className={shapeGroup === "" ? "shape-chip on" : "shape-chip"}
                      aria-pressed={shapeGroup === ""}
                      onClick={() => setShapeGroup("")}
                    >
                      All
                    </button>
                    {RETRO_TEMPLATE_GROUPS.map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        className={shapeGroup === group.id ? "shape-chip on" : "shape-chip"}
                        aria-pressed={shapeGroup === group.id}
                        onClick={() => setShapeGroup((current) => (current === group.id ? "" : group.id))}
                      >
                        {group.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="shape-filter-block columns">
                  <span className="shape-filter-label" id="shape-columns-label">
                    Columns
                  </span>
                  <div className="shape-segment" role="group" aria-labelledby="shape-columns-label">
                    <button
                      type="button"
                      className={shapeColumns == null ? "on" : ""}
                      aria-pressed={shapeColumns == null}
                      onClick={() => setShapeColumns(null)}
                    >
                      Any
                    </button>
                    {columnCounts.map((count) => (
                      <button
                        key={count}
                        type="button"
                        className={shapeColumns === count ? "on" : ""}
                        aria-pressed={shapeColumns === count}
                        onClick={() => setShapeColumns((current) => (current === count ? null : count))}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {shapeQuery || shapeGroup || shapeColumns != null ? (
                <div className="shape-active">
                  <div className="shape-active-tags">
                    {shapeQuery ? (
                      <button type="button" className="shape-tag" onClick={() => setShapeQuery("")}>
                        “{shapeQuery.trim()}”
                        <span aria-hidden="true">×</span>
                      </button>
                    ) : null}
                    {shapeGroup ? (
                      <button type="button" className="shape-tag" onClick={() => setShapeGroup("")}>
                        {RETRO_TEMPLATE_GROUPS.find((group) => group.id === shapeGroup)?.title ?? shapeGroup}
                        <span aria-hidden="true">×</span>
                      </button>
                    ) : null}
                    {shapeColumns != null ? (
                      <button type="button" className="shape-tag" onClick={() => setShapeColumns(null)}>
                        {shapeColumns} columns
                        <span aria-hidden="true">×</span>
                      </button>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="shape-reset"
                    onClick={() => {
                      setShapeQuery("");
                      setShapeGroup("");
                      setShapeColumns(null);
                    }}
                  >
                    Clear all
                  </button>
                </div>
              ) : null}
            </div>

            {visibleTemplates.length === 0 ? (
              <div className="shape-empty">
                <p>No shapes match</p>
                <span>Try another theme, column count, or clear the search.</span>
                <button
                  type="button"
                  className="btn tiny"
                  onClick={() => {
                    setShapeQuery("");
                    setShapeGroup("");
                    setShapeColumns(null);
                  }}
                >
                  Show all shapes
                </button>
              </div>
            ) : null}
            {RETRO_TEMPLATE_GROUPS.map((group) => {
              const shapes = visibleTemplates.filter((id) => (RETRO_TEMPLATES[id].group ?? "classic") === group.id);
              if (shapes.length === 0) return null;
              return (
                <div key={group.id} className="shape-group">
                  <header className="shape-group-head">
                    <div>
                      <h3>{group.title}</h3>
                      <p>{group.note}</p>
                    </div>
                    <span className="shape-group-count">{shapes.length}</span>
                  </header>
                  <div className="shape-grid" role="radiogroup" aria-label={`${group.title} retrospective shapes`}>
                    {shapes.map((id, index) => {
                      const template = RETRO_TEMPLATES[id];
                      const selected = templateId === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          className={selected ? "shape on" : "shape"}
                          style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
                          onClick={() => setTemplateId(id)}
                        >
                          <span className="shape-top">
                            <strong>{template.name}</strong>
                            <span className={`shape-check${selected ? " on" : ""}`} aria-hidden="true">
                              {selected ? "✓" : ""}
                            </span>
                          </span>
                          <span className="shape-blurb">{template.blurb}</span>
                          <ol>
                            {template.columns.map((column) => (
                              <li key={column.id} className={`tone-${column.tone}`}>
                                <RetroGlyph templateId={id} columnId={column.id} />
                                {column.title}
                              </li>
                            ))}
                          </ol>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        ) : (
          <section className="setup-stage" aria-label="What the room includes">
            <header className="setup-stage-head">
              <p className="eyebrow">Room flow</p>
              <h2>What the room includes</h2>
              <p>Same board for everyone with the code — {ritual.steps.length} shared steps.</p>
            </header>
            <ol className="setup-steps">
              {ritual.steps.map((step, index) => (
                <li key={step} style={{ animationDelay: `${index * 40}ms` }}>
                  <span className="setup-step-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="setup-step-copy">
                    <strong>{step}</strong>
                    <p>{stepHint[kind][step]}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </main>
  );
}

async function readResponse(response: Response): Promise<Record<string, unknown>> {
  try {
    const data = (await response.json()) as unknown;
    if (data && typeof data === "object") return data as Record<string, unknown>;
  } catch (error) {
    console.error("[cadence] response was not JSON", {
      status: response.status,
      message: error instanceof Error ? error.message : "unknown",
    });
  }
  return {};
}
