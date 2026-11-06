import { useTranslation } from "@workspace/i18n/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { href, useNavigate } from "react-router"
import { toast } from "sonner"

import { applyProblem } from "../lib/apply-error"
import { candidateJobsKeys } from "../queries/candidate-jobs.queries"
import { applyForJob } from "../services/candidate-jobs.service"
import { type JobsPage } from "../types"

export function useApply({
  onNeedsInterview,
}: {
  onNeedsInterview: () => void
}) {
  const { t } = useTranslation("candidateJobs")
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: applyForJob,
    onSuccess: async (_, jobId) => {
      queryClient.setQueriesData<JobsPage>(
        { queryKey: candidateJobsKeys.find },
        (page) =>
          page && {
            ...page,
            jobs: page.jobs.map((job) =>
              job.id === jobId ? { ...job, status: "Applied" } : job
            ),
          }
      )
      toast.success(t("apply.done"), {
        action: {
          label: t("apply.track"),
          onClick: () => void navigate(href("/employee/applications")),
        },
      })
      await queryClient.invalidateQueries({
        queryKey: candidateJobsKeys.applications,
      })
    },
    onError: (error) => {
      // retrying can't help here; the job sheet explains what to do instead
      if (applyProblem(error) === "needsInterview") onNeedsInterview()
      else toast.error(t("apply.failed"))
    },
  })
}
