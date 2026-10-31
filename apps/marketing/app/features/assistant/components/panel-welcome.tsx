import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { ArrowRight } from "lucide-react"

import { TOPICS, welcomePrompts } from "../lib/prompts"

type Ask = (text: string) => void

export function PanelWelcome({
  onAsk,
  onUndo,
}: {
  onAsk: Ask
  onUndo?: () => void
}) {
  const { t } = useTranslation("assistant")

  return (
    <div className="flex animate-in flex-col gap-5 duration-300 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
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
      <div className="flex flex-col gap-1 pt-1">
        <h2 className="text-base font-semibold tracking-tight text-balance">
          {t("chatbot.welcome.title")}
        </h2>
        <p className="text-sm text-pretty text-muted-foreground">
          {t("chatbot.welcome.hint")}
        </p>
      </div>
      <Tabs defaultValue={TOPICS[0]?.[0]} className="gap-2">
        <TabsList className="w-full">
          {TOPICS.map(([topic]) => (
            <TabsTrigger key={topic} value={topic} className="text-xs">
              {t(`chatbot.topics.${topic}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        {TOPICS.map(([topic, prompts]) => (
          <TabsContent
            key={topic}
            value={topic}
            className="animate-in duration-200 fade-in motion-reduce:animate-none"
          >
            <ul className="-mx-1 flex flex-col">
              {welcomePrompts(prompts).map((prompt) => (
                <li key={prompt}>
                  <button
                    type="button"
                    className="group/ask relative w-full rounded-lg py-2 ps-2 pe-8 text-start text-sm text-pretty transition-colors outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none"
                    onClick={() => {
                      onAsk(t(`chatbot.prompts.${prompt}`))
                    }}
                  >
                    {t(`chatbot.prompts.${prompt}`)}
                    <ArrowRight
                      aria-hidden
                      className="absolute inset-e-2 top-2.5 size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover/ask:opacity-100 group-focus-visible/ask:opacity-100 motion-reduce:transition-none rtl:-scale-x-100"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
