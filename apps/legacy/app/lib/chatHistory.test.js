import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CHAT_IDLE_MS,
  chatKey,
  clearAccountChats,
  onAccountChatsCleared,
  readChat,
  writeChat,
} from "./chatHistory";

const message = (i) => ({ id: `m${i}`, role: i % 2 ? "bot" : "user", content: `text ${i}`, status: "sent" });
const chat = (count = 2) => ({
  messages: Array.from({ length: count }, (_, i) => message(i)),
  sessionId: "s1",
  updatedAt: Date.now(),
});

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("readChat / writeChat", () => {
  it("round-trips a chat", () => {
    writeChat("public", chat());
    expect(readChat("public")).toMatchObject({ sessionId: "s1", messages: chat().messages });
  });

  it("drops a chat idle for an hour", () => {
    writeChat("public", { ...chat(), updatedAt: Date.now() - CHAT_IDLE_MS });
    expect(readChat("public")).toBeNull();
    expect(sessionStorage.getItem("chat:v1:public")).toBeNull();
  });

  it("drops corrupt or malformed entries", () => {
    sessionStorage.setItem("chat:v1:public", "{not json");
    expect(readChat("public")).toBeNull();
    sessionStorage.setItem("chat:v1:public", JSON.stringify({ messages: [{ id: 1 }], updatedAt: Date.now() }));
    expect(readChat("public")).toBeNull();
    sessionStorage.setItem("chat:v1:public", JSON.stringify({ messages: [] }));
    expect(readChat("public")).toBeNull();
  });

  it("keeps only the newest 100 messages", () => {
    writeChat("public", chat(130));
    const { messages } = readChat("public");
    expect(messages).toHaveLength(100);
    expect(messages.at(-1).id).toBe("m129");
  });

  it("drops the oldest turns when storage is full", () => {
    const setItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (key, value) {
      if (value.length > 400) throw new DOMException("full", "QuotaExceededError");
      return setItem.call(this, key, value);
    });
    writeChat("public", chat(10));
    const { messages } = readChat("public");
    expect(messages.length).toBeGreaterThan(0);
    expect(messages.length).toBeLessThan(10);
    expect(messages.at(-1).id).toBe("m9");
  });

  it("never throws when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => writeChat("public", chat())).not.toThrow();
    expect(readChat("public")).toBeNull();
  });
});

describe("clearAccountChats", () => {
  it("removes signed-in chats, keeps the public one and notifies", () => {
    const listener = vi.fn();
    const off = onAccountChatsCleared(listener);
    writeChat("public", chat());
    writeChat("employer:1", chat());
    writeChat("employee:2", chat());
    sessionStorage.setItem("unrelated", "x");

    clearAccountChats();

    expect(readChat("public")).not.toBeNull();
    expect(readChat("employer:1")).toBeNull();
    expect(readChat("employee:2")).toBeNull();
    expect(sessionStorage.getItem("unrelated")).toBe("x");
    expect(listener).toHaveBeenCalledOnce();
    off();
  });
});

describe("chatKey", () => {
  it("scopes signed-in chats to the account", () => {
    expect(chatKey("public", { id: 1 })).toBe("public");
    expect(chatKey("employer", { id: 7 })).toBe("employer:7");
    expect(chatKey("employee", { user: { email: "a@b.c" } })).toBe("employee:a@b.c");
    expect(chatKey("employee", {})).toBe("employee");
  });
});
