import axios from "axios";
import api from "./api";

const CHAT_ENDPOINT = "/commonapp/v1/chatbot/chat/";

// Pull the bot reply out of the envelope. Shared by both variants so a response
// shape change is fixed in one place.
const unwrap = (res) => {
  const data = res.data?.data || {};
  return { sessionId: data.session_id, response: data.response || "" };
};

/**
 * Send a message to the assistant chatbot. The endpoint is shared across roles
 * (employee and employer), so this lives under services/common.
 *
 * @param {Object}  args
 * @param {string}  args.message     – The user's query.
 * @param {string} [args.sessionId]  – Session id from a prior turn; when present
 *                                      it's echoed back so the bot keeps context.
 * @returns {Promise<{ sessionId: string, response: string }>} – Bot reply
 *          (`response` is Markdown) plus the session id to reuse next turn.
 */
export const sendChatMessage = async ({ message, sessionId }) => {
  const body = { message };
  if (sessionId) body.session_id = sessionId;

  const res = await api.post(CHAT_ENDPOINT, body);
  return unwrap(res);
};

/**
 * Public (landing-page) variant of {@link sendChatMessage}. Uses a bare `axios`
 * call instead of the shared `api` instance ON PURPOSE: `api` auto-attaches any
 * token that happens to be in storage and, on a 401, runs a refresh flow that
 * redirects the whole window to "/". For an anonymous visitor that would hijack
 * the landing page mid-chat. Going through plain axios guarantees no
 * Authorization header and no refresh/redirect side effects.
 *
 * VITE_API_BASE_URL already ends with a slash (e.g. https://api.letshyre.com/),
 * so the endpoint is appended without a leading slash.
 */
export const sendPublicChatMessage = async ({ message, sessionId }) => {
  const body = { message };
  if (sessionId) body.session_id = sessionId;

  const url = `${import.meta.env.VITE_API_BASE_URL}${CHAT_ENDPOINT.replace(/^\//, "")}`;
  const res = await axios.post(url, body, {
    headers: { "Content-Type": "application/json" },
  });
  return unwrap(res);
};
