import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  ArrowRight,
  BriefcaseBusiness,
  Info,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import { useId } from "react"

import { TOPICS, welcomePrompts, type Topic } from "../lib/prompts"
import { AssistantFace } from "./assistant-face"

type Ask = (text: string) => void

const ICONS: Record<Topic, LucideIcon> = {
  about: Info,
  employers: BriefcaseBusiness,
  seekers: UserRound,
}

/** Before the first question: who it's for, and questions grouped by audience. */
export function PanelWelcome({
  onAsk,
  onUndo,
}: {
  onAsk: Ask
  onUndo?: () => void
}) {
  const { t } = useTranslation("assistant")

  return (
    <div className="flex animate-in flex-col gap-6 duration-300 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
      {onUndo && (
        <p
          role="status"
          className="flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-sm text-muted-foreground"
        >
          {t("chatbot.cleared")}
          <Button variant="ghost" size="xs" onClick={onUndo}>
            {t("chatbot.undo")}
          </Button>
        </p>
      )}
      <div className="flex flex-col items-start gap-3 pt-2">
        <AssistantFace className="size-12" />
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight text-balance">
            {t("chatbot.welcome.title")}
          </h2>
          <p className="text-sm text-pretty text-muted-foreground">
            {t("chatbot.welcome.hint")}
          </p>
        </div>
      </div>
      {TOPICS.map(([topic, prompts]) => (
        <TopicGroup
          key={topic}
          topic={topic}
          prompts={welcomePrompts(prompts).map((prompt) =>
            t(`chatbot.prompts.${prompt}`)
          )}
          onAsk={onAsk}
        />
      ))}
    </div>
  )
}

function TopicGroup({
  topic,
  prompts,
  onAsk,
}: {
  topic: Topic
  prompts: string[]
  onAsk: Ask
}) {
  const { t } = useTranslation("assistant")
  const headingId = useId()
  const Icon = ICONS[topic]

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <h3
        id={headingId}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
      >
        <Icon aria-hidden className="size-3.5" />
        {t(`chatbot.topics.${topic}`)}
      </h3>
      <ul className="flex flex-col divide-y overflow-hidden rounded-xl border">
        {prompts.map((prompt) => (
          <li key={prompt}>
            <button
              type="button"
              className="group/ask relative w-full py-2.5 ps-3 pe-9 text-start text-sm text-pretty transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset motion-reduce:transition-none"
              onClick={() => {
                onAsk(prompt)
              }}
            >
              {prompt}
              <ArrowRight
                aria-hidden
                className="absolute inset-e-3 top-3 size-3.5 text-muted-foreground transition-[translate] group-hover/ask:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover/ask:-translate-x-0.5"
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
