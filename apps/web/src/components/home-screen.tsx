"use client";

import { RITUALS, type RoomKind } from "@cadence/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const detail: Record<RoomKind, string> = {
  retro: "An icebreaker, private notes, a discussion, a dot vote, and actions with owners.",
  review: "A shared checklist, live feedback, and one decision: ship, iterate, or hold.",
  roadmap: "Score each bet next to the business outcome, then read the complexity.",
};

export function HomeScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="home" id="main">
      <header className="topbar">
        <span className="wordmark">Cadence</span>
        <form
          className="join"
          onSubmit={(event) => {
            event.preventDefault();
            const next = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
            if (next.length !== 6) {
              setError("Enter the 6-character room code.");
              return;
            }
            router.push(`/r/${next}`);
          }}
        >
          <label className="join-field">
            <span className="join-label">Room code</span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              aria-label="Room code"
              inputMode="text"
              autoCapitalize="characters"
            />
          </label>
          <button type="submit" className="btn primary">
            Join
          </button>
        </form>
      </header>
      <section className="hero">
        <p className="eyebrow">Sprint rooms</p>
        <h1>Retros, reviews, and roadmaps on one board.</h1>
        <p className="lede">
          Share a six-character code. Everyone sees the same notes, the same checklist, and the same score. No accounts.
        </p>
      </section>
      {error ? <p role="alert">{error}</p> : null}
      <div className="ritual-grid">
        {RITUALS.map((ritual, index) => (
          <Link key={ritual.kind} href={`/new?kind=${ritual.kind}`} className={`ritual-card kind-${ritual.kind}`}>
            <span className="ritual-top">
              <span className="index">0{index + 1}</span>
              <span className="start">Start</span>
            </span>
            <h2>{ritual.name}</h2>
            <p>{ritual.promise}</p>
            <p className="detail">{detail[ritual.kind]}</p>
            <ol>
              {ritual.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Link>
        ))}
      </div>
    </main>
  );
}
