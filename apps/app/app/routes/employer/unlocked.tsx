import { useTranslation } from "@workspace/i18n/react"
import { Link2 } from "lucide-react"
import { useCallback } from "react"

import { AppLink } from "@/components/app-link"
import { PageHeader } from "@/components/page-header"
import { ShareDialog } from "@/features/candidate"
import { UnlockedList, type Unlocked } from "@/features/candidate-unlock"
import { useJobOptions } from "@/features/employer-jobs"
import { namespaces } from "@/lib/i18n"
import { buttonLink } from "@/lib/button-link"

export const handle = { crumb: "unlocked" } as const

export const clientMiddleware = [namespaces(["unlock", "candidate"])]

export default function UnlockedPage() {
  const { t } = useTranslation(["unlock", "common"])
  const jobs = useJobOptions()
  const share = useCallback(
    (row: Unlocked) => (
      <ShareDialog
        unlockId={row.id}
        name={row.candidate_name ?? ""}
        jobs={jobs}
        size="sm"
      />
    ),
    [jobs]
  )
  return (
    <div className="flex flex-col gap-6">
      <title>{`${t("list.title")} · ${t("common:appName")}`}</title>
      <PageHeader
        title={t("list.title")}
        description={t("list.lead")}
        actions={
          <AppLink
            to="/employer/shared-links"
            className={buttonLink({ variant: "outline" })}
          >
            <Link2 />
            {t("list.sharedLinks")}
          </AppLink>
        }
      />
      <UnlockedList share={share} />
    </div>
  )
}
