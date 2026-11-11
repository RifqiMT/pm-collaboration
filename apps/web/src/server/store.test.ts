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
    upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnon: process.env.SUPABASE_ANON_KEY,
    supabaseService: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  afterEach(() => {
    const restore = (key: keyof typeof previous, envKey: string) => {
      const value = previous[key];
      if (value === undefined) delete process.env[envKey];
      else process.env[envKey] = value;
    };
    restore("store", "CADENCE_STORE");
    restore("vercel", "VERCEL");
    restore("upstashUrl", "UPSTASH_REDIS_REST_URL");
    restore("upstashToken", "UPSTASH_REDIS_REST_TOKEN");
    restore("supabaseUrl", "SUPABASE_URL");
    restore("supabaseAnon", "SUPABASE_ANON_KEY");
    restore("supabaseService", "SUPABASE_SERVICE_ROLE_KEY");
  });

  it("defaults to file when remote env is absent", () => {
    delete process.env.CADENCE_STORE;
    delete process.env.VERCEL;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(resolveStoreBackend()).toBe("file");
  });

  it("selects supabase on Vercel when remote env is absent (fails clearly at runtime)", () => {
    delete process.env.CADENCE_STORE;
    process.env.VERCEL = "1";
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(resolveStoreBackend()).toBe("supabase");
  });

  it("selects supabase when Supabase env is present", () => {
    delete process.env.CADENCE_STORE;
    delete process.env.VERCEL;
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon";
    expect(resolveStoreBackend()).toBe("supabase");
  });

  it("prefers supabase over redis when both are configured", () => {
    delete process.env.CADENCE_STORE;
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon";
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    expect(resolveStoreBackend()).toBe("supabase");
  });

  it("selects redis when only Upstash env is present", () => {
    delete process.env.CADENCE_STORE;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    expect(resolveStoreBackend()).toBe("redis");
  });

  it("honors CADENCE_STORE=file over remote env", () => {
    process.env.CADENCE_STORE = "file";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon";
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
