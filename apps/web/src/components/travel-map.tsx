"use client";

import {
  TRAVEL_COUNTRIES,
  TRAVEL_WISHLIST_MAX,
  countryByCode,
  parseTravelWishlist,
  type IcebreakerAnswer,
  type Op,
} from "@cadence/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { WORLD_MAP_PATHS } from "./world-map-paths";

type CountryHit = {
  count: number;
  authors: string[];
};

export function TravelMap({
  answers,
  mine,
  nameOf,
  send,
  participantIds,
}: {
  answers: IcebreakerAnswer[];
  mine: IcebreakerAnswer | undefined;
  nameOf: (id: string) => string;
  send: (op: Op) => Promise<boolean>;
  participantIds: string[];
}) {
  const saved = parseTravelWishlist(mine?.body ?? "") ?? [];
  const [codes, setCodes] = useState<string[]>(saved);
  const codesRef = useRef(codes);
  const [query, setQuery] = useState("");
  const [hover, setHover] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const next = parseTravelWishlist(mine?.body ?? "") ?? [];
    codesRef.current = next;
    setCodes(next);
  }, [mine?.body]);

  const sharedCount = answers.length;
  const expectedCount = Math.max(participantIds.length, 1);
  const allShared =
    Boolean(mine) &&
    participantIds.length > 0 &&
    participantIds.every((id) => answers.some((answer) => answer.authorId === id));

  const roomHits = useMemo(() => {
    const hits = new Map<string, CountryHit>();
    if (!mine) return hits;
    for (const answer of answers) {
      const picked = parseTravelWishlist(answer.body) ?? [];
      const author = answer.id === mine.id ? "You" : nameOf(answer.authorId);
      for (const code of picked) {
        const current = hits.get(code) ?? { count: 0, authors: [] };
        current.count += 1;
        current.authors.push(author);
        hits.set(code, current);
      }
    }
    return hits;
  }, [answers, mine, nameOf]);

  const others = useMemo(() => {
    if (!mine) return new Set<string>();
    const picked = new Set<string>();
    for (const answer of answers) {
      if (answer.id === mine.id) continue;
      for (const code of parseTravelWishlist(answer.body) ?? []) picked.add(code);
    }
    return picked;
  }, [answers, mine]);

  const matches = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return [];
    return TRAVEL_COUNTRIES.filter((country) => country.name.toLocaleLowerCase().includes(needle)).slice(0, 8);
  }, [query]);

  const remaining = TRAVEL_WISHLIST_MAX - codes.length;
  const ready = codes.length > 0;
  const dirty =
    codes.length !== saved.length || codes.some((code, index) => code !== saved[index]);

  function toggle(code: string) {
    const current = codesRef.current;
    if (current.includes(code)) {
      const next = current.filter((item) => item !== code);
      codesRef.current = next;
      setCodes(next);
      setNote("");
      return;
    }
    if (current.length >= TRAVEL_WISHLIST_MAX) {
      setNote("Five countries is the wishlist limit. Remove one to add another.");
      return;
    }
    const next = [...current, code];
    codesRef.current = next;
    setCodes(next);
    setNote("");
  }

  function pathTone(code: string) {
    const minePicked = codes.includes(code);
    if (allShared) {
      const count = roomHits.get(code)?.count ?? 0;
      if (count <= 0) return minePicked ? "heat-mine" : "";
      const heat = `heat-${Math.min(count, 5)}`;
      return minePicked ? `${heat} heat-mine` : heat;
    }
    const roomPicked = others.has(code);
    if (minePicked && roomPicked) return "both";
    if (minePicked) return "mine";
    if (roomPicked) return "room";
    return "";
  }

  function hoverLabel(code: string, name: string) {
    if (!mine || !roomHits.has(code)) return name;
    const hit = roomHits.get(code)!;
    if (allShared) {
      return `${name} · ${hit.authors.join(", ")}`;
    }
    return `${name} · ${hit.count} ${hit.count === 1 ? "wishlist" : "wishlists"}`;
  }

  return (
    <div className="ice-answers wish">
      <section className={`wish-map-stage${allShared ? " unified" : ""}`} aria-label="Travel wishlist map">
        <header className="wish-map-toolbar">
          <p className="wish-hover">{hover || (allShared ? "Room map · hover a country" : "Tap a country on the map")}</p>
          <strong className="wish-slots" aria-live="polite">
            {codes.length}/{TRAVEL_WISHLIST_MAX}
          </strong>
        </header>
        <div className="wish-map">
          <svg viewBox="0 0 960 500" role="group" aria-label="World map">
            {WORLD_MAP_PATHS.map((shape) => {
              const country = countryByCode(shape.code);
              const name = country?.name ?? shape.code;
              const minePicked = codes.includes(shape.code);
              const tone = pathTone(shape.code);
              return (
                <path
                  key={shape.code}
                  d={shape.d}
                  data-code={shape.code}
                  className={tone}
                  aria-label={name}
                  aria-pressed={minePicked}
                  role="button"
                  tabIndex={0}
                  onMouseEnter={() => setHover(hoverLabel(shape.code, name))}
                  onMouseLeave={() => setHover("")}
                  onFocus={() => setHover(hoverLabel(shape.code, name))}
                  onBlur={() => setHover("")}
                  onClick={() => toggle(shape.code)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggle(shape.code);
                    }
                  }}
                >
                  <title>{hoverLabel(shape.code, name)}</title>
                </path>
              );
            })}
          </svg>
        </div>
        {mine || allShared ? (
          <div className="wish-legend" aria-label="Map legend">
            {allShared ? (
              <>
                <span>
                  <i className="heat-1" /> 1 person
                </span>
                <span>
                  <i className="heat-2" /> 2
                </span>
                <span>
                  <i className="heat-3" /> 3+
                </span>
                <span>
                  <i className="heat-mine" /> Your pick
                </span>
              </>
            ) : (
              <>
                <span>
                  <i className="mine" /> Your pick
                </span>
                <span>
                  <i className="room" /> On another wishlist
                </span>
                <span>
                  <i className="both" /> On both
                </span>
              </>
            )}
          </div>
        ) : (
          <p className="wish-hint">Pick up to five countries, then share to unlock the room map.</p>
        )}
      </section>

      <form
        className="wish-compose"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!ready || pending) return;
          setNote("");
          setPending(true);
          try {
            const ok = await send({ type: "retro.answerIcebreaker", body: codes.join(",") });
            if (!ok) setNote("That wishlist did not save. Try again.");
          } finally {
            setPending(false);
          }
        }}
      >
        <div className="wish-compose-head">
          <div>
            <p className="eyebrow">Your wishlist</p>
            <p className="wish-compose-copy">
              {remaining === 0
                ? "Wishlist full — remove a country to change it."
                : `${remaining} ${remaining === 1 ? "spot" : "spots"} left`}
            </p>
          </div>
          <button
            type="submit"
            className="btn primary"
            disabled={!ready || pending || (Boolean(mine) && !dirty)}
          >
            {pending ? "Sharing…" : mine ? "Update" : "Share"}
          </button>
        </div>

        <label className="ice-answer-field" htmlFor="wish-country-search">
          <span className="ice-answer-label">Find a country</span>
          <input
            id="wish-country-search"
            value={query}
            placeholder="Japan, Italy, New Zealand…"
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
        </label>

        {matches.length > 0 ? (
          <ul className="wish-matches">
            {matches.map((country) => (
              <li key={country.code}>
                <button
                  type="button"
                  className={codes.includes(country.code) ? "on" : ""}
                  onClick={() => {
                    toggle(country.code);
                    setQuery("");
                  }}
                >
                  {country.name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {codes.length > 0 ? (
          <ul className="wish-picks">
            {codes.map((code) => (
              <li key={code}>
                <button type="button" aria-label={`Remove ${countryByCode(code)?.name ?? code}`} onClick={() => toggle(code)}>
                  <CountryFlag code={code} />
                  {countryByCode(code)?.name ?? code}
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="ice-answers-empty wish-empty">
            <p>No countries selected</p>
            <span>Tap the map or search by name.</span>
          </div>
        )}

        {note ? (
          <p className="pair-note" role="alert">
            {note}
          </p>
        ) : null}
      </form>

      {mine ? (
        <div className="ice-answers-board">
          <header>
            <p className="eyebrow">{allShared ? "Unified room map" : "Room wishlists"}</p>
            <strong>
              {sharedCount}/{expectedCount} shared
            </strong>
          </header>
          {allShared ? (
            <p className="wish-board-note">
              Everyone has shared. The map above shows overlap — darker means more wishlists.
            </p>
          ) : (
            <p className="wish-board-note">
              Waiting on {Math.max(expectedCount - sharedCount, 0)}{" "}
              {expectedCount - sharedCount === 1 ? "person" : "people"} before the unified room map
              locks in.
            </p>
          )}
          <ul className="shout-list">
            {answers.map((answer, index) => (
              <li
                key={answer.id}
                className={answer.id === mine.id ? "mine" : ""}
                style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
              >
                <span className="ice-chip-avatar" aria-hidden="true">
                  {initials(answer.id === mine.id ? "You" : nameOf(answer.authorId))}
                </span>
                <div className="ice-chip-copy">
                  <p>
                    <strong>{answer.id === mine.id ? "You" : nameOf(answer.authorId)}</strong>
                  </p>
                  <span className="wish-room-countries">
                    {(parseTravelWishlist(answer.body) ?? []).map((code) => (
                      <span key={code} className="wish-room-country">
                        <CountryFlag code={code} />
                        {countryByCode(code)?.name ?? code}
                      </span>
                    ))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="ice-answers-empty">
          <p>Room map is waiting</p>
          <span>Share your wishlist to see where everyone else wants to go.</span>
        </div>
      )}
    </div>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function CountryFlag({ code }: { code: string }) {
  return (
    <img
      className="wish-flag"
      src={`/flags/${code.toLowerCase()}.svg`}
      alt=""
      width={18}
      height={18}
      draggable={false}
    />
  );
}
