import { useMutation } from "@tanstack/react-query"
import { patchQueries } from "@/lib/query/optimistic"
import { jobsKeys } from "../queries/jobs.queries"
import type { Job, JobDetail, JobsAction } from "../schemas/jobs.schema"
import { jobsService } from "../services/jobs.service"

type JobsPage = Awaited<ReturnType<typeof jobsService.list>>

export function useJobAction() {
  return useMutation({
    mutationFn: (payload: JobsAction) => jobsService.act(payload),
    onMutate: async ({ action, job_ids }) => {
      const approval: Job["approval"] =
        action === "approve" ? "approved" : "rejected"
      const rollbacks = await Promise.all([
        patchQueries<JobsPage>([...jobsKeys.all, "list"], (page) => ({
          ...page,
          results: page.results.map((job) =>
            job_ids.includes(job.id) ? { ...job, approval } : job
          ),
        })),
        ...job_ids.map((id) =>
          patchQueries<JobDetail>(jobsKeys.detail(id), (job) => ({
            ...job,
            approval,
          }))
        ),
      ])
      return {
        rollback: () => {
          rollbacks.forEach((undo) => {
            undo()
          })
        },
      }
    },
    onError: (_error, _variables, context) => context?.rollback(),
    meta: { successMessage: "Jobs updated", invalidates: [jobsKeys.all] },
  })
}
