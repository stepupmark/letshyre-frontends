import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router"

import {
  isRecordId,
  ownScorecardQuery,
  RecordState,
  ScorecardView,
} from "@/features/candidate"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "scorecards" } as const

export const clientMiddleware = [namespaces(["candidate", "scorecard"])]

const OWN_LIST = "/employee/score-cards-list"

export default function OwnScorecardPage() {
  const { t } = useTranslation(["candidate", "scorecard", "common"])
  const [search] = useSearchParams()
  const id = search.get("id")
  const valid = isRecordId(id)
  const scorecard = useQuery({
    ...ownScorecardQuery(id ?? ""),
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
          to: OWN_LIST,
        }}
      >
        {(data) => <ScorecardView report={data} viewer="candidate" />}
      </RecordState>
    </>
  )
}
