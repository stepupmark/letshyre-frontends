import { AssistantChat, useAssistant } from "@workspace/blocks/assistant"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { sendAssistantMessage } from "@workspace/api/public"
import { use } from "react"

import { api } from "@/lib/api"

import { loadAssistantCopy } from "../lib/copy"

const PROMPTS = ["what", "scorecard", "applications", "interview"] as const

const send = (
  message: string,
  sessionId: string | undefined,
  signal: AbortSignal
) => sendAssistantMessage(api, { message, sessionId }, { signal })

export function AssistantPanel() {
  use(loadAssistantCopy(useLocale()))
  const { t } = useTranslation("assistant")
  const chat = useAssistant("public", send)

  return (
    <AssistantChat
      chat={chat}
      focusOnOpen
      prompts={PROMPTS.map((key) => t(`chatbot.empty.prompts.${key}`))}
      labels={{
        log: t("chatbot.messagesLabel"),
        you: t("chatbot.you"),
        assistant: t("chatbot.assistant"),
        greeting: t("chatbot.empty.greeting"),
        hint: t("chatbot.empty.hint"),
        input: t("chatbot.inputPlaceholder"),
        send: t("chatbot.sendAria"),
        stop: t("chatbot.stop"),
        thinking: t("chatbot.thinking"),
        stopped: t("chatbot.stopped"),
        failed: t("chatbot.errorMessage"),
        retry: t("chatbot.retry"),
        clear: t("chatbot.clear"),
      }}
    />
  )
}
