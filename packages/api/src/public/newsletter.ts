import { acknowledge } from "../envelope.ts"
import type { HttpClient } from "../http.ts"

export async function subscribe(
  client: HttpClient,
  email: string,
  { signal }: { signal?: AbortSignal } = {}
) {
  return acknowledge(
    await client.post("/commonapp/v1/stay_updated/", { email }, { signal })
  )
}
