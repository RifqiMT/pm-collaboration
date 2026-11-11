import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CadenceError } from "@cadence/core";
import { createPersistence, resolveStoreBackend } from "./persistence";
import { enterRoom, loadRoom, openRoom, operate, resetStorePersistence, storeBackend } from "./store";

function tempDataDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "cadence-store-"));
}

describe("resolveStoreBackend", () => {
  const previous = {
    store: process.env.CADENCE_STORE,
    vercel: process.env.VERCEL,
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  };

  afterEach(() => {
    if (previous.store === undefined) delete process.env.CADENCE_STORE;
    else process.env.CADENCE_STORE = previous.store;
    if (previous.vercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previous.vercel;
    if (previous.url === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = previous.url;
    if (previous.token === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = previous.token;
  });

  it("defaults to file when Redis env is absent", () => {
    delete process.env.CADENCE_STORE;
    delete process.env.VERCEL;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    expect(resolveStoreBackend()).toBe("file");
  });

  it("requires redis on Vercel when Upstash env is absent", () => {
    delete process.env.CADENCE_STORE;
    process.env.VERCEL = "1";
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    expect(resolveStoreBackend()).toBe("redis");
  });

  it("selects redis when Upstash env is present", () => {
    delete process.env.CADENCE_STORE;
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    expect(resolveStoreBackend()).toBe("redis");
  });

  it("honors CADENCE_STORE=file over Redis env", () => {
    process.env.CADENCE_STORE = "file";
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    expect(resolveStoreBackend()).toBe("file");
  });
});

describe("file persistence store", () => {
  let dataDir = "";

  beforeEach(() => {
    dataDir = tempDataDir();
    process.env.CADENCE_STORE = "file";
    process.env.CADENCE_DATA_DIR = dataDir;
    resetStorePersistence();
  });

  afterEach(() => {
    resetStorePersistence();
    delete process.env.CADENCE_STORE;
    delete process.env.CADENCE_DATA_DIR;
    fs.rmSync(dataDir, { recursive: true, force: true });
  });

  it("creates, loads, joins, and applies an op against a durable file", async () => {
    expect(storeBackend()).toBe("file");

    const created = await openRoom({
      kind: "retro",
      title: "Sprint 12",
      hostName: "Maya",
      templateId: "start-stop-continue",
    });
    expect(created.room.code).toHaveLength(6);
    expect(created.participant.name).toBe("Maya");

    const guestId = "person_guestguest001";
    const joined = await enterRoom(created.room.code, guestId, "Alex");
    expect(joined.room.participants.some((p) => p.id === guestId)).toBe(true);

    const next = await operate(created.room.code, created.participant.id, {
      type: "retro.setPhase",
      phase: "brainstorm",
    });
    expect(next.retro?.phase).toBe("brainstorm");

    const reloaded = await loadRoom(created.room.code, created.participant.id);
    expect(reloaded.version).toBeGreaterThanOrEqual(next.version);
    expect(fs.existsSync(path.join(dataDir, "rooms.json"))).toBe(true);
  });

  it("returns a missing-room error for unknown codes", async () => {
    await expect(loadRoom("ZZZZZZ", null)).rejects.toMatchObject({
      code: "missing",
    } satisfies Partial<CadenceError>);
  });

  it("reads an empty database when the file is absent", async () => {
    const store = createPersistence("file");
    await expect(store.read()).resolves.toEqual({ rooms: {} });
  });
});
