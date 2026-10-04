import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"
import { ClipboardCheck } from "lucide-react"
import { useSearchParams } from "react-router"

import { AppLink } from "@/components/app-link"
import {
  CandidateProfileView,
  isRecordId,
  RecordState,
  ShareDialog,
  unlockedProfileQuery,
} from "@/features/candidate"
import { useJobOptions } from "@/features/employer-jobs"
import { namespaces } from "@/lib/i18n"
import { buttonLink } from "@/lib/button-link"

export const handle = { crumb: "unlocked" } as const

export const clientMiddleware = [namespaces(["candidate"])]

const UNLOCKED = "/employer/unlocked-candidates"

export default function CandidateProfilePage() {
  const { t } = useTranslation(["candidate", "common"])
  const [search] = useSearchParams()
  const id = search.get("id")
  const valid = isRecordId(id)
  const profile = useQuery({
    ...unlockedProfileQuery(id ?? ""),
    enabled: valid,
  })
  const jobs = useJobOptions()
  const name = profile.data?.candidate_name

  return (
    <>
      <title>{`${name ?? t("profile.title")} · ${t("common:appName")}`}</title>
      <RecordState
        valid={valid}
        query={profile}
        missing={{
          title: t("missing.title"),
          body: t("missing.body"),
          back: t("missing.back"),
          to: UNLOCKED,
        }}
      >
        {(data) => (
          <CandidateProfileView
            profile={data}
            actions={
              <>
                <ShareDialog
                  unlockId={data.id}
                  name={data.candidate_name ?? ""}
                  jobs={jobs}
                />
                <AppLink
                  to={`/employer/employee-score-card?id=${encodeURIComponent(data.id)}`}
                  className={buttonLink()}
                >
                  <ClipboardCheck />
                  {t("profile.scorecard")}
                </AppLink>
              </>
            }
          />
        )}
      </RecordState>
    </>
  )
}
