import { setupServer } from "msw/node"
import { afterAll, afterEach, beforeAll } from "vitest"

import { createHttpClient, type HttpClientOptions } from "../src/http.ts"

export const BASE = "https://api.test/"

export const server = setupServer()

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" })
})
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

export const url = (path: string) => new URL(path, BASE).href

export function client(options: Partial<HttpClientOptions> = {}) {
  return createHttpClient({ baseUrl: BASE, retryDelayMs: () => 0, ...options })
}
