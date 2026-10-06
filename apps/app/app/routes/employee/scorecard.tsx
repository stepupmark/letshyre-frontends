import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"
import { href } from "react-router"

import {
  isRecordId,
  ownScorecardQuery,
  RecordState,
  ScorecardView,
} from "@/features/candidate"
import { namespaces } from "@/lib/i18n"

import type { Route } from "./+types/scorecard"

export const handle = { crumb: "scorecards" } as const

export const clientMiddleware = [namespaces(["candidate", "scorecard"])]

export default function OwnScorecardPage({ params }: Route.ComponentProps) {
  const { t } = useTranslation(["candidate", "scorecard", "common"])
  const id = params.scorecardId
  const valid = isRecordId(id)
  const scorecard = useQuery({
    ...ownScorecardQuery(id),
    enabled: valid,
  })

  return (
    <>
      <title>{`${t("scorecard:header.yours")} · ${t("common:appName")}`}</title>
      <RecordState
        valid={valid}
        query={scorecard}
        missing={{
          title: t("missing.scorecardTitle"),
          body: t("missing.scorecardBody"),
          back: t("missing.backOwn"),
          to: href("/employee/scorecards"),
        }}
      >
        {(data) => <ScorecardView report={data} viewer="candidate" />}
      </RecordState>
    </>
  )
}
