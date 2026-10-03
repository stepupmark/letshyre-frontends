// Chat transcripts in sessionStorage: they survive navigation and reloads, and
// go when the tab closes. Never throws: storage can be blocked, full or hold
// junk, and the chat must still work without it.

const PREFIX = "chat:v1:";
const PUBLIC_KEY = "public";

export const CHAT_IDLE_MS = 60 * 60 * 1000;
export const MAX_CHAT_MESSAGES = 100;
// Characters, roughly bytes for Latin text. Keeps one chat well inside the
// ~5 MB per-origin quota.
const MAX_CHARS = 500_000;

const clearListeners = new Set();

const storage = () => {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

const remove = (store, key) => {
  try {
    store.removeItem(key);
  } catch {
    // Already unreadable, nothing else to do.
  }
};

const isMessage = (m) =>
  m &&
  typeof m.id === "string" &&
  (m.role === "user" || m.role === "bot") &&
  typeof m.content === "string" &&
  ["sent", "pending", "error"].includes(m.status);

export function readChat(key) {
  const store = storage();
  if (!store) return null;
  const storageKey = PREFIX + key;
  try {
    const raw = store.getItem(storageKey);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const valid =
      data &&
      Array.isArray(data.messages) &&
      data.messages.every(isMessage) &&
      typeof data.updatedAt === "number" &&
      Date.now() - data.updatedAt < CHAT_IDLE_MS;
    if (valid) return data;
  } catch {
    // Corrupt JSON, dropped below.
  }
  remove(store, storageKey);
  return null;
}

// Drops the oldest turns until the chat fits, or removes it if nothing fits.
export function writeChat(key, { messages, sessionId, updatedAt }) {
  const store = storage();
  if (!store) return;
  const storageKey = PREFIX + key;
  let kept = messages.slice(-MAX_CHAT_MESSAGES);
  while (kept.length) {
    const json = JSON.stringify({ messages: kept, sessionId, updatedAt });
    if (json.length <= MAX_CHARS) {
      try {
        store.setItem(storageKey, json);
        return;
      } catch {
        // Quota full, try with less.
      }
    }
    kept = kept.slice(2);
  }
  remove(store, storageKey);
}

export function removeChat(key) {
  const store = storage();
  if (store) remove(store, PREFIX + key);
}

export const onAccountChatsCleared = (listener) => {
  clearListeners.add(listener);
  return () => clearListeners.delete(listener);
};

// Signed-in chats only; the public landing chat isn't tied to an account.
export function clearAccountChats() {
  const store = storage();
  if (store) {
    try {
      const keys = Array.from({ length: store.length }, (_, i) => store.key(i));
      for (const key of keys) {
        if (key?.startsWith(PREFIX) && key !== PREFIX + PUBLIC_KEY) remove(store, key);
      }
    } catch {
      // Storage went away mid-loop.
    }
  }
  for (const listener of clearListeners) listener();
}

export const chatKey = (chat, user) => {
  if (chat === PUBLIC_KEY) return PUBLIC_KEY;
  const id = user?.id ?? user?.user_id ?? user?.user?.id ?? user?.email ?? user?.user?.email;
  return id == null ? chat : `${chat}:${id}`;
};
