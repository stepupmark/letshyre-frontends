import { useTranslation } from "@workspace/i18n/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { href, useNavigate } from "react-router"
import { toast } from "sonner"

import { applyForJob, type JobsPage } from "./api"

/** Marks the job applied everywhere it's listed, then refreshes applications. */
export function useApply() {
  const { t } = useTranslation("candidateJobs")
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: applyForJob,
    onSuccess: async (_, jobId) => {
      queryClient.setQueriesData<JobsPage>(
        { queryKey: ["candidate", "find-jobs"] },
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
        queryKey: ["candidate", "applications"],
      })
    },
    onError: () => {
      toast.error(t("apply.failed"))
    },
  })
}
