import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/page-header"
import { AssistantPanel } from "@/features/assistant"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "assistant" } as const

export const clientMiddleware = [namespaces(["assistant"])]

export default function AssistantPage() {
  const { t } = useTranslation(["assistant", "common"])
  return (
    <div className="flex h-[calc(100dvh-10rem)] min-h-96 flex-col gap-4 md:h-[calc(100dvh-11rem)]">
      <title>{`${t("title")} · ${t("common:appName")}`}</title>
      <PageHeader title={t("title")} description={t("lead.candidate")} />
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden rounded-lg border">
        <AssistantPanel side="candidate" focusOnOpen />
      </div>
    </div>
  )
}
