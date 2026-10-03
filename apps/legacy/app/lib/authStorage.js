import { getStoredUser, clearStoredUser } from "@/lib/getUser";
import { clearAccountChats } from "@/lib/chatHistory";

// Single source of truth for auth localStorage access: one set of keys, one
// SSR/quota-safe accessor, and a clearAuth() that removes only the auth keys
// (not a blanket localStorage.clear() that would wipe the onboarding draft).
const KEYS = {
  access: "accessToken",
  refresh: "refreshToken",
  user: "user",
};

const canUseStorage = () =>
  typeof window !== "undefined" && !!window.localStorage;

const read = (key) => {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Access can throw in private-browsing modes or when storage is blocked.
    return null;
  }
};

const write = (key, value) => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Quota errors / blocked storage — nothing actionable here.
  }
};

const remove = (key) => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore — the caller already treats the value as gone.
  }
};

export const getAccessToken = () => read(KEYS.access);
export const setAccessToken = (token) => write(KEYS.access, token);

export const getRefreshToken = () => read(KEYS.refresh);
export const setRefreshToken = (token) => write(KEYS.refresh, token);

/** Parsed `user` record, or an empty object when absent/unreadable. */
export const getUser = () => getStoredUser();
export const setUser = (user) => write(KEYS.user, JSON.stringify(user));

/** Removes the auth keys and the signed-in chats — nothing else. */
export const clearAuth = () => {
  remove(KEYS.access);
  remove(KEYS.refresh);
  clearStoredUser();
  clearAccountChats();
};
