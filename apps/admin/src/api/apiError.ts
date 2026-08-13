/**
 * apiError.ts
 *
 * Shared API-layer error normalization helper.
 * No React, no hooks, no context — just a pure function.
 */

/**
 * Extracts a human-readable message from any error.
 *
 * Priority:
 *  1. response.data.message  — the server's own error string (e.g. "Invalid credentials.")
 *  2. error.message          — fallback Axios/network message
 *  3. Generic fallback
 */
export function extractMessage(err: unknown): string {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    err.response &&
    typeof err.response === "object" &&
    "data" in err.response
  ) {
    const body = (err.response as { data: unknown }).data;
    if (body && typeof body === "object" && "message" in body) {
      const msg = (body as { message: unknown }).message;
      if (typeof msg === "string" && msg.trim()) return msg.trim();
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong. Please try again.";
}
