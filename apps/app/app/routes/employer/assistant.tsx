import { AssistantPage } from "@/features/assistant"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "assistant" } as const

export const clientMiddleware = [namespaces(["assistant"])]

export default function Assistant() {
  return <AssistantPage side="employer" />
}
