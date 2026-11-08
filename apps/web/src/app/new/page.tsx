import { NewRoomForm } from "@/components/new-room-form";
import type { RoomKind } from "@cadence/core";

export default async function NewPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const params = await searchParams;
  const kind: RoomKind = params.kind === "review" || params.kind === "roadmap" ? params.kind : "retro";
  return <NewRoomForm initialKind={kind} />;
}
