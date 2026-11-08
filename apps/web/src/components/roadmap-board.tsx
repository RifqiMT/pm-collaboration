"use client";

import {
  FRAMEWORKS,
  HIGH_COMPLEXITY,
  IMPACT_OPTIONS,
  QUADRANT_LABEL,
  formatScore,
  medianScore,
  scoreRoadmap,
  type FrameworkId,
  type Horizon,
  type Initiative,
  type InitiativePatch,
  type Op,
  type Quadrant,
  type RoomView,
  type ScoredInitiative,
} from "@cadence/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { SharedField } from "./shared-field";

const horizons: { id: Horizon; label: string }[] = [
  { id: "now", label: "Now" },
  { id: "next", label: "Next" },
  { id: "later", label: "Later" },
];

export function RoadmapBoard({
  room,
  send,
}: {
  room: RoomView;
  actorId: string;
  send: (op: Op) => Promise<boolean>;
}) {
  const roadmap = room.roadmap;
  const ranked = useMemo(() => (roadmap ? scoreRoadmap(roadmap) : []), [roadmap]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const seenIds = useRef<Set<string> | null>(null);
  useEffect(() => {
    const ids = ranked.map((item) => item.initiative.id);
    const previous = seenIds.current;
    seenIds.current = new Set(ids);
    setSelectedId((current) => {
      if (previous) {
        const added = ids.find((id) => !previous.has(id));
        if (added) return added;
      }
      if (current && ids.includes(current)) return current;
      return ids[0] ?? null;
    });
  }, [ranked]);
  const selected = ranked.find((item) => item.initiative.id === selectedId) ?? null;

  if (!roadmap) return null;
  const framework = FRAMEWORKS.find((item) => item.id === roadmap.framework) ?? FRAMEWORKS[0]!;
  const counts = countQuadrants(ranked);
  const topScore = ranked[0] ? formatScore(ranked[0].score) : "—";

  const patch = (initiativeId: string, fields: InitiativePatch) =>
    send({ type: "roadmap.patchInitiative", initiativeId, patch: fields });

  return (
    <div className="ritual roadmap">
      <header className="ritual-hero roadmap-hero">
        <div className="ritual-hero-main">
          <div className="ritual-hero-copy">
            <p className="eyebrow">Roadmap</p>
            <h2>Score the bets. Sequence the hard ones.</h2>
            <p>Write the business outcome first. The number helps you compare—it does not decide for you.</p>
          </div>
          <section className="ritual-focus" aria-label="Roadmap objective">
            <div className="ritual-focus-label">
              <span className="eyebrow">Objective</span>
              <span>The outcome this board is trying to move</span>
            </div>
            <span className="field-shell ritual-focus-shell">
              <SharedField
                value={roadmap.objective}
                onCommit={(objective) => send({ type: "roadmap.setObjective", objective })}
                ariaLabel="Roadmap objective"
                placeholder="Which business outcome is this roadmap trying to move?"
                multiline
                rows={2}
                maxLength={240}
                className="field-control ritual-focus-field"
              />
            </span>
          </section>
        </div>
        <aside className="ritual-hero-aside roadmap-pulse" aria-label="Roadmap snapshot">
          <p className="eyebrow">Snapshot</p>
          <dl>
            <div>
              <dt>Bets</dt>
              <dd>{ranked.length}</dd>
            </div>
            <div>
              <dt>Top score</dt>
              <dd>{topScore}</dd>
            </div>
            <div>
              <dt>Framework</dt>
              <dd>{framework.name}</dd>
            </div>
          </dl>
        </aside>
      </header>

      <section className="roadmap-framework">
        <div className="roadmap-framework-copy">
          <p className="eyebrow">Scoring model</p>
          <strong>{framework.formula}</strong>
          <p>{framework.help}</p>
        </div>
        <div className="framework-pills" role="tablist" aria-label="Scoring framework">
          {FRAMEWORKS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={roadmap.framework === item.id}
              className={roadmap.framework === item.id ? "on" : ""}
              onClick={() => void send({ type: "roadmap.setFramework", framework: item.id })}
            >
              {item.name}
            </button>
          ))}
        </div>
      </section>

      <ul className="quadrant-counts" aria-label="Quadrant counts">
        {(Object.keys(QUADRANT_LABEL) as Quadrant[]).map((quadrant) => (
          <li key={quadrant} className={`q-${quadrant}`}>
            <span className="eyebrow">{QUADRANT_LABEL[quadrant]}</span>
            <strong>{counts[quadrant]}</strong>
          </li>
        ))}
      </ul>

      <div className="roadmap-layout">
        <section className="rank-list">
          <header className="rank-list-head">
            <div>
              <p className="eyebrow">Ranked bets</p>
              <h2>Initiatives</h2>
            </div>
            <button type="button" className="btn primary" onClick={() => void send({ type: "roadmap.addInitiative" })}>
              Add initiative
            </button>
          </header>
          {ranked.length === 0 ? (
            <div className="roadmap-empty">
              <p>No bets yet</p>
              <span>Add an initiative and write the outcome before you score it.</span>
            </div>
          ) : (
            <ol className="bet-list">
              {ranked.map((item, index) => (
                <li key={item.initiative.id} style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}>
                  <button
                    type="button"
                    className={`bet q-${item.quadrant}${selected?.initiative.id === item.initiative.id ? " on" : ""}`}
                    onClick={() => setSelectedId(item.initiative.id)}
                  >
                    <span className="rank">#{item.rank}</span>
                    <span className="bet-copy">
                      <strong>{item.initiative.title || "Untitled initiative"}</strong>
                      <em>{item.initiative.outcome || "No business outcome yet."}</em>
                      <span className={`quadrant-chip q-${item.quadrant}`}>{QUADRANT_LABEL[item.quadrant]}</span>
                    </span>
                    <span className="score">
                      {formatScore(item.score)}
                      <small>{item.initiative.horizon}</small>
                    </span>
                  </button>
                  <span className="meter" aria-hidden="true">
                    <i style={{ width: `${Math.round(item.bar * 100)}%` }} />
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {selected ? (
          <InitiativeEditor
            key={selected.initiative.id}
            item={selected}
            framework={roadmap.framework}
            participants={room.participants}
            onPatch={(fields) => patch(selected.initiative.id, fields)}
            onDelete={() => void send({ type: "roadmap.deleteInitiative", initiativeId: selected.initiative.id })}
          />
        ) : null}
      </div>

      {ranked.length > 0 ? (
        <Scatter items={ranked} selectedId={selected?.initiative.id ?? null} onSelect={setSelectedId} />
      ) : null}
    </div>
  );
}

function InitiativeEditor({
  item,
  framework,
  participants,
  onPatch,
  onDelete,
}: {
  item: ScoredInitiative;
  framework: FrameworkId;
  participants: RoomView["participants"];
  onPatch: (patch: InitiativePatch) => Promise<boolean>;
  onDelete: () => void;
}) {
  const initiative = item.initiative;
  const frameworkMeta = FRAMEWORKS.find((entry) => entry.id === framework) ?? FRAMEWORKS[0]!;
  return (
    <section className="editor roadmap-editor">
      <header className="editor-head">
        <p className="eyebrow">Selected bet</p>
        <h2>{initiative.title || "Untitled initiative"}</h2>
        <p className={`insight ${item.insight.tone}`}>
          <strong>{item.insight.title}</strong>
          {item.insight.detail}
        </p>
      </header>

      <section className="editor-section" aria-labelledby="roadmap-define">
        <header className="editor-section-head">
          <p className="eyebrow" id="roadmap-define">
            1 · Define
          </p>
          <h3>What are we betting on?</h3>
        </header>
        <label className="field">
          <span className="field-label">
            <span>Title</span>
          </span>
          <span className="field-shell">
            <SharedField
              value={initiative.title}
              onCommit={(title) => onPatch({ title })}
              ariaLabel="Initiative title"
              placeholder="Initiative"
              maxLength={120}
              className="field-control"
            />
          </span>
        </label>
        <label className="field">
          <span className="field-label">
            <span>Business outcome</span>
          </span>
          <span className="field-shell">
            <SharedField
              value={initiative.outcome}
              onCommit={(outcome) => onPatch({ outcome })}
              ariaLabel="Business outcome"
              placeholder="What changes for the customer or the business if this ships?"
              multiline
              rows={3}
              maxLength={400}
              className="field-control"
            />
          </span>
        </label>
        <div className="editor-meta">
          <div className="field meta-field">
            <span className="field-label">
              <span>Horizon</span>
            </span>
            <div className="horizon-pills" role="radiogroup" aria-label="Horizon">
              {horizons.map((horizon) => (
                <button
                  key={horizon.id}
                  type="button"
                  className={initiative.horizon === horizon.id ? "on" : ""}
                  aria-pressed={initiative.horizon === horizon.id}
                  onClick={() => onPatch({ horizon: horizon.id })}
                >
                  {horizon.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field meta-field">
            <span className="field-label">
              <span>Owner</span>
            </span>
            <OwnerPicker
              owner={participants.find((person) => person.id === initiative.ownerId) ?? null}
              participants={participants}
              onAssign={(ownerId) => void onPatch({ ownerId })}
            />
          </div>
        </div>
      </section>

      <section className="editor-section" aria-labelledby="roadmap-score">
        <header className="editor-section-head">
          <div>
            <p className="eyebrow" id="roadmap-score">
              2 · Score
            </p>
            <h3>{frameworkMeta.name} inputs</h3>
          </div>
          <p className="formula-live" aria-label="Score formula">
            {item.formula}
          </p>
        </header>

        {framework === "rice" ? (
          <div className="score-stack">
            <div className="score-grid">
              <NumberField label="Reach" hint="People or accounts this quarter" value={initiative.reach} min={0} max={1000000} step={1} onCommit={(reach) => onPatch({ reach })} />
              <NumberField label="Effort" hint="Person-months. Minimum 0.25." value={initiative.effort} min={0.25} max={240} step={0.25} onCommit={(effort) => onPatch({ effort })} />
            </div>
            <ImpactScale value={initiative.impact} onCommit={(impact) => onPatch({ impact })} />
            <ConfidenceField
              value={Math.round(initiative.confidence * 100)}
              onCommit={(value) => onPatch({ confidence: value / 100 })}
            />
          </div>
        ) : null}

        {framework === "ice" ? (
          <div className="score-stack">
            <StepScale label="Impact" hint="1 is tiny, 10 changes the business" value={initiative.iceImpact} min={1} max={10} onCommit={(iceImpact) => onPatch({ iceImpact })} />
            <StepScale label="Confidence" hint="1 is a guess, 10 is evidence" value={initiative.iceConfidence} min={1} max={10} onCommit={(iceConfidence) => onPatch({ iceConfidence })} />
            <StepScale label="Ease" hint="10 is almost no effort" value={initiative.iceEase} min={1} max={10} onCommit={(iceEase) => onPatch({ iceEase })} />
          </div>
        ) : null}

        {framework === "value-complexity" ? (
          <StepScale label="Business value" hint="1 is noise, 10 is a company-level outcome" value={initiative.value} min={1} max={10} onCommit={(value) => onPatch({ value })} />
        ) : null}
      </section>

      <ComplexityPanel
        score={item.complexity}
        technical={initiative.complexityTechnical}
        dependency={initiative.complexityDependency}
        uncertainty={initiative.complexityUncertainty}
        onPatch={onPatch}
      />

      <section className="editor-section" aria-labelledby="roadmap-assumption">
        <header className="editor-section-head">
          <p className="eyebrow" id="roadmap-assumption">
            4 · Assumption
          </p>
          <h3>What has to be true?</h3>
        </header>
        <label className="field">
          <span className="field-label visually-hidden">
            <span>Assumption</span>
          </span>
          <span className="field-shell">
            <SharedField
              value={initiative.assumption}
              onCommit={(assumption) => onPatch({ assumption })}
              ariaLabel="Assumption"
              placeholder="What has to be true for this score to hold?"
              multiline
              rows={3}
              maxLength={400}
              className="field-control"
            />
          </span>
        </label>
      </section>

      <button type="button" className="btn ghost danger-ghost" onClick={onDelete}>
        Remove initiative
      </button>
    </section>
  );
}

function ImpactScale({
  value,
  onCommit,
}: {
  value: Initiative["impact"];
  onCommit: (impact: Initiative["impact"]) => void | boolean | Promise<void | boolean>;
}) {
  const selected = IMPACT_OPTIONS.find((option) => option.value === value) ?? IMPACT_OPTIONS[2]!;
  return (
    <div className="field impact-scale">
      <span className="field-label">
        <span>Impact</span>
        <strong className="range-value">
          {selected.label} · {selected.value}
        </strong>
      </span>
      <div className="impact-pills" role="radiogroup" aria-label="Impact">
        {IMPACT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            className={`impact-pill impact-${option.label.toLowerCase()}${value === option.value ? " on" : ""}`}
            onClick={() => onCommit(option.value)}
          >
            <strong>{option.label}</strong>
            <span>{option.value}</span>
          </button>
        ))}
      </div>
      <p className="scale-meaning">{selected.meaning}</p>
    </div>
  );
}

const CONFIDENCE_PRESETS = [50, 60, 70, 80, 90, 100] as const;

function confidenceTone(value: number): { label: string; tone: "low" | "mid" | "high" } {
  if (value >= 80) return { label: "Strong evidence", tone: "high" };
  if (value >= 60) return { label: "Reasonable bet", tone: "mid" };
  return { label: "Mostly a guess", tone: "low" };
}

function ConfidenceField({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (value: number) => void | boolean | Promise<void | boolean>;
}) {
  const tone = confidenceTone(value);
  return (
    <div className="field confidence-scale">
      <span className="field-label">
        <span>Confidence</span>
        <strong className="range-value">{value}%</strong>
      </span>
      <div className="confidence-presets" role="radiogroup" aria-label="Confidence">
        {CONFIDENCE_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            role="radio"
            aria-checked={value === preset}
            className={value === preset ? "on" : ""}
            onClick={() => onCommit(preset)}
          >
            {preset}%
          </button>
        ))}
      </div>
      <p className="scale-meaning">
        {tone.label}. How sure are you the outcome will happen?
      </p>
    </div>
  );
}

function complexityTone(score: number): { label: string; tone: "low" | "mid" | "high" } {
  if (score >= 3.5) return { label: "Sequence carefully", tone: "high" };
  if (score >= 2.5) return { label: "Worth planning", tone: "mid" };
  return { label: "Team can hold this", tone: "low" };
}

function ComplexityPanel({
  score,
  technical,
  dependency,
  uncertainty,
  onPatch,
}: {
  score: number;
  technical: number;
  dependency: number;
  uncertainty: number;
  onPatch: (patch: InitiativePatch) => Promise<boolean>;
}) {
  const tone = complexityTone(score);
  return (
    <section className={`editor-section complexity-section tone-${tone.tone}`} aria-labelledby="roadmap-complexity">
      <header className="editor-section-head">
        <div>
          <p className="eyebrow" id="roadmap-complexity">
            3 · Complexity
          </p>
          <h3>{tone.label}</h3>
          <p className="editor-section-copy">Not part of the score. Use it to decide sequencing.</p>
        </div>
        <div className="complexity-score" aria-label={`Complexity ${score.toFixed(1)} of 5`}>
          <strong>{score.toFixed(1)}</strong>
          <span>/ 5</span>
        </div>
      </header>
      <div className="complexity-steps">
        <StepScale label="Technical" value={technical} min={1} max={5} onCommit={(complexityTechnical) => onPatch({ complexityTechnical })} />
        <StepScale label="Dependencies" value={dependency} min={1} max={5} onCommit={(complexityDependency) => onPatch({ complexityDependency })} />
        <StepScale label="Uncertainty" value={uncertainty} min={1} max={5} onCommit={(complexityUncertainty) => onPatch({ complexityUncertainty })} />
      </div>
    </section>
  );
}

function StepScale({
  label,
  hint,
  value,
  min,
  max,
  onCommit,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onCommit: (value: number) => void | boolean | Promise<void | boolean>;
}) {
  const steps = Array.from({ length: max - min + 1 }, (_, index) => min + index);
  return (
    <div className="field step-scale">
      <span className="field-label">
        <span>{label}</span>
        <strong className="range-value">{value}</strong>
      </span>
      <div className="step-pills" role="radiogroup" aria-label={label} style={{ ["--steps" as string]: String(steps.length) }}>
        {steps.map((step) => (
          <button
            key={step}
            type="button"
            role="radio"
            aria-checked={value === step}
            className={value === step ? "on" : ""}
            onClick={() => onCommit(step)}
          >
            {step}
          </button>
        ))}
      </div>
      {hint ? <small className="field-hint-block">{hint}</small> : null}
    </div>
  );
}

function OwnerPicker({
  owner,
  participants,
  onAssign,
}: {
  owner: { id: string; name: string; color?: string } | null;
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
    <div className={`owner-picker roadmap-owner${open ? " open" : ""}${dropUp ? " drop-up" : ""}${owner ? "" : " empty"}`} ref={rootRef}>
      <button
        type="button"
        className="owner-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={owner ? `Owner ${owner.name}` : "Assign owner"}
        onClick={() => setOpen((current) => !current)}
      >
        <span
          className={`owner-chip${owner ? "" : " empty"}`}
          aria-hidden="true"
          style={owner?.color ? { background: owner.color } : undefined}
        >
          {owner ? owner.name.slice(0, 1).toUpperCase() : "?"}
        </span>
        <span className="owner-label">
          <small>{owner ? "Assigned" : "Needs owner"}</small>
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
                <span className="owner-chip" aria-hidden="true" style={{ background: person.color }}>
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

function NumberField({
  label,
  hint,
  value,
  min,
  max,
  step,
  onCommit,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onCommit: (value: number) => void | boolean | Promise<void | boolean>;
}) {
  const [text, setText] = useState(String(value));
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setText(String(value));
  }, [value]);
  const commit = (raw: string) => {
    focused.current = false;
    const trimmed = raw.trim();
    const parsed = Number(trimmed);
    const whole = step >= 1;
    const valid =
      trimmed !== "" &&
      Number.isFinite(parsed) &&
      parsed >= min &&
      parsed <= max &&
      (!whole || Number.isInteger(parsed));
    if (!valid) {
      setText(String(value));
      return;
    }
    setText(String(parsed));
    if (parsed === value) return;
    const saved = onCommit(parsed);
    const revert = () => setText(String(value));
    if (saved === false) {
      revert();
      return;
    }
    if (saved && typeof (saved as Promise<void | boolean>).then === "function") {
      void Promise.resolve(saved).then(
        (ok) => {
          if (ok === false) revert();
        },
        () => revert(),
      );
    }
  };
  return (
    <label className="field">
      <span className="field-label">
        <span>{label}</span>
        {hint ? <span className="field-hint">{hint}</span> : null}
      </span>
      <span className="field-shell">
        <input
          className="field-control"
          type="number"
          min={min}
          max={max}
          step={step}
          value={text}
          aria-label={label}
          onFocus={() => {
            focused.current = true;
          }}
          onChange={(event) => setText(event.target.value)}
          onBlur={(event) => commit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            event.currentTarget.blur();
          }}
        />
      </span>
    </label>
  );
}

function Scatter({
  items,
  selectedId,
  onSelect,
}: {
  items: ScoredInitiative[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const width = 720;
  const height = 320;
  const plotLeft = 56;
  const plotRight = 688;
  const plotTop = 36;
  const plotBottom = 268;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;
  const max = Math.max(...items.map((item) => item.score), 1);
  const cutoff = medianScore(items.map((item) => item.score));
  const xFor = (complexity: number) => plotLeft + ((complexity - 1) / 4) * plotWidth;
  const yFor = (score: number) => {
    const ratio = max <= 0 ? 0 : score / max;
    const padded = 0.08 + ratio * 0.84;
    return plotBottom - padded * plotHeight;
  };
  const guideX = xFor(HIGH_COMPLEXITY);
  const guideY = yFor(cutoff);
  const selected = items.find((item) => item.initiative.id === selectedId) ?? null;
  const selectedX = selected ? xFor(selected.complexity) : null;
  const selectedY = selected ? yFor(selected.score) : null;
  const ordered = [...items].sort((a, b) => {
    if (a.initiative.id === selectedId) return 1;
    if (b.initiative.id === selectedId) return -1;
    return a.rank - b.rank;
  });
  const summary = items
    .map((item) => `${item.initiative.title || "Untitled"} scores ${formatScore(item.score)} at complexity ${item.complexity.toFixed(1)}`)
    .join(". ");

  return (
    <section className={`scatter roadmap-scatter${selected ? " has-selection" : ""}`}>
      <header className="scatter-head">
        <div>
          <p className="eyebrow">Portfolio read</p>
          <h2>Score against complexity</h2>
          <p>Select a ranked bet on the chart or in the list. Guides mark median score and high complexity (3.5).</p>
        </div>
        <ul className="scatter-key" aria-label="Quadrant key">
          {(Object.keys(QUADRANT_LABEL) as Quadrant[]).map((quadrant) => (
            <li key={quadrant} className={`q-${quadrant}`}>
              <i aria-hidden="true" />
              {QUADRANT_LABEL[quadrant]}
            </li>
          ))}
        </ul>
      </header>

      <div className="scatter-body">
        <div className="scatter-plot">
          <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={summary}>
            <rect className="plot-band q-do-first" x={plotLeft} y={plotTop} width={guideX - plotLeft} height={Math.max(guideY - plotTop, 0)} />
            <rect className="plot-band q-big-bet" x={guideX} y={plotTop} width={plotRight - guideX} height={Math.max(guideY - plotTop, 0)} />
            <rect className="plot-band q-fill-in" x={plotLeft} y={guideY} width={guideX - plotLeft} height={Math.max(plotBottom - guideY, 0)} />
            <rect className="plot-band q-reconsider" x={guideX} y={guideY} width={plotRight - guideX} height={Math.max(plotBottom - guideY, 0)} />

            <line x1={plotLeft} y1={plotTop} x2={plotLeft} y2={plotBottom} />
            <line x1={plotLeft} y1={plotBottom} x2={plotRight} y2={plotBottom} />
            <line x1={guideX} y1={plotTop} x2={guideX} y2={plotBottom} className="guide" />
            <line x1={plotLeft} y1={guideY} x2={plotRight} y2={guideY} className="guide" />

            {selectedX !== null && selectedY !== null ? (
              <g className="selection-cross" aria-hidden="true">
                <line x1={plotLeft} y1={selectedY} x2={plotRight} y2={selectedY} />
                <line x1={selectedX} y1={plotTop} x2={selectedX} y2={plotBottom} />
              </g>
            ) : null}

            <text className="axis-label" x={plotLeft - 10} y={plotTop + 4} textAnchor="end">
              High
            </text>
            <text className="axis-label" x={plotLeft - 10} y={plotBottom} textAnchor="end">
              Low
            </text>
            <text className="axis-label" x={plotLeft} y={plotBottom + 22}>
              Simpler
            </text>
            <text className="axis-label" x={plotRight} y={plotBottom + 22} textAnchor="end">
              More complex
            </text>
            <text className="axis-label guide-label" x={Math.min(guideX + 8, plotRight - 28)} y={plotTop + 16}>
              3.5
            </text>
            <text className="axis-label guide-label" x={plotLeft + 8} y={Math.max(guideY - 8, plotTop + 16)}>
              Median
            </text>

            {ordered.map((item) => {
              const x = xFor(item.complexity);
              const y = yFor(item.score);
              const isOn = selectedId === item.initiative.id;
              const title = item.initiative.title || "Untitled initiative";
              return (
                <g
                  key={item.initiative.id}
                  className={`dot q-${item.quadrant}${isOn ? " on" : ""}${selected && !isOn ? " dim" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${title}, rank ${item.rank}, score ${formatScore(item.score)}, complexity ${item.complexity.toFixed(1)}, ${QUADRANT_LABEL[item.quadrant]}`}
                  aria-pressed={isOn}
                  onClick={() => onSelect(item.initiative.id)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    onSelect(item.initiative.id);
                  }}
                >
                  {isOn ? <circle className="dot-halo" cx={x} cy={y} r="22" /> : null}
                  <circle className="dot-core" cx={x} cy={y} r={isOn ? 15 : 12} />
                  <text className="dot-rank" x={x} y={y + 4} textAnchor="middle">
                    {item.rank}
                  </text>
                  <title>{`${title} · ${formatScore(item.score)} · complexity ${item.complexity.toFixed(1)}`}</title>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="scatter-side">
          <header className="scatter-side-head">
            <p className="eyebrow">Ranked bets</p>
            <strong>{items.length} on the board</strong>
          </header>
          <ol className="scatter-legend" aria-label="Ranked bets on the chart">
            {items.map((item) => {
              const isOn = selectedId === item.initiative.id;
              return (
                <li key={item.initiative.id}>
                  <button
                    type="button"
                    className={`scatter-legend-item q-${item.quadrant}${isOn ? " on" : ""}`}
                    onClick={() => onSelect(item.initiative.id)}
                    aria-pressed={isOn}
                  >
                    <span className="scatter-mark" aria-hidden="true">
                      {item.rank}
                    </span>
                    <span className="scatter-legend-copy">
                      <strong>{item.initiative.title || "Untitled initiative"}</strong>
                      <span className="scatter-meta">
                        <span>{formatScore(item.score)}</span>
                        <span>{item.complexity.toFixed(1)} cx</span>
                        <span className={`quadrant-chip q-${item.quadrant}`}>{QUADRANT_LABEL[item.quadrant]}</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

function countQuadrants(items: ScoredInitiative[]): Record<Quadrant, number> {
  const counts: Record<Quadrant, number> = { "do-first": 0, "big-bet": 0, "fill-in": 0, reconsider: 0 };
  for (const item of items) counts[item.quadrant] += 1;
  return counts;
}
