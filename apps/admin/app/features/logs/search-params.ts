import { createLoader, parseAsStringLiteral } from "nuqs"
import { pageParser } from "@/lib/search-params"

export const logsSearchParams = {
  channel: parseAsStringLiteral(["email", "sms"]).withDefault("email"),
  page: pageParser,
}

export const loadLogsSearchParams = createLoader(logsSearchParams)
