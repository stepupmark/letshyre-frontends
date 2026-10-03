export class ApiError extends Error {
  constructor(message, { status, backendMessage, fieldErrors, code } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.backendMessage = backendMessage;
    this.fieldErrors = fieldErrors;
    this.code = code;
  }
}

export function normalize(msg) {
  return msg
    ?.toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// DRF field errors arrive as { field: ["msg"] }, but a custom serializer can
// send a bare string or a nested object — flatten all three to { field: "msg" }.
export function extractFieldErrors(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const errors = {};
  for (const [field, value] of Object.entries(data)) {
    if (Array.isArray(value) && typeof value[0] === "string") {
      errors[field] = value[0];
    } else if (typeof value === "string") {
      errors[field] = value;
    }
  }
  return Object.keys(errors).length > 0 ? errors : null;
}

// Builds a resolve(error, { fallback }) that maps status/message to an i18n
// key. `messages` is an exact-match table keyed by normalize()'d backend
// text; `heuristics` is a fallback list of { test, key } for when the backend
// rewords a message the exact table doesn't catch.
export function createErrorResolver({ messages = {}, heuristics = [] } = {}) {
  return function resolve(error, { fallback }) {
    const status = error?.status;
    if (status === undefined || status === null) return "errors.network";
    if (status === 429) return "errors.tooManyAttempts";
    if (status >= 500) return "errors.server";

    const backendMessage = normalize(error?.backendMessage);
    if (backendMessage && messages[backendMessage]) return messages[backendMessage];

    if (backendMessage) {
      const match = heuristics.find((h) => h.test(backendMessage));
      if (match) return match.key;
    }

    return fallback;
  };
}
