import fs from "fs";
import path from "path";
import {
  CadenceError,
  applyOp,
  createRoom,
  joinRoom,
  markSeen,
  presentRoom,
  type CreateRoomInput,
  type Op,
  type Participant,
  type Room,
  type RoomView,
} from "@cadence/core";

const file = path.join(process.cwd(), "data", "rooms.json");
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

type Database = { rooms: Record<string, Room> };

const lockFile = path.join(process.cwd(), "data", "rooms.lock");
const globalStore = globalThis as typeof globalThis & { __cadenceQueue?: Promise<unknown> };

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const previous = globalStore.__cadenceQueue ?? Promise.resolve();
  const run = previous.then(task, task);
  globalStore.__cadenceQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function acquireLock(): Promise<() => void> {
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
            console.error("[cadence] could not release the room store", {
              message: error instanceof Error ? error.message : "unknown",
            });
          }
        }
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      try {
        if (Date.now() - fs.statSync(lockFile).mtimeMs > 5_000) fs.unlinkSync(lockFile);
      } catch (statError) {
        if ((statError as NodeJS.ErrnoException).code !== "ENOENT") throw statError;
      }
      if (Date.now() - started > 4_000) {
        throw new CadenceError("The room store is busy. Try again in a moment.", "store");
      }
      await delay(12);
    }
  }
}

function update<T>(task: (db: Database) => T): Promise<T> {
  return enqueue(async () => {
    const release = await acquireLock();
    try {
      return task(read());
    } finally {
      release();
    }
  });
}

function read(): Database {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Database;
    if (!parsed || typeof parsed !== "object" || !parsed.rooms) return { rooms: {} };
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { rooms: {} };
    console.error("[cadence] could not read the room store", {
      message: error instanceof Error ? error.message : "unknown",
    });
    throw new CadenceError("The room store is unavailable. Try again in a moment.", "store");
  }
}

function write(db: Database) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db));
  fs.renameSync(tmp, file);
}

function makeCode(db: Database): string {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    let code = "";
    for (const byte of bytes) code += alphabet[byte % alphabet.length];
    if (!db.rooms[code]) return code;
  }
  throw new CadenceError("Could not open a room. Try again.", "code");
}

function createParticipantId(): string {
  return `person_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export function openRoom(
  input: Omit<CreateRoomInput, "code" | "hostId"> & { hostId?: string },
): Promise<{ room: RoomView; participant: Participant }> {
  return update((db) => {
    const now = new Date().toISOString();
    const hostId = input.hostId ?? createParticipantId();
    if (!/^[A-Za-z0-9_-]{8,80}$/.test(hostId)) {
      throw new CadenceError("Invalid participant.", "actor");
    }
    const room = createRoom({ ...input, code: makeCode(db), hostId }, now);
    db.rooms[room.code] = room;
    write(db);
    const participant = room.participants[0];
    if (!participant) throw new CadenceError("The room was created without a host.", "actor");
    return { room: presentRoom(room, hostId, now), participant };
  });
}

export function loadRoom(code: string, actorId: string | null): Promise<RoomView> {
  return update((db) => {
    const room = db.rooms[code];
    if (!room) throw new CadenceError("That room does not exist.", "missing");
    const now = new Date().toISOString();
    if (!actorId) return presentRoom(room, null, now);
    const seen = markSeen(room, actorId, now);
    if (seen.changed) {
      db.rooms[code] = seen.room;
      write(db);
    }
    return presentRoom(seen.room, actorId, now);
  });
}

export function enterRoom(
  code: string,
  id: string,
  name: string,
): Promise<{ room: RoomView; participant: Participant }> {
  return update((db) => {
    const room = db.rooms[code];
    if (!room) throw new CadenceError("That room does not exist.", "missing");
    const now = new Date().toISOString();
    const result = joinRoom(room, { id, name }, now);
    db.rooms[code] = result.room;
    write(db);
    return { room: presentRoom(result.room, id, now), participant: result.participant };
  });
}

export function operate(code: string, actorId: string, op: Op): Promise<RoomView> {
  return update((db) => {
    const room = db.rooms[code];
    if (!room) throw new CadenceError("That room does not exist.", "missing");
    const now = new Date().toISOString();
    const next = applyOp(room, op, actorId, now);
    if (next !== room) {
      db.rooms[code] = next;
      write(db);
    }
    return presentRoom(next, actorId, now);
  });
}
