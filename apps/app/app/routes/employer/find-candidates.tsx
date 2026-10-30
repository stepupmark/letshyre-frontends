import { useTranslation } from "@workspace/i18n/react"
import { useQueryClient } from "@tanstack/react-query"

import { PageHeader } from "@/components/page-header"
import { CandidateSearch, SEARCH_KEY } from "@/features/candidate-search"
import { UnlockPanel } from "@/features/candidate-unlock"
import { useJobOptions } from "@/features/employer-jobs"
import { MATCHES_KEY } from "@/features/job-matches"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "findCandidates" } as const

export const clientMiddleware = [namespaces(["candidateSearch", "unlock"])]

const MAX_SUGGESTIONS = 5

export default function FindCandidatesPage() {
  const { t } = useTranslation(["candidateSearch", "common"])
  const queryClient = useQueryClient()
  const jobs = useJobOptions()
  const suggestions = [
    ...new Set((jobs ?? []).map((job) => job.label.trim()).filter(Boolean)),
  ].slice(0, MAX_SUGGESTIONS)

  return (
    <div className="flex flex-col gap-6">
      <title>{`${t("title")} · ${t("common:appName")}`}</title>
      <PageHeader title={t("title")} description={t("lead")} />
      <CandidateSearch
        suggestions={suggestions}
        unlock={(row) => (
          <UnlockPanel
            candidateId={row.candidate_id}
            name={row.candidate_name ?? ""}
            matchedRole={row.interviewed_role}
            onUnlocked={() =>
              Promise.all([
                queryClient.invalidateQueries({ queryKey: SEARCH_KEY }),
                queryClient.invalidateQueries({ queryKey: MATCHES_KEY }),
              ])
            }
          />
        )}
      />
    </div>
  )
}
