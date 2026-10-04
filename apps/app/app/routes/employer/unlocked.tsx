import { useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { Link2 } from "lucide-react"

import { AppLink } from "@/components/app-link"
import { PageHeader } from "@/components/page-header"
import { UnlockedList } from "@/features/candidate-unlock"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "unlocked" } as const

export const clientMiddleware = [namespaces(["unlock"])]

export default function UnlockedPage() {
  const { t } = useTranslation(["unlock", "common"])
  return (
    <div className="flex flex-col gap-6">
      <title>{`${t("list.title")} · ${t("common:appName")}`}</title>
      <PageHeader
        title={t("list.title")}
        description={t("list.lead")}
        actions={
          <AppLink
            to="/employer/shared-links"
            className={buttonVariants({ variant: "outline" })}
          >
            <Link2 />
            {t("list.sharedLinks")}
          </AppLink>
        }
      />
      <UnlockedList />
    </div>
  )
}
