import { useMutation } from "@tanstack/react-query"
import { sendAssistantMessage } from "@workspace/api/public"

import { api } from "@/lib/api"

import { readSessionId, writeSessionId } from "../lib/session"

export function useSendAssistantMessage() {
  return useMutation({
    mutationFn: (message: string) =>
      sendAssistantMessage(api, { message, sessionId: readSessionId() }),
    onSuccess: ({ sessionId }) => {
      writeSessionId(sessionId)
    },
  })
}
