export interface Identity {
  id: string;
  name: string;
}

const KEY = "cadence.identity";

export function readIdentity(): Identity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Identity>;
    if (typeof parsed.id !== "string" || typeof parsed.name !== "string") return null;
    if (!/^[A-Za-z0-9_-]{8,80}$/.test(parsed.id) || parsed.name.trim().length < 1) return null;
    return { id: parsed.id, name: parsed.name };
  } catch (error) {
    console.error("[cadence] could not read the saved name", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}

export function writeIdentity(identity: Identity) {
  localStorage.setItem(KEY, JSON.stringify(identity));
}

export function createIdentityId(): string {
  return `person_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return letters || "?";
}
