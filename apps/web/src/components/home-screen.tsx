"use client";

import { RITUALS, type RoomKind } from "@cadence/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const detail: Record<RoomKind, string> = {
  retro: "An icebreaker, private notes, a discussion, a dot vote, actions with owners, and a summary you can download.",
  planning: "Sprint Planning answers why this Sprint is valuable, what Developers can finish, and how they will do it. The Sprint Goal is the commitment. The items are a forecast.",
  refinement: "An ongoing pass over the Product Backlog: add detail, split what cannot finish in one Sprint, let Developers size it, and let the Product Owner order it.",
  review: "Inspect the Sprint Goal and the Increment with stakeholders, then adapt the Product Backlog. The call is release, adapt, or hold.",
  roadmap: "Score each bet next to the business outcome, then read the complexity.",
  direction: "Fill a published vision or strategy board, then read the direction back as one statement.",
};

export function HomeScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="home" id="main">
      <header className="topbar">
        <span className="wordmark-row">
          <span className="wordmark">TeamCompass</span>
          <Link href="/guide" className="guide-link">
            Definitions
          </Link>
        </span>
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
        <h1>Planning, refinement, reviews, retros, roadmaps, and direction on one board.</h1>
        <p className="lede">
          Helps teams align on direction, review progress, and decide what comes next. Share a six-character code.
          Everyone sees the same notes, the same checklist, and the same score. No accounts.
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
