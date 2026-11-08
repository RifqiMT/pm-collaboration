import { CadenceError, LIMITS } from "./types";

export function cleanLine(input: unknown, max: number, label: string, required = true): string {
  if (typeof input !== "string") {
    throw new CadenceError(`${label} needs to be text.`, "text");
  }
  const value = input.replace(/[\u0000-\u001F]+/g, " ").replace(/\s+/g, " ").trim();
  if (required && value.length < 1) {
    throw new CadenceError(`${label} cannot be empty.`, "text");
  }
  if (value.length > max) {
    throw new CadenceError(`${label} must be ${max} characters or fewer.`, "text");
  }
  return value;
}

export function cleanBlock(input: unknown, max: number, label: string): string {
  if (typeof input !== "string") {
    throw new CadenceError(`${label} needs to be text.`, "text");
  }
  const value = input.replace(/\r\n/g, "\n").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
  if (value.length > max) {
    throw new CadenceError(`${label} must be ${max} characters or fewer.`, "text");
  }
  return value;
}

export function cleanName(input: unknown): string {
  return cleanLine(input, LIMITS.name, "Name");
}

export function asBoolean(input: unknown, label: string): boolean {
  if (typeof input !== "boolean") {
    throw new CadenceError(`${label} needs to be true or false.`, "type");
  }
  return input;
}

export function asNumber(input: unknown, label: string): number {
  if (typeof input !== "number" || !Number.isFinite(input)) {
    throw new CadenceError(`${label} needs to be a number.`, "type");
  }
  return input;
}

export function clampInt(input: unknown, min: number, max: number, label: string): number {
  const value = asNumber(input, label);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new CadenceError(`${label} must be a whole number from ${min} to ${max}.`, "range");
  }
  return value;
}

export function clampNumber(input: unknown, min: number, max: number, label: string): number {
  const value = asNumber(input, label);
  if (value < min || value > max) {
    throw new CadenceError(`${label} must be between ${min} and ${max}.`, "range");
  }
  return Math.round(value * 100) / 100;
}
