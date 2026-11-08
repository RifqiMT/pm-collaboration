import { CadenceError, parseOp } from "@cadence/core";
import { fail, json, options, readBody, roomCode } from "@/server/http";
import { operate } from "@/server/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ code: string }> };

export function OPTIONS() {
  return options();
}

export async function POST(request: Request, context: Context) {
  try {
    const { code: raw } = await context.params;
    const code = roomCode(raw);
    if (code.length !== 6) throw new CadenceError("That room does not exist.", "missing");
    const body = (await readBody(request)) as Record<string, unknown>;
    if (typeof body.actorId !== "string") throw new CadenceError("Join the room before changing it.", "actor");
    const op = parseOp(body.op);
    const room = await operate(code, body.actorId, op);
    return json({ room });
  } catch (error) {
    return fail(error, { route: "room-op" });
  }
}
