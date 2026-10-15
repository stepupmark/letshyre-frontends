import {
  AssistantPrompts,
  type AssistantMessage,
} from "@workspace/blocks/assistant"
import { useTranslation } from "@workspace/i18n/react"

import { nextPrompts, TOPICS, type Prompt, type Side } from "../lib/prompts"

// a short reply to a question of their own is small talk ("hi"), not worth a reading list
const SMALL_TALK = 160

export function FollowUps({
  side,
  messages,
  onAsk,
}: {
  side: Side
  messages: AssistantMessage[]
  onAsk: (text: string) => void
}) {
  const { t } = useTranslation("assistant")
  const keyOf = new Map(
    TOPICS[side]
      .flatMap(([, prompts]) => prompts)
      .map((prompt) => [t(`prompts.${prompt}`), prompt])
  )
  const questions = messages.filter((m) => m.role === "user")
  const asked = questions
    .map((m) => keyOf.get(m.text))
    .filter((key): key is Prompt => key !== undefined)
  const lastKey = keyOf.get(questions.at(-1)?.text ?? "")
  const answer = messages.at(-1)?.text ?? ""
  if (!lastKey && answer.length < SMALL_TALK) return null
  const prompts = nextPrompts(side, lastKey, new Set(asked))
  if (prompts.length === 0) return null

  return (
    <div className="mt-5 flex animate-in flex-col gap-2 delay-150 duration-300 fill-mode-backwards fade-in slide-in-from-bottom-1 motion-reduce:animate-none">
      <p className="text-xs font-medium text-muted-foreground">
        {t("askNext")}
      </p>
      <AssistantPrompts
        prompts={prompts.map((prompt) => t(`prompts.${prompt}`))}
        onPick={onAsk}
      />
    </div>
  )
}
