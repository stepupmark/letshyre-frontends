import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CHAT_IDLE_MS, clearAccountChats, readChat, writeChat } from "@/lib/chatHistory";
import { showError } from "@/lib/toast";
import {
  clearChat,
  getChat,
  getDraft,
  resetChatsForTests,
  retryChat,
  sendChat,
  setDraft,
  subscribeChat,
} from "./chatStore";

vi.mock("@/lib/toast", () => ({ showError: vi.fn() }));

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

beforeEach(() => {
  sessionStorage.clear();
  resetChatsForTests();
  vi.mocked(showError).mockClear();
});
afterEach(() => vi.useRealTimers());

describe("chatStore", () => {
  it("persists a turn with its session id", async () => {
    const sender = vi.fn().mockResolvedValue({ sessionId: "s1", response: "hi" });
    await sendChat("public", sender, " hello ");

    const saved = readChat("public");
    expect(saved.sessionId).toBe("s1");
    expect(saved.messages.map((m) => [m.role, m.content, m.status])).toEqual([
      ["user", "hello", "sent"],
      ["bot", "hi", "sent"],
    ]);
    expect(saved.messages[1].query).toBeUndefined();
  });

  it("sends the stored session id on the next turn", async () => {
    const sender = vi.fn().mockResolvedValue({ sessionId: "s1", response: "ok" });
    await sendChat("public", sender, "one");
    await sendChat("public", sender, "two");
    expect(sender).toHaveBeenLastCalledWith({ message: "two", sessionId: "s1" });
  });

  it("restores a saved chat after a reload", () => {
    writeChat("employer:1", {
      messages: [{ id: "a", role: "user", content: "q", status: "sent" }],
      sessionId: "s9",
      updatedAt: Date.now(),
    });
    expect(getChat("employer:1")).toMatchObject({ sessionId: "s9", pending: false });
    expect(getChat("employer:1").messages).toHaveLength(1);
  });

  it("turns a reply cut off by a reload into a retryable error", async () => {
    writeChat("public", {
      messages: [
        { id: "a", role: "user", content: "q", status: "sent" },
        { id: "b", role: "bot", content: "", status: "pending", query: "q" },
      ],
      sessionId: null,
      updatedAt: Date.now(),
    });
    expect(getChat("public").messages[1].status).toBe("error");

    const sender = vi.fn().mockResolvedValue({ sessionId: "s1", response: "done" });
    await retryChat("public", sender);
    expect(sender).toHaveBeenCalledWith({ message: "q", sessionId: null });
    expect(getChat("public").messages[1]).toMatchObject({ status: "sent", content: "done" });
  });

  it("keeps a reply that arrives after the chat unmounts", async () => {
    const reply = deferred();
    const unsubscribe = subscribeChat("public", () => {});
    const sending = sendChat("public", () => reply.promise, "hello");
    expect(getChat("public").pending).toBe(true);

    unsubscribe();
    reply.resolve({ sessionId: "s1", response: "late" });
    await sending;

    expect(readChat("public").messages[1]).toMatchObject({ content: "late", status: "sent" });
  });

  it("blocks a second send while one is pending", async () => {
    const reply = deferred();
    const sender = vi.fn(() => reply.promise);
    const sending = sendChat("employer:1", sender, "one");
    sendChat("employer:1", sender, "two");
    expect(sender).toHaveBeenCalledOnce();
    reply.resolve({ sessionId: "s1", response: "ok" });
    await sending;
  });

  it("toasts a failure only while the chat is on screen", async () => {
    await sendChat("public", vi.fn().mockRejectedValue(new Error("down")), "a");
    expect(showError).not.toHaveBeenCalled();
    expect(getChat("public").messages[1].status).toBe("error");

    const unsubscribe = subscribeChat("public", () => {});
    await retryChat("public", vi.fn().mockRejectedValue(new Error("down")));
    expect(showError).toHaveBeenCalledOnce();
    unsubscribe();
  });

  it("ignores a reply that lands after the chat was cleared", async () => {
    const reply = deferred();
    const sending = sendChat("public", () => reply.promise, "hello");
    clearChat("public");
    reply.resolve({ sessionId: "s1", response: "late" });
    await sending;

    expect(getChat("public").messages).toEqual([]);
    expect(readChat("public")).toBeNull();
  });

  it("wipes signed-in chats and their in-flight replies on logout", async () => {
    const reply = deferred();
    await sendChat("public", vi.fn().mockResolvedValue({ sessionId: "p", response: "ok" }), "hi");
    const sending = sendChat("employer:1", () => reply.promise, "secret");
    setDraft("employer:1", "draft");

    clearAccountChats();
    reply.resolve({ sessionId: "s1", response: "late" });
    await sending;

    expect(getChat("employer:1").messages).toEqual([]);
    expect(getDraft("employer:1")).toBe("");
    expect(readChat("employer:1")).toBeNull();
    expect(getChat("public").messages).toHaveLength(2);
  });

  it("starts over when a chat is reopened after an hour idle", async () => {
    vi.useFakeTimers();
    await sendChat("public", vi.fn().mockResolvedValue({ sessionId: "s1", response: "ok" }), "hi");
    vi.setSystemTime(Date.now() + CHAT_IDLE_MS);

    const listener = vi.fn();
    subscribeChat("public", listener);
    expect(getChat("public").messages).toEqual([]);
  });

  it("drops the stale session id when sending after an hour idle", async () => {
    vi.useFakeTimers();
    const sender = vi.fn().mockResolvedValue({ sessionId: "s1", response: "ok" });
    await sendChat("public", sender, "one");
    vi.setSystemTime(Date.now() + CHAT_IDLE_MS);

    await sendChat("public", sender, "two");
    expect(sender).toHaveBeenLastCalledWith({ message: "two", sessionId: null });
  });
});
