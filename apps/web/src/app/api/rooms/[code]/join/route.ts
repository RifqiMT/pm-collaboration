import { CadenceError } from "@cadence/core";
import { fail, json, options, readBody, roomCode } from "@/server/http";
import { enterRoom } from "@/server/store";

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
    if (typeof body.id !== "string" || typeof body.name !== "string") {
      throw new CadenceError("Name and participant id are required.", "actor");
    }
    const result = await enterRoom(code, body.id, body.name);
    return json(result);
  } catch (error) {
    return fail(error, { route: "join-room" });
  }
}
