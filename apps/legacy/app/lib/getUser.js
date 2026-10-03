const ANONYMOUS = { isAuthenticated: false, role: null, user: null };

// The persisted auth record, for route loaders. Never throws: a malformed or
// non-object entry is treated as logged-out and cleared, so a bad value can't
// wedge every navigation with a JSON.parse SyntaxError.
export function getUser() {
  // `localStorage` is unavailable during prerender/SSR.
  if (typeof window === "undefined" || !window.localStorage) return ANONYMOUS;

  let raw;
  try {
    raw = window.localStorage.getItem("user");
  } catch {
    // Access can throw in private-browsing modes or when storage is blocked.
    return ANONYMOUS;
  }

  if (!raw) return ANONYMOUS;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    clearStoredUser();
    return ANONYMOUS;
  }

  if (!parsed || typeof parsed !== "object" || !parsed.role) {
    clearStoredUser();
    return ANONYMOUS;
  }

  return {
    isAuthenticated: true,
    role: parsed.role,
    user: parsed,
  };
}

// The parsed `user` record, or `{}` if absent/unreadable — for components that
// just need display fields. Unlike getUser() it makes no auth judgement and
// never mutates storage, but shares the same SSR guard and safe parsing.
export function getStoredUser() {
  if (typeof window === "undefined" || !window.localStorage) return {};

  let raw;
  try {
    raw = window.localStorage.getItem("user");
  } catch {
    return {};
  }

  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function clearStoredUser() {
  try {
    window.localStorage.removeItem("user");
  } catch {
    // Nothing actionable — the caller already treats the user as logged out.
  }
}
