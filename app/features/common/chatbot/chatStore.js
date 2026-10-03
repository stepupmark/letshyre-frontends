import {
  CHAT_IDLE_MS,
  MAX_CHAT_MESSAGES,
  onAccountChatsCleared,
  readChat,
  removeChat,
  writeChat,
} from "@/lib/chatHistory";
import { getErrorMessage } from "@/lib/errorHandler";
import { showError } from "@/lib/toast";

// One store per chat key, outside React, so a reply that arrives after the
// user navigates away still lands, and the dashboard widget and the full
// chatbot page share one conversation.

/**
 * @typedef {Object} ChatMessage
 * @property {string} id
 * @property {"user"|"bot"} role
 * @property {string} content            – Markdown for bot, plain text for user.
 * @property {"sent"|"pending"|"error"} status
 * @property {string} [query]            – On a pending or failed bot message:
 *                                         the user query, so it can be retried.
 */

export const EMPTY_CHAT = Object.freeze({
  messages: [],
  sessionId: null,
  pending: false,
  updatedAt: 0,
});

const chats = new Map();

const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `m${Date.now()}-${Math.random().toString(36).slice(2)}`;

// A request cut off by a reload never answers; offer a retry instead.
const restore = (key) => {
  const saved = readChat(key);
  if (!saved) return EMPTY_CHAT;
  return {
    messages: saved.messages.map((m) => (m.status === "pending" ? { ...m, status: "error" } : m)),
    sessionId: saved.sessionId ?? null,
    pending: false,
    updatedAt: saved.updatedAt,
  };
};

function entry(key) {
  let chat = chats.get(key);
  if (!chat) {
    chat = { state: restore(key), listeners: new Set(), draft: "", generation: 0 };
    chats.set(key, chat);
  }
  return chat;
}

function set(key, chat, patch) {
  chat.state = { ...chat.state, ...patch, updatedAt: Date.now() };
  if (chat.state.messages.length) writeChat(key, chat.state);
  else removeChat(key);
  for (const listener of chat.listeners) listener();
}

function reset(key, chat) {
  chat.generation += 1;
  chat.draft = "";
  chat.state = EMPTY_CHAT;
  removeChat(key);
  for (const listener of chat.listeners) listener();
}

const isIdle = (state) => Date.now() - state.updatedAt >= CHAT_IDLE_MS;

onAccountChatsCleared(() => {
  for (const [key, chat] of chats) if (key !== "public") reset(key, chat);
});

export const getChat = (key) => entry(key).state;

export function subscribeChat(key, listener) {
  const chat = entry(key);
  if (chat.state.messages.length && !chat.state.pending && isIdle(chat.state)) reset(key, chat);
  chat.listeners.add(listener);
  return () => chat.listeners.delete(listener);
}

export const getDraft = (key) => entry(key).draft;
export const setDraft = (key, draft) => {
  entry(key).draft = draft;
};

async function run(key, chat, sender, botId, query) {
  const { generation } = chat;
  const settle = (patch, update) => {
    if (chat.generation !== generation) return false;
    set(key, chat, {
      ...patch,
      pending: false,
      messages: chat.state.messages.map((m) => (m.id === botId ? update(m) : m)),
    });
    return true;
  };

  set(key, chat, { pending: true });
  try {
    const { sessionId, response } = await sender({
      message: query,
      sessionId: chat.state.sessionId,
    });
    settle({ sessionId: sessionId || chat.state.sessionId }, (m) => ({
      id: m.id,
      role: "bot",
      content: response,
      status: "sent",
    }));
  } catch (err) {
    const settled = settle({}, (m) => ({ ...m, status: "error" }));
    // Only toast where the chat is on screen; elsewhere the failed message waits.
    if (settled && chat.listeners.size) showError(getErrorMessage(err));
  }
}

export function sendChat(key, sender, text) {
  const chat = entry(key);
  const query = (text || "").trim();
  if (!query || chat.state.pending) return;

  const bot = { id: uid(), role: "bot", content: "", status: "pending", query };
  set(key, chat, {
    messages: [
      ...chat.state.messages,
      { id: uid(), role: "user", content: query, status: "sent" },
      bot,
    ].slice(-MAX_CHAT_MESSAGES),
    // The server side of an idle conversation has likely expired.
    sessionId: isIdle(chat.state) ? null : chat.state.sessionId,
  });
  return run(key, chat, sender, bot.id, query);
}

export function retryChat(key, sender) {
  const chat = entry(key);
  if (chat.state.pending) return;
  const failed = chat.state.messages.findLast((m) => m.role === "bot" && m.status === "error");
  if (!failed) return;
  set(key, chat, {
    messages: chat.state.messages.map((m) => (m.id === failed.id ? { ...m, status: "pending" } : m)),
  });
  return run(key, chat, sender, failed.id, failed.query);
}

export const clearChat = (key) => reset(key, entry(key));

export const resetChatsForTests = () => chats.clear();
