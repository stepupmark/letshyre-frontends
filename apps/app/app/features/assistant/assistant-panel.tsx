import { useSession } from "@workspace/auth/react"
import { AssistantChat, useAssistant } from "@workspace/blocks/assistant"
import { sendAssistantMessage } from "@workspace/api/public"
import { useTranslation } from "@workspace/i18n/react"
import { use } from "react"
import { useLocation } from "react-router"

import { api } from "@/lib/api"
import { loadCopy } from "@/lib/i18n"

import { promptsFor, type Side } from "./prompts"

const send = (
  message: string,
  sessionId: string | undefined,
  signal: AbortSignal
) => sendAssistantMessage(api, { message, sessionId }, { signal })

/** One conversation per person and side, shared by the page and the sheet. */
export function AssistantPanel({
  side,
  from,
  focusOnOpen = false,
}: {
  side: Side
  /** The page the question is asked from; picks the suggestions. */
  from?: string
  focusOnOpen?: boolean
}) {
  use(loadCopy("assistant"))
  const { t } = useTranslation("assistant")
  const session = useSession()
  const { pathname } = useLocation()
  const who =
    session.status === "signed-in"
      ? (session.user.id ?? session.user.email)
      : undefined
  const user =
    typeof who === "string" || typeof who === "number" ? String(who) : "me"
  const chat = useAssistant(`${side}:${user}`, send)

  return (
    <AssistantChat
      chat={chat}
      focusOnOpen={focusOnOpen}
      prompts={promptsFor(side, from ?? pathname).map((key) =>
        t(`prompts.${key}`)
      )}
      labels={{
        log: t("log"),
        you: t("you"),
        assistant: t("assistant"),
        greeting: t("greeting"),
        hint: t(`hint.${side}`),
        input: t("input"),
        send: t("send"),
        stop: t("stop"),
        thinking: t("thinking"),
        stopped: t("stopped"),
        failed: t("failed"),
        retry: t("retry"),
        clear: t("clear"),
      }}
    />
  )
}
