"use client";

import { RITUALS, type RoomKind } from "@cadence/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const detail: Record<RoomKind, string> = {
  retro: "Warm up, write private notes, discuss, vote, assign owners, and download a summary.",
  planning: "Set the Sprint Goal, pull what you can finish, and plan the first days. Selected work is a forecast.",
  refinement: "Add detail, split oversized work, size it, and order the backlog — without starting the Sprint.",
  review: "Check the goal, show what's Done, hear stakeholders, then update the backlog.",
  roadmap: "Score each idea next to the outcome and difficulty so priorities are easy to see.",
  direction: "Fill a vision or strategy board, then read it back as one clear statement.",
  prd: "Walk one requirement through people, business value, and build quality before it becomes backlog work.",
  artifacts: "Open finished sample docs for the agent workspace, contact center, and CS data products.",
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
        <h1>One shared board for planning, review, and what comes next.</h1>
        <p className="lede">
          Create a room, share a six-character code, and work together in real time. Same notes, same checklist, same
          scores. No accounts.
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
