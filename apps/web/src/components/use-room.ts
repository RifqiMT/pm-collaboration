"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Op, RoomView } from "@cadence/core";
import type { Identity } from "./identity";

async function errorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: unknown };
    if (typeof data.error === "string" && data.error.length > 0) return data.error;
  } catch {
    return fallback;
  }
  return fallback;
}

export function useRoom(code: string, identity: Identity | null, joined: boolean) {
  const [room, setRoom] = useState<RoomView | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const chain = useRef<Promise<unknown>>(Promise.resolve());

  const enqueue = useCallback(<T,>(task: () => Promise<T>) => {
    const run = chain.current.then(task, task);
    chain.current = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }, []);

  const refresh = useCallback(() => {
    if (!identity || !joined) return Promise.resolve();
    return enqueue(async () => {
      const response = await fetch(`/api/rooms/${code}?actorId=${encodeURIComponent(identity.id)}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(await errorMessage(response, "Could not refresh the room."));
      }
      const data = (await response.json()) as { room: RoomView };
      setRoom((current) => {
        if (current && data.room.version < current.version) return current;
        return data.room;
      });
      setConnected(true);
      setConnectionError(null);
    }).catch((error: unknown) => {
      setConnected(false);
      setConnectionError(error instanceof Error ? error.message : "Could not refresh the room.");
    });
  }, [code, enqueue, identity, joined]);

  useEffect(() => {
    if (!identity || !joined) return;
    let stopped = false;
    let timer = 0;
    const loop = async () => {
      if (stopped) return;
      await refresh();
      if (stopped) return;
      timer = window.setTimeout(loop, document.hidden ? 8000 : 1500);
    };
    void loop();
    const onVisible = () => {
      if (!document.hidden) void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [identity, joined, refresh]);

  const send = useCallback(
    async (op: Op) => {
      if (!identity) return false;
      setActionError(null);
      try {
        await enqueue(async () => {
          const response = await fetch(`/api/rooms/${code}/ops`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ actorId: identity.id, op }),
          });
          if (!response.ok) {
            throw new Error(await errorMessage(response, "Could not save that change."));
          }
          const data = (await response.json()) as { room: RoomView };
          setRoom(data.room);
          setConnected(true);
        });
        return true;
      } catch (error) {
        console.error("[cadence] save failed", {
          message: error instanceof Error ? error.message : "unknown",
        });
        setActionError(error instanceof Error ? error.message : "Could not save that change.");
        return false;
      }
    },
    [code, enqueue, identity],
  );

  return { room, connectionError, actionError, connected, send };
}
