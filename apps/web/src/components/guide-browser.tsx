"use client";

import { GLOSSARY, glossaryParagraphs, type GlossaryKind } from "@cadence/core";
import { useMemo, useState } from "react";

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

const KINDS = Object.keys(kindLabel) as GlossaryKind[];

export function GuideBrowser() {
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<GlossaryKind | "all">("all");

  const counts = useMemo(() => {
    const next = { variable: 0, metric: 0, formula: 0 } as Record<GlossaryKind, number>;
    for (const group of GLOSSARY) {
      for (const entry of group.entries) next[entry.kind] += 1;
    }
    return next;
  }, []);

  const total = counts.variable + counts.metric + counts.formula;
  const needle = query.trim().toLocaleLowerCase();

  const groups = useMemo(() => {
    return GLOSSARY.map((group) => {
      const entries = group.entries.filter((entry) => {
        if (kindFilter !== "all" && entry.kind !== kindFilter) return false;
        if (!needle) return true;
        const haystack = [entry.name, entry.plain, entry.formula ?? "", entry.example ?? "", entry.where, group.title]
          .join("\n")
          .toLocaleLowerCase();
        return haystack.includes(needle);
      });
      return { ...group, entries };
    }).filter((group) => group.entries.length > 0);
  }, [kindFilter, needle]);

  const visibleCount = groups.reduce((sum, group) => sum + group.entries.length, 0);

  return (
    <>
      <section className="guide-hero">
        <p className="eyebrow">Definitions</p>
        <h1>Words the board uses</h1>
        <p className="lede">
          Plain-English meanings for what you enter, what the board calculates, and the math behind those numbers.
          Each entry is a short paragraph you can read in place.
        </p>

        <ul className="guide-legend" aria-label="Definition kinds">
          {KINDS.map((kind) => (
            <li key={kind} className={`guide-legend-item kind-${kind}`}>
              <button
                type="button"
                className={kindFilter === kind ? "on" : ""}
                aria-pressed={kindFilter === kind}
                onClick={() => setKindFilter((current) => (current === kind ? "all" : kind))}
              >
                <span className="guide-kind">{kindLabel[kind]}</span>
                <span className="guide-legend-copy">
                  {kindHint[kind]}
                  <strong>{counts[kind]}</strong>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="guide-toolbar" role="search">
          <label className="guide-search" htmlFor="guide-search-input">
            <span className="guide-search-icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" width="18" height="18" focusable="false">
                <circle cx="8.5" cy="8.5" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.7" />
                <path d="M12.4 12.4L16.2 16.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </span>
            <input
              id="guide-search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search definitions…"
              autoComplete="off"
              spellCheck={false}
            />
            {query ? (
              <button type="button" className="guide-search-clear" onClick={() => setQuery("")}>
                Clear
              </button>
            ) : null}
          </label>
          <p className="guide-count" aria-live="polite">
            {visibleCount} of {total}
            {kindFilter !== "all" ? ` · ${kindLabel[kindFilter].toLowerCase()}s` : ""}
          </p>
        </div>

        <nav className="guide-jump" aria-label="Jump to a ritual">
          {GLOSSARY.map((group) => {
            const match = groups.find((item) => item.id === group.id);
            const count = match?.entries.length ?? 0;
            return (
              <a
                key={group.id}
                href={`#guide-${group.id}`}
                className={count === 0 ? "dim" : undefined}
                aria-disabled={count === 0}
                onClick={(event) => {
                  if (count === 0) event.preventDefault();
                }}
              >
                <strong>{group.title}</strong>
                <span>{count}</span>
              </a>
            );
          })}
        </nav>
      </section>

      {groups.length === 0 ? (
        <div className="guide-empty" role="status">
          <p>No definitions match that search.</p>
          <span>Try another word, or clear the filter.</span>
          <button
            type="button"
            className="btn tiny"
            onClick={() => {
              setQuery("");
              setKindFilter("all");
            }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        groups.map((group, groupIndex) => (
          <section
            key={group.id}
            className="guide-group"
            aria-labelledby={`guide-${group.id}`}
            style={{ animationDelay: `${Math.min(groupIndex, 6) * 40}ms` }}
          >
            <header className="guide-group-head">
              <div>
                <p className="eyebrow">
                  {group.entries.length} {group.entries.length === 1 ? "definition" : "definitions"}
                </p>
                <h2 id={`guide-${group.id}`}>{group.title}</h2>
              </div>
              <p>{group.intro}</p>
            </header>
            <div className="guide-list">
              {group.entries.map((entry, entryIndex) => {
                const paragraphs = glossaryParagraphs(entry.plain);
                return (
                  <article
                    key={entry.id}
                    className={`guide-entry kind-${entry.kind}`}
                    id={entry.id}
                    style={{ animationDelay: `${Math.min(entryIndex, 8) * 28}ms` }}
                  >
                    <div className="guide-entry-accent" aria-hidden="true" />
                    <div className="guide-entry-body">
                      <header className="guide-entry-top">
                        <h3>{entry.name}</h3>
                        <span className="guide-kind">{kindLabel[entry.kind]}</span>
                      </header>
                      <div className="guide-plain">
                        {paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                      {entry.formula ? (
                        <div className="guide-formula">
                          <span>Formula</span>
                          <p>{entry.formula}</p>
                        </div>
                      ) : null}
                      {entry.example ? (
                        <div className="guide-example">
                          <span>Example</span>
                          <p>{entry.example}</p>
                        </div>
                      ) : null}
                      <footer className="guide-where">
                        <span>Where you see it</span>
                        <p>{entry.where}</p>
                      </footer>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}
    </>
  );
}
