import { AssistantChat, moveComposer } from "@workspace/blocks/assistant"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { SquarePen } from "lucide-react"

import { useAppAssistant } from "../hooks/use-app-assistant"
import { TOPICS, type Side } from "../lib/prompts"
import { FollowUps } from "./follow-ups"
import { AssistantGreeting, TopicPicker } from "./topic-welcome"

export function AssistantPage({ side }: { side: Side }) {
  const { t } = useTranslation(["assistant", "common"])
  const { chat, labels, offerUndo } = useAppAssistant(side)
  const examples = TOPICS[side].flatMap(([, prompts]) =>
    prompts.map((prompt) => t("try", { question: t(`prompts.${prompt}`) }))
  )

  return (
    <div className="min-h-main flex flex-col">
      <title>{`${t("title")} · ${t("common:appName")}`}</title>
      <h1 tabIndex={-1} className="sr-only">
        {t("title")}
      </h1>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        <AssistantChat
          chat={chat}
          labels={labels}
          layout="page"
          focusOnOpen
          hint={t("enterHint")}
          placeholders={examples}
          welcome={() => <AssistantGreeting side={side} />}
          suggestions={(ask) => <TopicPicker side={side} onAsk={ask} />}
          next={(ask, messages) => (
            <FollowUps side={side} messages={messages} onAsk={ask} />
          )}
          tools={
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("newChat")}
                    className="text-muted-foreground"
                    disabled={chat.pending}
                    onClick={() => {
                      moveComposer(() => {
                        offerUndo(chat.clear())
                      })
                    }}
                  />
                }
              >
                <SquarePen />
              </TooltipTrigger>
              <TooltipContent>{t("newChat")}</TooltipContent>
            </Tooltip>
          }
        />
      </div>
    </div>
  )
}
