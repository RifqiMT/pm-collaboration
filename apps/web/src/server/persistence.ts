import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import { CadenceError, type Room } from "@cadence/core";

export type Database = { rooms: Record<string, Room> };

export type StoreBackend = "file" | "redis" | "supabase";

const ROOMS_KEY = "cadence:rooms";
const LOCK_KEY = "cadence:rooms:lock";
const LOCK_TTL_MS = 5_000;
const LOCK_WAIT_MS = 4_000;
const SUPABASE_ROW_ID = "rooms";

type SupabaseConfig = { url: string; key: string };

export function resolveStoreBackend(): StoreBackend {
  const forced = process.env.CADENCE_STORE?.trim().toLowerCase();
  if (forced === "file" || forced === "redis" || forced === "supabase") return forced;
  if (hasSupabaseEnv()) return "supabase";
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return "redis";
  }
  // Vercel Functions have no durable disk — prefer Supabase when configured later.
  if (process.env.VERCEL) return "supabase";
  return "file";
}

function hasSupabaseEnv(): boolean {
  return Boolean(process.env.SUPABASE_URL?.trim() && supabaseKey());
}

function supabaseKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    undefined
  );
}

function dataDir(): string {
  return process.env.CADENCE_DATA_DIR?.trim() || path.join(process.cwd(), "data");
}

function roomsFile(): string {
  return path.join(dataDir(), "rooms.json");
}

function lockFilePath(): string {
  return path.join(dataDir(), "rooms.lock");
}

function emptyDb(): Database {
  return { rooms: {} };
}

function normalizeDb(value: unknown): Database {
  if (!value || typeof value !== "object" || !("rooms" in value)) return emptyDb();
  const rooms = (value as Database).rooms;
  if (!rooms || typeof rooms !== "object") return emptyDb();
  return { rooms };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function missingRemoteStoreError(): CadenceError {
  return new CadenceError(
    "Room storage is not configured for this deployment. On Vercel, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY), run docs/supabase-schema.sql, then redeploy. Alternatively use a single-process host with the local file store.",
    "store",
  );
}

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw missingRemoteStoreError();
  return new Redis({ url, token });
}

function getSupabase(): SupabaseConfig {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = supabaseKey();
  if (!url || !key) throw missingRemoteStoreError();
  return { url, key };
}

async function acquireFileLock(): Promise<() => void> {
  const lockFile = lockFilePath();
  fs.mkdirSync(path.dirname(lockFile), { recursive: true });
  const started = Date.now();
  for (;;) {
    try {
      const fd = fs.openSync(lockFile, "wx");
      return () => {
        fs.closeSync(fd);
        try {
          fs.unlinkSync(lockFile);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
            console.error("[cadence] could not release the room store lock", {
              backend: "file",
              message: error instanceof Error ? error.message : "unknown",
            });
          }
        }
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      try {
        if (Date.now() - fs.statSync(lockFile).mtimeMs > LOCK_TTL_MS) fs.unlinkSync(lockFile);
      } catch (statError) {
        if ((statError as NodeJS.ErrnoException).code !== "ENOENT") throw statError;
      }
      if (Date.now() - started > LOCK_WAIT_MS) {
        throw new CadenceError("The room store is busy. Try again in a moment.", "store");
      }
      await delay(12);
    }
  }
}

async function acquireRedisLock(redis: Redis): Promise<() => void> {
  const token = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const started = Date.now();
  for (;;) {
    try {
      const ok = await redis.set(LOCK_KEY, token, { nx: true, px: LOCK_TTL_MS });
      if (ok) {
        return async () => {
          try {
            const current = await redis.get<string>(LOCK_KEY);
            if (current === token) await redis.del(LOCK_KEY);
          } catch (error) {
            console.error("[cadence] could not release the room store lock", {
              backend: "redis",
              message: error instanceof Error ? error.message : "unknown",
            });
          }
        };
      }
    } catch (error) {
      console.error("[cadence] could not acquire the room store lock", {
        backend: "redis",
        message: error instanceof Error ? error.message : "unknown",
      });
      throw new CadenceError("The room store is unavailable. Try again in a moment.", "store");
    }
    if (Date.now() - started > LOCK_WAIT_MS) {
      throw new CadenceError("The room store is busy. Try again in a moment.", "store");
    }
    await delay(25);
  }
}

/** Soft lock: in-process queue already serializes; this is a no-op release for Supabase. */
async function acquireSupabaseLock(): Promise<() => void> {
  return () => undefined;
}

async function readFileDb(): Promise<Database> {
  try {
    const parsed = JSON.parse(fs.readFileSync(roomsFile(), "utf8")) as unknown;
    return normalizeDb(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyDb();
    console.error("[cadence] could not read the room store", {
      backend: "file",
      message: error instanceof Error ? error.message : "unknown",
    });
    throw new CadenceError("The room store is unavailable. Try again in a moment.", "store");
  }
}

async function writeFileDb(db: Database): Promise<void> {
  const file = roomsFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(tmp, JSON.stringify(db));
    fs.renameSync(tmp, file);
  } catch (error) {
    try {
      fs.unlinkSync(tmp);
    } catch {
      // ignore cleanup failures
    }
    console.error("[cadence] could not write the room store", {
      backend: "file",
      message: error instanceof Error ? error.message : "unknown",
    });
    throw new CadenceError("The room store is unavailable. Try again in a moment.", "store");
  }
}

