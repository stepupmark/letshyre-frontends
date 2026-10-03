import { z } from "zod"

import { unwrap } from "../envelope.ts"
import type { HttpClient } from "../http.ts"

const readReply = unwrap(
  z.object({ session_id: z.string().min(1), response: z.string() })
)

/** `response` is Markdown. Send `sessionId` back on the next turn to keep context. */
export async function sendAssistantMessage(
  client: HttpClient,
  { message, sessionId }: { message: string; sessionId?: string },
  { signal }: { signal?: AbortSignal } = {}
): Promise<{ sessionId: string; response: string }> {
  const body = sessionId ? { message, session_id: sessionId } : { message }
  const data = readReply(
    await client.post("/commonapp/v1/chatbot/chat/", body, { signal })
  )
  return { sessionId: data.session_id, response: data.response }
}
