import {
  AssistantPrompts,
  type AssistantMessage,
} from "@workspace/blocks/assistant"
import { useTranslation } from "@workspace/i18n/react"

import { nextPrompts, TOPICS, topicOf, type Prompt } from "../lib/prompts"
import { SignUpCard } from "./sign-up-card"

// a short reply to a question of their own is small talk ("hi"), not worth a reading list
const SMALL_TALK = 160

/** Under the latest answer: what to ask next, and a way in once the topic is hiring or job hunting. */
export function FollowUps({
  messages,
  onAsk,
}: {
  messages: AssistantMessage[]
  onAsk: (text: string) => void
}) {
  const { t } = useTranslation("assistant")
  const keyOf = new Map(
    TOPICS.flatMap(([, prompts]) => prompts).map((prompt) => [
      t(`chatbot.prompts.${prompt}`),
      prompt,
    ])
  )
  const questions = messages.filter((m) => m.role === "user")
  const asked = questions
    .map((m) => keyOf.get(m.text))
    .filter((key): key is Prompt => key !== undefined)
  const lastKey = keyOf.get(questions.at(-1)?.text ?? "")
  const answer = messages.at(-1)?.text ?? ""
  if (!lastKey && answer.length < SMALL_TALK) return null
  const prompts = nextPrompts(lastKey, new Set(asked))
  const topic = lastKey && topicOf(lastKey)

  return (
    <div className="mt-5 flex animate-in flex-col gap-4 delay-150 duration-300 fill-mode-backwards fade-in slide-in-from-bottom-1 motion-reduce:animate-none">
      {prompts.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            {t("chatbot.askNext")}
          </p>
          <AssistantPrompts
            prompts={prompts.map((prompt) => t(`chatbot.prompts.${prompt}`))}
            onPick={onAsk}
          />
        </div>
      )}
      {(topic === "employers" || topic === "seekers") && (
        <SignUpCard audience={topic} />
      )}
    </div>
  )
}
