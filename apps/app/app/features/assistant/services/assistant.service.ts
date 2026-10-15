import { sendAssistantMessage } from "@workspace/api/public"
import type { AssistantSend } from "@workspace/blocks/assistant"

import { api } from "@/lib/api"

export const sendMessage: AssistantSend = (message, sessionId, signal) =>
  sendAssistantMessage(api, { message, sessionId }, { signal })
