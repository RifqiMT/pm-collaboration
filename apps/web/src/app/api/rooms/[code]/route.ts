import { fail, json, options, roomCode } from "@/server/http";
import { loadRoom } from "@/server/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ code: string }> };

export function OPTIONS() {
  return options();
}

export async function GET(request: Request, context: Context) {
  try {
    const { code: raw } = await context.params;
    const code = roomCode(raw);
    if (code.length !== 6) return json({ error: "That room does not exist." }, 404);
    const actorId = new URL(request.url).searchParams.get("actorId");
    const room = await loadRoom(code, actorId && actorId.length <= 80 ? actorId : null);
    return json({ room });
  } catch (error) {
    return fail(error, { route: "load-room" });
  }
}
