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
  type RoomView,
} from "@cadence/core";
import { createPersistence, type Database, type Persistence } from "./persistence";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const globalStore = globalThis as typeof globalThis & {
  __cadenceQueue?: Promise<unknown>;
  __cadencePersistence?: Persistence;
};

/** Test helper — clears cached persistence so env overrides take effect. */
export function resetStorePersistence(): void {
  delete globalStore.__cadencePersistence;
  globalStore.__cadenceQueue = Promise.resolve();
}

function persistence(): Persistence {
  if (!globalStore.__cadencePersistence) {
    globalStore.__cadencePersistence = createPersistence();
  }
  return globalStore.__cadencePersistence;
}

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const previous = globalStore.__cadenceQueue ?? Promise.resolve();
  const run = previous.then(task, task);
  globalStore.__cadenceQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function update<T>(task: (db: Database) => T | Promise<T>): Promise<T> {
  return enqueue(async () => {
    const store = persistence();
    const release = await store.acquireLock();
    try {
      const db = await store.read();
      const result = await task(db);
      return result;
    } finally {
      await release();
    }
  });
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
  return update(async (db) => {
    const now = new Date().toISOString();
    const hostId = input.hostId ?? createParticipantId();
    if (!/^[A-Za-z0-9_-]{8,80}$/.test(hostId)) {
      throw new CadenceError("Invalid participant.", "actor");
    }
    const room = createRoom({ ...input, code: makeCode(db), hostId }, now);
    db.rooms[room.code] = room;
    await persistence().write(db);
    const participant = room.participants[0];
    if (!participant) throw new CadenceError("The room was created without a host.", "actor");
    return { room: presentRoom(room, hostId, now), participant };
  });
}

export function loadRoom(code: string, actorId: string | null): Promise<RoomView> {
  return update(async (db) => {
    const room = db.rooms[code];
    if (!room) throw new CadenceError("That room does not exist.", "missing");
    const now = new Date().toISOString();
    if (!actorId) return presentRoom(room, null, now);
    const seen = markSeen(room, actorId, now);
    if (seen.changed) {
      db.rooms[code] = seen.room;
      await persistence().write(db);
    }
    return presentRoom(seen.room, actorId, now);
  });
}

export function enterRoom(
  code: string,
  id: string,
  name: string,
): Promise<{ room: RoomView; participant: Participant }> {
  return update(async (db) => {
    const room = db.rooms[code];
    if (!room) throw new CadenceError("That room does not exist.", "missing");
    const now = new Date().toISOString();
    const result = joinRoom(room, { id, name }, now);
    db.rooms[code] = result.room;
    await persistence().write(db);
    return { room: presentRoom(result.room, id, now), participant: result.participant };
  });
}

export function operate(code: string, actorId: string, op: Op): Promise<RoomView> {
  return update(async (db) => {
    const room = db.rooms[code];
    if (!room) throw new CadenceError("That room does not exist.", "missing");
    const now = new Date().toISOString();
    const next = applyOp(room, op, actorId, now);
    if (next !== room) {
      db.rooms[code] = next;
      await persistence().write(db);
    }
    return presentRoom(next, actorId, now);
  });
}

export function storeBackend(): string {
  return persistence().backend;
}
