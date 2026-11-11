"use client";

import { RITUALS, type Op, type RoomView } from "@cadence/core";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createIdentityId, initials, readIdentity, writeIdentity, type Identity } from "./identity";
import { RetroBoard } from "./retro-board";
import { ReviewBoard } from "./review-board";
import { RoadmapBoard } from "./roadmap-board";
import { SharedField } from "./shared-field";
import { useRoom } from "./use-room";

export function RoomApp({ code }: { code: string }) {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [ready, setReady] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIdentity(readIdentity());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!identity) return;
    let cancelled = false;
    const join = async () => {
      try {
        const response = await fetch(`/api/rooms/${code}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(identity),
        });
        const data = await readResponse(response);
        const participant = data.participant as Identity | undefined;
        if (cancelled) return;
        if (!response.ok || !participant?.id || !participant.name) {
          setJoinError(typeof data.error === "string" ? data.error : "Could not join this room.");
          setJoined(false);
          return;
        }
        const next = { id: participant.id, name: participant.name };
        writeIdentity(next);
        setIdentity(next);
        setJoinError(null);
        setJoined(true);
      } catch (error) {
        console.error("[cadence] join failed", { message: error instanceof Error ? error.message : "unknown" });
        if (!cancelled) setJoinError("Could not reach the room. Check that you are online and try again.");
      }
    };
    void join();
    return () => {
      cancelled = true;
    };
  }, [code, identity?.id]);

  const { room, connectionError, actionError, connected, send } = useRoom(code, identity, joined);

  useEffect(() => {
    if (!room || !identity) return;
    const mine = room.participants.find((person) => person.id === identity.id);
    if (!mine || mine.name === identity.name) return;
    const next = { id: identity.id, name: mine.name };
    writeIdentity(next);
    setIdentity(next);
  }, [room, identity]);

  if (!ready) return <p className="status">Opening the room…</p>;
  if (!identity) return <NameGate code={code} onReady={setIdentity} />;
  if (joinError && !room) {
    return (
      <main className="gate" id="main">
        <p role="alert">{joinError}</p>
        <Link href="/">Back home</Link>
      </main>
    );
  }
  if (!room) return <p className="status">Joining {code}…</p>;

  const ritual = RITUALS.find((item) => item.kind === room.kind);
  const error = actionError || connectionError;

  return (
    <main className="room" id="main">
      <header className="room-bar">
        <div className="room-id">
          <Link href="/" className="wordmark">
            TeamCompass
          </Link>
          <div className="room-heading">
            <p className="eyebrow">{ritual?.name}</p>
            <SharedField
              value={room.title}
              onCommit={(title) => send({ type: "room.rename", title })}
              ariaLabel="Session title"
              className="room-title"
              maxLength={80}
            />
          </div>
        </div>
        <div className="room-meta">
          <button
            type="button"
            className="code"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(room.code);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1600);
              } catch (error) {
                console.error("[cadence] copy failed", { message: error instanceof Error ? error.message : "unknown" });
                setCopied(false);
              }
            }}
          >
            <span className="code-value">{copied ? "Copied" : room.code}</span>
            <small>{copied ? "Shared" : "Copy"}</small>
          </button>
          <ul className="people" aria-label="People in the room">
            {room.participants.map((person) => (
              <li key={person.id} className={person.active ? "active" : "away"} title={person.name}>
                <span className="avatar" style={{ background: person.color }}>
                  {initials(person.name)}
                </span>
                <span className="person-name">{person.name}</span>
              </li>
            ))}
          </ul>
          <NameEdit identity={identity} onRename={(name) => send({ type: "presence.rename", name })} />
          <p className={connected ? "live" : "live off"}>{connected ? "Live" : "Reconnecting"}</p>
        </div>
      </header>
      {error ? (
        <p className="banner" role="alert">
          {error}
        </p>
      ) : null}
      <Board room={room} actorId={identity.id} send={send} />
    </main>
  );
}

function Board({ room, actorId, send }: { room: RoomView; actorId: string; send: (op: Op) => Promise<boolean> }) {
  if (room.kind === "retro") return <RetroBoard room={room} actorId={actorId} send={send} />;
  if (room.kind === "review") return <ReviewBoard room={room} actorId={actorId} send={send} />;
  return <RoadmapBoard room={room} actorId={actorId} send={send} />;
}

function NameGate({ code, onReady }: { code: string; onReady: (identity: Identity) => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <main className="gate" id="main">
      <Link href="/" className="wordmark">
        TeamCompass
      </Link>
      <p className="eyebrow">Room {code}</p>
      <h1>What should the team call you?</h1>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setError(null);
          const identity = { id: createIdentityId(), name: name.trim() };
          try {
            const response = await fetch(`/api/rooms/${code}/join`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(identity),
            });
            const data = await readResponse(response);
            const participant = data.participant as Identity | undefined;
            if (!response.ok || !participant?.id || !participant.name) {
              setError(typeof data.error === "string" ? data.error : "Could not join this room.");
              return;
            }
            const next = { id: participant.id, name: participant.name };
            writeIdentity(next);
            onReady(next);
          } catch (joinError) {
            console.error("[cadence] name gate failed", {
              message: joinError instanceof Error ? joinError.message : "unknown",
            });
            setError("Could not reach the room. Try again.");
          } finally {
            setPending(false);
          }
        }}
      >
        <label>
          Your name
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} required autoFocus />
        </label>
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit" className="btn primary" disabled={pending}>
          {pending ? "Joining…" : "Join the room"}
        </button>
      </form>
    </main>
  );
}

function NameEdit({
  identity,
  onRename,
}: {
  identity: Identity;
  onRename: (name: string) => Promise<boolean>;
}) {
  const [name, setName] = useState(identity.name);
  useEffect(() => setName(identity.name), [identity.name]);
  const save = async () => {
    const next = name.trim();
    if (!next || next === identity.name) {
      setName(identity.name);
      return;
    }
    const saved = await onRename(next);
    if (!saved) setName(identity.name);
  };
  return (
    <form
      className="rename"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <label>
        <span className="sr">Your name</span>
        <input value={name} onChange={(event) => setName(event.target.value)} onBlur={save} maxLength={40} />
      </label>
    </form>
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
