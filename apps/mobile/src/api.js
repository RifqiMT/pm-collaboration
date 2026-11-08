export function trimServer(value) {
  return value.trim().replace(/\/$/, "");
}

export async function request(server, path, options = {}) {
  let response;
  try {
    response = await fetch(`${trimServer(server)}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    });
  } catch (error) {
    console.error("[cadence] network request failed", {
      path,
      message: error instanceof Error ? error.message : "unknown",
    });
    throw new Error("Could not reach the server. Check the address and that the web app is running.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "The room could not be updated.");
  }
  return data;
}

export function createPersonId() {
  return `person_${globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}
