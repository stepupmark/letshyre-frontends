import { useCallback, useState, useSyncExternalStore } from "react";
import { sendChatMessage } from "@/services/chatbot.service";
import { getUser } from "@/lib/getUser";
import { chatKey } from "@/lib/chatHistory";
import {
  EMPTY_CHAT,
  clearChat,
  getChat,
  getDraft,
  retryChat,
  sendChat,
  setDraft as storeDraft,
  subscribeChat,
} from "../chatStore";

/**
 * Assistant chat for the employee, employer and public landing bots. The
 * transcript lives in chatStore, so it's shared by every screen of the same
 * chat and kept across navigation for the rest of the tab session.
 *
 * @param {Object}   [options]
 * @param {"public"|"employer"|"employee"} [options.chat]
 * @param {Function} [options.sender]  – Defaults to the authed `sendChatMessage`;
 *   the landing widget injects the token-free `sendPublicChatMessage`.
 */
export function useChatbot({ chat = "public", sender = sendChatMessage } = {}) {
  const key = chatKey(chat, chat === "public" ? null : getUser().user);

  const subscribe = useCallback((listener) => subscribeChat(key, listener), [key]);
  // Empty on the server: the prerendered home page has no sessionStorage.
  const state = useSyncExternalStore(subscribe, () => getChat(key), () => EMPTY_CHAT);

  const [draft, setDraftState] = useState(() => getDraft(key));
  const setDraft = useCallback(
    (value) => {
      storeDraft(key, value);
      setDraftState(value);
    },
    [key],
  );

  const sendMessage = useCallback((text) => sendChat(key, sender, text), [key, sender]);
  const retryLast = useCallback(() => retryChat(key, sender), [key, sender]);
  const clear = useCallback(() => {
    clearChat(key);
    setDraftState("");
  }, [key]);

  return {
    messages: state.messages,
    isPending: state.pending,
    sendMessage,
    retryLast,
    clear,
    draft,
    setDraft,
  };
}
