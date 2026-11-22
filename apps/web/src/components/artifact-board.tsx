"use client";

import {
  ARTIFACT_GUIDES,
  ARTIFACT_PRODUCTS,
  artifactExample,
  artifactGuide,
  presentArtifactPiece,
  type ArtifactClause,
  type ArtifactPieceView,
  type ArtifactId,
  type ArtifactPiece,
  type Op,
  type RoomView,
} from "@cadence/core";
import { useEffect, useId, useMemo, useState } from "react";

export function ArtifactBoard({
  room,
  send,
}: {
  room: RoomView;
  send: (op: Op) => Promise<boolean>;
}) {
  const state = room.artifacts;
  if (!state) return null;
  const guide = artifactGuide(state.artifact);
  const example = artifactExample(state.artifact, state.product);
  const product = ARTIFACT_PRODUCTS.find((item) => item.id === state.product) ?? ARTIFACT_PRODUCTS[0]!;
  const [howOpen, setHowOpen] = useState(true);
  const [activeSection, setActiveSection] = useState(example.sections[0]?.title ?? "");
  const howId = useId();
  const docKey = `${state.artifact}-${state.product}`;
  const artifactIndex = ARTIFACT_GUIDES.findIndex((item) => item.id === state.artifact);
  const prev = artifactIndex > 0 ? ARTIFACT_GUIDES[artifactIndex - 1] : null;
  const next = artifactIndex >= 0 && artifactIndex < ARTIFACT_GUIDES.length - 1 ? ARTIFACT_GUIDES[artifactIndex + 1] : null;

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 900px)");
    const sync = () => setHowOpen(!narrow.matches);
    sync();
    narrow.addEventListener("change", sync);
    return () => narrow.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setActiveSection(example.sections[0]?.title ?? "");
  }, [docKey, example.sections]);

  const sectionIds = useMemo(
    () => example.sections.map((section, index) => ({ title: section.title, id: sectionDomId(docKey, index) })),
    [docKey, example.sections],
  );

  function jumpTo(sectionId: string, title: string) {
    setActiveSection(title);
    const node = document.getElementById(sectionId);
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="ritual artifacts">
      <div className="artifact-shell">
        <header className="artifact-masthead">
          <div className="artifact-masthead-copy">
            <p className="eyebrow">Artifact examples</p>
            <div className="artifact-masthead-title">
              <h2>{guide.name}</h2>
              <ul className="artifact-frameworks" aria-label="Practices">
                {guide.frameworks.map((framework) => (
                  <li key={framework}>{framework}</li>
                ))}
              </ul>
            </div>
            <p className="artifact-summary">{guide.summary}</p>
          </div>
          <aside className="artifact-callout" aria-label="This example">
            <p className="eyebrow">{product.name}</p>
            <p className="artifact-callout-headline">{example.headline}</p>
            <p className="artifact-callout-meta">{guide.practice}</p>
          </aside>
        </header>

        <div className="artifact-controls" role="region" aria-label="Example controls">
          <div className="artifact-platform" role="radiogroup" aria-label="Platform">
            {ARTIFACT_PRODUCTS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={state.product === item.id ? "on" : ""}
                aria-pressed={state.product === item.id}
                title={item.blurb}
                onClick={() => void send({ type: "artifacts.setProduct", product: item.id })}
              >
                {shortProductName(item.name)}
              </button>
            ))}
          </div>
          <div className="artifact-tabs" role="radiogroup" aria-label="Artifact">
            {ARTIFACT_GUIDES.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={state.artifact === item.id ? "on" : ""}
                aria-pressed={state.artifact === item.id}
                onClick={() => void send({ type: "artifacts.setArtifact", artifact: item.id as ArtifactId })}
              >
                <span className="artifact-tab-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="artifact-tab-copy">
                  <strong>{item.name}</strong>
                  <span>{item.frameworks.join(" · ")}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="artifact-stage">
          <aside className="artifact-rail">
            <div className="artifact-how">
              <button
                type="button"
                className="artifact-how-toggle"
                aria-expanded={howOpen}
                aria-controls={howId}
                onClick={() => setHowOpen((open) => !open)}
              >
                <span className="eyebrow">How to read it</span>
                <strong>{howOpen ? "Hide" : "Show"}</strong>
              </button>
              {howOpen ? (
                <ol id={howId} className="artifact-how-list">
                  {guide.how.map((step, index) => (
                    <li key={step}>
                      <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>

            <nav className="artifact-toc" aria-label="On this page">
              <p className="eyebrow">On this page</p>
              <ol>
                {sectionIds.map((section) => (
                  <li key={section.id}>
                    <button
                      type="button"
                      className={activeSection === section.title ? "on" : ""}
                      onClick={() => jumpTo(section.id, section.title)}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="artifact-pager" aria-label="Nearby artifacts">
              {prev ? (
                <button
                  type="button"
                  className="artifact-pager-btn"
                  onClick={() => void send({ type: "artifacts.setArtifact", artifact: prev.id })}
                >
                  <span className="eyebrow">Previous</span>
                  <strong>{prev.name}</strong>
                </button>
              ) : (
                <span className="artifact-pager-spacer" />
              )}
              {next ? (
                <button
                  type="button"
                  className="artifact-pager-btn next"
                  onClick={() => void send({ type: "artifacts.setArtifact", artifact: next.id })}
                >
                  <span className="eyebrow">Next</span>
                  <strong>{next.name}</strong>
                </button>
              ) : (
                <span className="artifact-pager-spacer" />
              )}
            </div>
          </aside>

          <article key={docKey} className="artifact-document" aria-label={guide.name}>
            <header className="artifact-document-head">
              <div>
                <p className="eyebrow">Worked example</p>
                <h3>{guide.name}</h3>
              </div>
              <p className="artifact-progress">
                {artifactIndex + 1} of {ARTIFACT_GUIDES.length}
              </p>
              <p className="artifact-document-lede">{example.headline}</p>
            </header>

            {example.sections.map((section, sectionIndex) => {
              const sectionId = sectionDomId(docKey, sectionIndex);
              return (
                <section
                  key={section.title}
                  id={sectionId}
                  className="artifact-section"
                  style={{ animationDelay: `${Math.min(sectionIndex, 6) * 45}ms` }}
                >
                  <header className="artifact-section-head">
                    <span className="artifact-section-index" aria-hidden="true">
                      {String(sectionIndex + 1).padStart(2, "0")}
                    </span>
                    <h4>{section.title}</h4>
                  </header>
                  <div className={`artifact-pieces${section.pieces.length === 1 ? " single" : ""}`}>
                    {groupPieces(section.pieces).map((group) => {
                      const view = presentArtifactPiece(group.piece.text);
                      const wide = pieceSpansRow(view, Boolean(group.criteria));
                      return (
                        <div key={group.piece.label} className={`artifact-piece${wide ? " long" : ""}`}>
                          <h5>{group.piece.label}</h5>
                          <PieceBody text={group.piece.text} />
                          {group.criteria ? (
                            <div className="artifact-nested">
                              <h6>Acceptance criteria</h6>
                              <PieceBody text={group.criteria.text} />
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </article>
        </div>
      </div>
    </div>
  );
}

function shortProductName(name: string) {
  if (name.includes("Unified Agent")) return "Unified Agent";
  if (name.includes("Contact Center")) return "Contact Center";
  if (name.includes("CS data")) return "CS data";
  return name;
}

function sectionDomId(docKey: string, index: number) {
  return `artifact-section-${docKey}-${index}`.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function pieceSpansRow(view: ArtifactPieceView, paired: boolean): boolean {
  if (paired || view.kind === "record" || view.kind === "story") return true;
  if (view.kind === "criteria") return view.items.length > 1 || Boolean(view.lead) || Boolean(view.tail);
  return false;
}

function groupPieces(pieces: ArtifactPiece[]): { piece: ArtifactPiece; criteria?: ArtifactPiece }[] {
  const groups: { piece: ArtifactPiece; criteria?: ArtifactPiece }[] = [];
  for (let index = 0; index < pieces.length; index += 1) {
    const piece = pieces[index]!;
    const next = pieces[index + 1];
    if (next && /^acceptance criteria:/i.test(next.label) && !/^acceptance criteria/i.test(piece.label)) {
      groups.push({ piece, criteria: next });
      index += 1;
    } else {
      groups.push({ piece });
    }
  }
  return groups;
}

function PieceBody({ text }: { text: string }) {
  const view = presentArtifactPiece(text);
  if (view.kind === "story") {
    return (
      <div className="artifact-story">
        <p className="artifact-story-line">
          <span>As {view.article}</span>
          {view.role}
        </p>
        <p className="artifact-story-line">
          <span>I want</span>
          {view.want}
        </p>
        <p className="artifact-story-line">
          <span>So that</span>
          {view.reason}
        </p>
        {view.estimate || view.ready ? (
          <dl className="artifact-meta">
            {view.estimate ? (
              <div>
                <dt>Estimate</dt>
                <dd>{view.estimate}</dd>
              </div>
            ) : null}
            {view.ready ? (
              <div>
                <dt>Ready</dt>
                <dd>{view.ready}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </div>
    );
  }
  if (view.kind === "criteria") {
    return (
      <div className="artifact-spec">
        {view.lead ? <p>{view.lead}</p> : null}
        <CriteriaList items={view.items} tail={view.tail} />
      </div>
    );
  }
  if (view.kind === "record") {
    return (
      <div className="artifact-spec">
        <p>{view.description}</p>
        <dl className="artifact-meta">
          {view.order ? (
            <div>
              <dt>Order</dt>
              <dd>{view.order}</dd>
            </div>
          ) : null}
          {view.value ? (
            <div>
              <dt>Value</dt>
              <dd>{view.value}</dd>
            </div>
          ) : null}
          {view.size ? (
            <div>
              <dt>Size</dt>
              <dd>{view.size}</dd>
            </div>
          ) : null}
        </dl>
        {view.criteria.length > 0 ? (
          <div className="artifact-nested">
            <h6>Acceptance criteria</h6>
            <CriteriaList items={view.criteria} />
          </div>
        ) : null}
        {view.criteriaNote ? <p className="artifact-spec-tail">{view.criteriaNote}</p> : null}
      </div>
    );
  }
  return <p>{view.text}</p>;
}

function CriteriaList({ items, tail }: { items: ArtifactClause[]; tail?: string }) {
  const several = items.length > 1;
  return (
    <ol className={several ? "artifact-criteria" : "artifact-criteria solo"}>
      {items.map((item, index) => (
        <li key={`${item.name ?? "criterion"}-${item.given}-${index}`}>
          {item.name ? <p className="artifact-criterion-name">{item.name}</p> : null}
          <div className={several ? "artifact-criterion" : "artifact-criterion solo"}>
            {several ? <span className="artifact-criterion-index">{index + 1}</span> : null}
            <dl>
              <dt>Given</dt>
              <dd>{item.given}</dd>
              <dt>When</dt>
              <dd>{item.when}</dd>
              <dt>Then</dt>
              <dd className="then">{item.then}</dd>
            </dl>
          </div>
        </li>
      ))}
      {tail ? (
        <li className="artifact-criterion-note">
          <p>{tail}</p>
        </li>
      ) : null}
    </ol>
  );
}
