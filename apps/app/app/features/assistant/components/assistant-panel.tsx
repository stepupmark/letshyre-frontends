import {
  AssistantChat,
  AssistantSuggestions,
} from "@workspace/blocks/assistant"
import { useTranslation } from "@workspace/i18n/react"
import { use } from "react"

import { loadCopy } from "@/lib/i18n"

import { useAppAssistant } from "../hooks/use-app-assistant"
import { promptsFor, type Side } from "../lib/prompts"
import { FollowUps } from "./follow-ups"

/** The assistant in the side sheet; suggestions fit the page it opened on. */
export function AssistantPanel({ side, from }: { side: Side; from: string }) {
  use(loadCopy("assistant"))
  const { t } = useTranslation("assistant")
  const { chat, labels, offerUndo } = useAppAssistant(side)

  return (
    <AssistantChat
      chat={chat}
      labels={labels}
      focusOnOpen
      onClear={offerUndo}
      welcome={(ask) => (
        <AssistantSuggestions
          greeting={t("greeting")}
          hint={t(`hint.${side}`)}
          prompts={promptsFor(side, from).map((key) => t(`prompts.${key}`))}
          onPick={ask}
        />
      )}
      next={(ask, messages) => (
        <FollowUps side={side} messages={messages} onAsk={ask} />
      )}
    />
  )
}
