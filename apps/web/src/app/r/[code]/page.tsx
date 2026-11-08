import { RoomApp } from "@/components/room-app";

export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <RoomApp code={code.toUpperCase()} />;
}
