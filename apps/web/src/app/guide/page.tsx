import { GLOSSARY, type GlossaryKind } from "@cadence/core";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Definitions · TeamCompass",
  description: "Definitions of the variables, metrics, and formulas used in a TeamCompass room.",
};

const kindLabel: Record<GlossaryKind, string> = {
  variable: "Variable",
  metric: "Metric",
  formula: "Formula",
};

const kindHint: Record<GlossaryKind, string> = {
  variable: "Something the team enters",
  metric: "A number the board calculates",
  formula: "The math behind a metric",
};

export default function GuidePage() {
  const counts = GLOSSARY.reduce(
    (acc, group) => {
      for (const entry of group.entries) acc[entry.kind] += 1;
      return acc;
    },
    { variable: 0, metric: 0, formula: 0 } as Record<GlossaryKind, number>,
  );

  return (
    <main className="guide" id="main">
      <header className="guide-bar">
        <Link href="/" className="wordmark">
          TeamCompass
        </Link>
        <Link href="/" className="btn ghost tiny">
          Back
        </Link>
      </header>

      <section className="guide-hero">
        <p className="eyebrow">Definitions</p>
        <h1>Variables, metrics, and formulas</h1>
        <p className="lede">
          The words the board uses when it counts time, checks a review, or scores a bet.
        </p>
        <ul className="guide-legend" aria-label="Definition kinds">
          {(Object.keys(kindLabel) as GlossaryKind[]).map((kind) => (
            <li key={kind} className={`guide-legend-item kind-${kind}`}>
              <span className="guide-kind">{kindLabel[kind]}</span>
              <span className="guide-legend-copy">
                {kindHint[kind]}
                <strong>{counts[kind]}</strong>
              </span>
            </li>
          ))}
        </ul>
        <nav className="guide-jump" aria-label="Jump to a ritual">
          {GLOSSARY.map((group) => (
            <a key={group.id} href={`#guide-${group.id}`}>
              <strong>{group.title}</strong>
              <span>{group.entries.length}</span>
            </a>
          ))}
        </nav>
      </section>

      {GLOSSARY.map((group) => (
        <section key={group.id} className="guide-group" aria-labelledby={`guide-${group.id}`}>
          <header className="guide-group-head">
            <h2 id={`guide-${group.id}`}>{group.title}</h2>
            <p>{group.intro}</p>
          </header>
          <div className="guide-list">
            {group.entries.map((entry) => (
              <article key={entry.id} className={`guide-entry kind-${entry.kind}`} id={entry.id}>
                <div className="guide-entry-top">
                  <span className="guide-kind">{kindLabel[entry.kind]}</span>
                  <h3>{entry.name}</h3>
                </div>
                <p className="guide-plain">{entry.plain}</p>
                {entry.formula ? (
                  <p className="guide-formula">
                    <span>Formula</span>
                    <strong>{entry.formula}</strong>
                  </p>
                ) : null}
                {entry.example ? (
                  <p className="guide-meta">
                    <span>Example</span>
                    <span>{entry.example}</span>
                  </p>
                ) : null}
                <p className="guide-meta guide-where">
                  <span>Where</span>
                  <span>{entry.where}</span>
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
