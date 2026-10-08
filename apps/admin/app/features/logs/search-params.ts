import { oneOf, pageOf } from "@/lib/search-params"

export function readLogsParams(params: URLSearchParams) {
  return {
    channel: oneOf(params.get("channel"), ["email", "sms"]) ?? "email",
    page: pageOf(params),
  }
}
