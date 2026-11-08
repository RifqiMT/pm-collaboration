import { CadenceError, RETRO_TEMPLATES, type RetroTemplateId, type RoomKind } from "@cadence/core";
import { fail, json, options, readBody } from "@/server/http";
import { openRoom } from "@/server/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const kinds: RoomKind[] = ["retro", "review", "roadmap"];
const templates = Object.keys(RETRO_TEMPLATES) as RetroTemplateId[];

export function OPTIONS() {
  return options();
}

export async function POST(request: Request) {
  try {
    const body = (await readBody(request)) as Record<string, unknown>;
    const kind = body.kind;
    if (typeof kind !== "string" || !kinds.includes(kind as RoomKind)) {
      throw new CadenceError("Choose a retrospective, a sprint review, or a roadmap.", "kind");
    }
    const templateId = body.templateId;
    if (templateId !== undefined && (typeof templateId !== "string" || !templates.includes(templateId as RetroTemplateId))) {
      throw new CadenceError("Unknown retrospective template.", "template");
    }
    const result = await openRoom({
      kind: kind as RoomKind,
      title: typeof body.title === "string" ? body.title : "",
      hostName: typeof body.hostName === "string" ? body.hostName : "",
      hostId: typeof body.hostId === "string" ? body.hostId : undefined,
      templateId: templateId as RetroTemplateId | undefined,
      demo: body.demo === true,
    });
    return json(result, 201);
  } catch (error) {
    return fail(error, { route: "create-room" });
  }
}
