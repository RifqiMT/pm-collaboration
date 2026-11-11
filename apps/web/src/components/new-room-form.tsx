"use client";

import { RETRO_TEMPLATES, RITUALS, type RetroTemplateId, type RoomKind } from "@cadence/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { readIdentity, writeIdentity } from "./identity";
import { RetroGlyph } from "./retro-glyphs";

const titles: Record<RoomKind, string> = {
  retro: "Sprint retrospective",
  review: "Sprint review",
  roadmap: "Roadmap bets",
};

const templateIds = Object.keys(RETRO_TEMPLATES) as RetroTemplateId[];

const stepHint: Record<Exclude<RoomKind, "retro">, Record<string, string>> = {
  review: {
    Checklist: "The shared bar for what is ready to show.",
    Evidence: "A note or link sits on the check it supports.",
    Feedback: "Praise, changes, and questions stay in the room.",
    "Ship decision": "The room leaves with ship, iterate, or hold.",
  },
  roadmap: {
    Outcome: "The business result stays on the same card as the score.",
    Score: "RICE, ICE, or value divided by complexity.",
    Complexity: "Technical difficulty, dependencies, and uncertainty.",
    Sequence: "A high score with high complexity is a bet to order, not a task for Monday.",
  },
};

const kindBlurb: Record<RoomKind, string> = {
  retro: "Notes, discussion, votes, and owners in one room.",
  review: "Increment, evidence, feedback, and a ship call.",
  roadmap: "Score bets, then read them against complexity.",
};

export function NewRoomForm({ initialKind }: { initialKind: RoomKind }) {
  const router = useRouter();
  const [kind, setKind] = useState<RoomKind>(initialKind);
  const [name, setName] = useState("");
  const [title, setTitle] = useState(titles[initialKind]);
  const [templateId, setTemplateId] = useState<RetroTemplateId>("start-stop-continue");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const ritual = RITUALS.find((item) => item.kind === kind) ?? RITUALS[0]!;
  const selectedTemplate = RETRO_TEMPLATES[templateId];
  const groups = useMemo(
    () =>
      [
        ["classic", "Classic", "The usual shapes for a sprint retro."],
        ["pop", "Pop culture", "The same ritual, told through a story the team already knows."],
      ] as const,
    [],
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
          title: title.trim() || titles[kind],
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

            <div className="setup-actions">
              <button type="submit" className="btn primary" disabled={pending}>
                {pending ? "Creating…" : "Create an empty room"}
              </button>
              <button type="button" className="btn ghost" disabled={pending} onClick={() => void create(true)}>
                Start from an example
              </button>
            </div>
            <p className="muted setup-note">An example fills the room so the team can see how a session looks.</p>
          </form>
        </aside>

        {kind === "retro" ? (
          <section className="setup-stage" aria-label="Retrospective shape">
            <header className="setup-stage-head">
              <div>
                <p className="eyebrow">Board shape</p>
                <h2>Choose a shape</h2>
              </div>
              <p>The columns are what the team writes on. You can still move notes later.</p>
            </header>
            {groups.map(([group, groupTitle, note]) => (
              <div key={group} className="shape-group">
                <header className="shape-group-head">
                  <h3>{groupTitle}</h3>
                  <p>{note}</p>
                </header>
                <div className="shape-grid" role="radiogroup" aria-label={`${groupTitle} retrospective shapes`}>
                  {templateIds
                    .filter((id) => (RETRO_TEMPLATES[id].group ?? "classic") === group)
                    .map((id, index) => {
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
            ))}
          </section>
        ) : (
          <section className="setup-stage" aria-label="What the room includes">
            <header className="setup-stage-head">
              <div>
                <p className="eyebrow">Room flow</p>
                <h2>What the room includes</h2>
              </div>
              <p>Everyone who has the code sees the same board.</p>
            </header>
            <ol className="setup-steps">
              {ritual.steps.map((step, index) => (
                <li key={step} style={{ animationDelay: `${index * 40}ms` }}>
                  <span>0{index + 1}</span>
                  <strong>{step}</strong>
                  <p>{stepHint[kind][step]}</p>
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
