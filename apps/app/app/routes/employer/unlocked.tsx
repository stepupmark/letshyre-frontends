import { useTranslation } from "@workspace/i18n/react"
import { Link2 } from "lucide-react"
import { useCallback } from "react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { PageHeader } from "@/components/page-header"
import { CompareAction, MAX_COMPARE, ShareDialog } from "@/features/candidate"
import { UnlockedList, type Unlocked } from "@/features/candidate-unlock"
import { useJobOptions } from "@/features/employer-jobs"
import { buttonLink } from "@/lib/button-link"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "unlocked" } as const

export const clientMiddleware = [
  namespaces(["unlock", "candidate", "scorecard"]),
]

export default function UnlockedPage() {
  const { t } = useTranslation(["unlock", "common"])
  const jobs = useJobOptions()
  // a new function each render would rebuild the table's columns
  const share = useCallback(
    (row: Unlocked) => (
      <ShareDialog
        unlockId={row.id}
        name={row.candidate_name ?? ""}
        jobs={jobs}
        size="icon-sm"
        className="max-md:size-11"
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
            to={href("/employer/shared-links")}
            className={buttonLink({ variant: "outline" })}
          >
            <Link2 />
            {t("list.sharedLinks")}
          </AppLink>
        }
      />
      <UnlockedList
        share={share}
        note={
          <span className="text-xs">
            {t("list.compareHint", { max: MAX_COMPARE })}
          </span>
        }
        selected={(rows) => (
          <CompareAction
            people={rows.map((row) => ({
              id: row.id,
              name: row.candidate_name ?? "",
              photo: row.candidate_profile_photo,
            }))}
          />
        )}
      />
    </div>
  )
}