async function readRedisDb(redis: Redis): Promise<Database> {
  try {
    const value = await redis.get<Database | string>(ROOMS_KEY);
    if (value == null) return emptyDb();
    if (typeof value === "string") return normalizeDb(JSON.parse(value));
    return normalizeDb(value);
  } catch (error) {
    console.error("[cadence] could not read the room store", {
      backend: "redis",
      message: error instanceof Error ? error.message : "unknown",
    });
    throw new CadenceError("The room store is unavailable. Try again in a moment.", "store");
  }
}

async function writeRedisDb(redis: Redis, db: Database): Promise<void> {
  try {
    await redis.set(ROOMS_KEY, db);
  } catch (error) {
    console.error("[cadence] could not write the room store", {
      backend: "redis",
      message: error instanceof Error ? error.message : "unknown",
    });
    throw new CadenceError("The room store is unavailable. Try again in a moment.", "store");
  }
}

async function supabaseRequest(
  config: SupabaseConfig,
  pathAndQuery: string,
  init: RequestInit & { prefer?: string } = {},
): Promise<Response> {
  const { prefer, headers, ...rest } = init;
  return fetch(`${config.url}/rest/v1/${pathAndQuery}`, {
    ...rest,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
      ...(headers as Record<string, string> | undefined),
    },
  });
}

async function readSupabaseDb(config: SupabaseConfig): Promise<Database> {
  try {
    const response = await supabaseRequest(
      config,
      `cadence_store?id=eq.${encodeURIComponent(SUPABASE_ROW_ID)}&select=data`,
    );
    if (!response.ok) {
      const body = await response.text();
      console.error("[cadence] could not read the room store", {
        backend: "supabase",
        status: response.status,
        body: body.slice(0, 300),
      });
      if (response.status === 404 || body.includes("Could not find the table")) {
        throw new CadenceError(
          "Supabase table cadence_store is missing. Run docs/supabase-schema.sql in the Supabase SQL editor, then retry.",
          "store",
        );
      }
      throw new CadenceError("The room store is unavailable. Try again in a moment.", "store");
    }
    const rows = (await response.json()) as Array<{ data?: unknown }>;
    if (!Array.isArray(rows) || rows.length === 0) return emptyDb();
    return normalizeDb(rows[0]?.data);
  } catch (error) {
    if (error instanceof CadenceError) throw error;
    console.error("[cadence] could not read the room store", {
      backend: "supabase",
      message: error instanceof Error ? error.message : "unknown",
    });
    throw new CadenceError("The room store is unavailable. Try again in a moment.", "store");
  }
}

async function writeSupabaseDb(config: SupabaseConfig, db: Database): Promise<void> {
  try {
    const response = await supabaseRequest(config, "cadence_store", {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=minimal",
      body: JSON.stringify({
        id: SUPABASE_ROW_ID,
        data: db,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      console.error("[cadence] could not write the room store", {
        backend: "supabase",
        status: response.status,
        body: body.slice(0, 300),
      });
      if (response.status === 404 || body.includes("Could not find the table")) {
        throw new CadenceError(
          "Supabase table cadence_store is missing. Run docs/supabase-schema.sql in the Supabase SQL editor, then retry.",
          "store",
        );
      }
      throw new CadenceError("The room store is unavailable. Try again in a moment.", "store");
    }
  } catch (error) {
    if (error instanceof CadenceError) throw error;
    console.error("[cadence] could not write the room store", {
      backend: "supabase",
      message: error instanceof Error ? error.message : "unknown",
    });
    throw new CadenceError("The room store is unavailable. Try again in a moment.", "store");
  }
}

export type Persistence = {
  backend: StoreBackend;
  read: () => Promise<Database>;
  write: (db: Database) => Promise<void>;
  acquireLock: () => Promise<() => void | Promise<void>>;
};

export function createPersistence(backend = resolveStoreBackend()): Persistence {
  if (backend === "supabase") {
    return {
      backend,
      read: async () => readSupabaseDb(getSupabase()),
      write: async (db) => writeSupabaseDb(getSupabase(), db),
      acquireLock: acquireSupabaseLock,
    };
  }
  if (backend === "redis") {
    return {
      backend,
      read: async () => readRedisDb(getRedis()),
      write: async (db) => writeRedisDb(getRedis(), db),
      acquireLock: async () => acquireRedisLock(getRedis()),
    };
  }
  return {
    backend,
    read: readFileDb,
    write: writeFileDb,
    acquireLock: acquireFileLock,
  };
}
