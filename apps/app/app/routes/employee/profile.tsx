import { useTranslation } from "@workspace/i18n/react"

import { OwnProfile } from "@/features/candidate"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "profile" } as const

export const clientMiddleware = [namespaces(["candidate"])]

export default function ProfilePage() {
  const { t } = useTranslation(["candidate", "common"])
  return (
    <>
      <title>{`${t("own.title")} · ${t("common:appName")}`}</title>
      <OwnProfile />
    </>
  )
}
