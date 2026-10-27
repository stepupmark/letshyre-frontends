import { AssistantChat, useAssistant } from "@workspace/blocks/assistant"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { sendAssistantMessage } from "@workspace/api/public"
import { Button } from "@workspace/ui/components/button"
import { SquarePen } from "lucide-react"
import { use, useState } from "react"

import { api } from "@/lib/api"

import { loadAssistantCopy } from "../lib/copy"
import { FollowUps } from "./follow-ups"
import { PanelHeader } from "./panel-header"
import { PanelNotice } from "./panel-notice"
import { PanelWelcome } from "./panel-welcome"

const send = (
  message: string,
  sessionId: string | undefined,
  signal: AbortSignal
) => sendAssistantMessage(api, { message, sessionId }, { signal })

export function AssistantPanel() {
  use(loadAssistantCopy(useLocale()))
  const { t } = useTranslation("assistant")
  const chat = useAssistant("public", send)
  const [undo, setUndo] = useState<() => void>()

  return (
    <>
      <PanelHeader
        actions={
          chat.messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("chatbot.newChat")}
              onClick={(event) => {
                const restore = chat.clear()
                setUndo(() => restore)
                // the button leaves with the conversation; typing is what comes next
                event.currentTarget
                  .closest("[role=dialog]")
                  ?.querySelector("textarea")
                  ?.focus()
              }}
            >
              <SquarePen />
            </Button>
          )
        }
      />
      <AssistantChat
        chat={chat}
        focusOnOpen
        welcome={(ask) => <PanelWelcome onAsk={ask} onUndo={undo} />}
        next={(ask, messages) => <FollowUps messages={messages} onAsk={ask} />}
        notice={<PanelNotice />}
        labels={{
          log: t("chatbot.messagesLabel"),
          you: t("chatbot.you"),
          assistant: t("chatbot.assistant"),
          input: t("chatbot.inputPlaceholder"),
          send: t("chatbot.sendAria"),
          stop: t("chatbot.stop"),
          thinking: t("chatbot.thinking"),
          slow: t("chatbot.slow"),
          stopped: t("chatbot.stopped"),
          failed: t("chatbot.errorMessage"),
          retry: t("chatbot.retry"),
          clear: t("chatbot.newChat"),
          copy: t("chatbot.copy"),
          copied: t("chatbot.copied"),
          latest: t("chatbot.latest"),
        }}
      />
    </>
  )
}
