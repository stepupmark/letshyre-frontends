import { acknowledge } from "../envelope.ts"
import type { HttpClient } from "../http.ts"

export interface ContactMessage {
  name: string
  email: string
  subject: string
  message: string
}

export async function sendContactMessage(
  client: HttpClient,
  input: ContactMessage,
  { signal }: { signal?: AbortSignal } = {}
) {
  return acknowledge(
    await client.post("/commonapp/v1/contact/", input, { signal })
  )
}
