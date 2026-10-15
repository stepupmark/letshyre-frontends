import { useSession } from "@workspace/auth/react"
import { AssistantMark } from "@workspace/blocks/assistant"
import { useTranslation } from "@workspace/i18n/react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import {
  ArrowRight,
  BriefcaseBusiness,
  ReceiptText,
  Send,
  UserRound,
  UsersRound,
  Video,
  type LucideIcon,
} from "lucide-react"

import { TOPICS, type Side, type Topic } from "../lib/prompts"

const ICONS: Record<Topic, LucideIcon> = {
  jobs: BriefcaseBusiness,
  candidates: UsersRound,
  billing: ReceiptText,
  applying: Send,
  interview: Video,
  profile: UserRound,
}

/** Above the centred input before the first question. */
export function AssistantGreeting({ side }: { side: Side }) {
  const { t } = useTranslation("assistant")
  const session = useSession()
  const first =
    session.status === "signed-in" ? session.user.first_name : undefined
  const name = typeof first === "string" ? first.trim() : ""

  return (
    <div className="flex animate-in flex-col items-center gap-3 text-center duration-300 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
      <AssistantMark size="lg" />
      <h2 className="text-2xl font-semibold tracking-tight text-balance">
        {name ? t("askName", { name }) : t("ask")}
      </h2>
      <p className="max-w-md text-sm text-pretty text-muted-foreground">
        {t(`intro.${side}`)}
      </p>
    </div>
  )
}

/** Under the centred input: a tab per topic, each with its questions. */
export function TopicPicker({
  side,
  onAsk,
}: {
  side: Side
  onAsk: (text: string) => void
}) {
  const { t } = useTranslation("assistant")
  const topics = TOPICS[side]

  return (
    <Tabs
      defaultValue={topics[0]?.[0]}
      className="mt-8 animate-in items-center delay-100 duration-300 fill-mode-backwards fade-in motion-reduce:animate-none"
    >
      <TabsList className="max-w-full justify-start overflow-x-auto">
        {topics.map(([topic]) => {
          const Icon = ICONS[topic]
          return (
            <TabsTrigger key={topic} value={topic}>
              <Icon aria-hidden="true" />
              {t(`topics.${topic}`)}
            </TabsTrigger>
          )
        })}
      </TabsList>
      {topics.map(([topic, prompts]) => (
        <TabsContent
          key={topic}
          value={topic}
          className="w-full animate-in duration-200 fade-in slide-in-from-bottom-1 motion-reduce:animate-none"
        >
          <ul className="flex flex-col divide-y">
            {prompts.map((prompt) => (
              <li key={prompt}>
                <button
                  type="button"
                  className="group/ask relative w-full rounded-md py-2.5 ps-3 pe-9 text-start text-sm transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                  onClick={() => {
                    onAsk(t(`prompts.${prompt}`))
                  }}
                >
                  {t(`prompts.${prompt}`)}
                  <ArrowRight
                    aria-hidden="true"
                    className="absolute inset-e-3 top-3 size-3.5 text-muted-foreground opacity-0 transition-[opacity,translate] group-hover/ask:translate-x-0.5 group-hover/ask:opacity-100 group-focus-visible/ask:opacity-100 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover/ask:-translate-x-0.5"
                  />
                </button>
              </li>
            ))}
          </ul>
        </TabsContent>
      ))}
    </Tabs>
  )
}
