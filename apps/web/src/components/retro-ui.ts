import type { RetroCardView, RetroPhase } from "@cadence/core";

export const RETRO_PHASES: { id: RetroPhase; label: string; short: string; hint: string }[] = [
  { id: "icebreak", label: "Icebreaker", short: "Warm-up", hint: "A short game before the retrospective starts." },
  { id: "brainstorm", label: "Notes", short: "Notes", hint: "Write freely. Other notes stay hidden until the discussion." },
  {
    id: "discuss",
    label: "Discuss",
    short: "Discuss",
    hint: "The host walks the room by status or by author. Notes stay in their status columns.",
  },
  { id: "vote", label: "Vote", short: "Vote", hint: "Spend your dots on the notes that matter most." },
  { id: "act", label: "Actions", short: "Act", hint: "Leave with an owner, not a pile of observations." },
  {
    id: "summary",
    label: "Summary",
    short: "Close",
    hint: "Read the retrospective, then download every note, vote, action, and icebreaker answer.",
  },
];

export function notesEditable(phase: RetroPhase): boolean {
  return phase === "brainstorm";
}

export function votingOpen(phase: RetroPhase): boolean {
  return phase === "vote";
}

export function authorLabel(card: RetroCardView): string {
  if (card.hidden) return "Private";
  if (card.anonymous) return card.mine ? "You · anonymous" : "Anonymous";
  if (card.mine) return "You";
  return card.authorName ?? "Someone";
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function timerTone(remaining: number | null): "idle" | "running" | "urgent" | "done" {
  if (remaining == null) return "idle";
  if (remaining === 0) return "done";
  if (remaining < 30_000) return "urgent";
  return "running";
}

export function phaseProgress(phase: RetroPhase): number {
  const index = RETRO_PHASES.findIndex((item) => item.id === phase);
  if (index < 0) return 0;
  return index / (RETRO_PHASES.length - 1);
}
