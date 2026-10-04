import { useTranslation } from "@workspace/i18n/react"

import { Team } from "@/features/team"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "team" } as const

export const clientMiddleware = [namespaces(["team"])]

export default function TeamPage() {
  const { t } = useTranslation(["team", "common"])
  return (
    <>
      <title>{`${t("title")} · ${t("common:appName")}`}</title>
      <Team />
    </>
  )
}
