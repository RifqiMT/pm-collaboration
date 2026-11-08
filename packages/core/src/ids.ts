export function createId(prefix: string): string {
  const value = globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `${prefix}_${value}`;
}
