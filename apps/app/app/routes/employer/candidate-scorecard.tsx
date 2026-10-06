import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"
import { SquareUser } from "lucide-react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import {
  isRecordId,
  RecordState,
  ScorecardView,
  ShareDialog,
  unlockedScorecardQuery,
} from "@/features/candidate"
import { useJobOptions } from "@/features/employer-jobs"
import { namespaces } from "@/lib/i18n"
import { buttonLink } from "@/lib/button-link"

import type { Route } from "./+types/candidate-scorecard"

export const handle = { crumb: "unlocked" } as const

export const clientMiddleware = [namespaces(["candidate", "scorecard"])]

export default function CandidateScorecardPage({
  params,
}: Route.ComponentProps) {
  const { t } = useTranslation(["candidate", "common"])
  const id = params.candidateId
  const valid = isRecordId(id)
  const scorecard = useQuery({
    ...unlockedScorecardQuery(id),
    enabled: valid,
  })
  const jobs = useJobOptions()
  const name = scorecard.data?.candidate_name

  return (
    <>
      <title>{`${name ? `${name} · ` : ""}${t("scorecard.title")} · ${t("common:appName")}`}</title>
      <RecordState
        valid={valid}
        query={scorecard}
        missing={{
          title: t("missing.scorecardTitle"),
          body: t("missing.scorecardBody"),
          back: t("missing.back"),
          to: href("/employer/candidates/unlocked"),
        }}
      >
        {(data) => (
          <ScorecardView
            report={data}
            actions={
              <>
                <AppLink
                  to={href("/employer/candidates/:candidateId", {
                    candidateId: id,
                  })}
                  className={buttonLink({ variant: "outline" })}
                >
                  <SquareUser />
                  {t("scorecard.profile")}
                </AppLink>
                <ShareDialog
                  unlockId={id}
                  name={data.candidate_name ?? ""}
                  jobs={jobs}
                />
              </>
            }
          />
        )}
      </RecordState>
    </>
  )
}
