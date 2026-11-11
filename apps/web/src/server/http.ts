import { CadenceError } from "@cadence/core";
import { NextResponse } from "next/server";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers });
}

export function options() {
  return new NextResponse(null, { status: 204, headers });
}

function asCadenceError(error: unknown): CadenceError | null {
  if (error instanceof CadenceError) return error;
  // Bundlers can duplicate the class across packages; duck-type for prod reliability.
  if (
    error instanceof Error &&
    error.name === "CadenceError" &&
    typeof (error as { code?: unknown }).code === "string"
  ) {
    return error as CadenceError;
  }
  return null;
}

export function fail(error: unknown, context: Record<string, string>) {
  const cadence = asCadenceError(error);
  if (cadence) {
    const status = cadence.code === "missing" ? 404 : cadence.code === "store" ? 503 : 400;
    return json({ error: cadence.message, code: cadence.code }, status);
  }
  console.error("[cadence] request failed", {
    ...context,
    message: error instanceof Error ? error.message : "unknown",
  });
  return json({ error: "Something went wrong. Try again in a moment." }, 500);
}

export async function readBody(request: Request): Promise<unknown> {
  const text = await request.text();
  if (text.length > 100_000) {
    throw new CadenceError("That update is too large.", "limit");
  }
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new CadenceError("That request was not valid JSON.", "json");
  }
}

export function roomCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}
