import { useMutation, useQueryClient } from "@tanstack/react-query"

import { type JobValues } from "../lib/job-values"
import { toCreateForm, toPayload } from "../lib/job-mapping"
import { jobQuery, JOBS_KEY } from "../queries/employer-jobs.queries"
import type { Job } from "../schemas/employer-jobs.schema"
import {
  createJob,
  deleteJob,
  setJobStatus,
  updateJob,
} from "../services/employer-jobs.service"
import type { JobStatus } from "../types"

export function useCreateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ values, jd }: { values: JobValues; jd: File }) =>
      createJob(toCreateForm(values, jd)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: JOBS_KEY }),
  })
}

export function useUpdateJob(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: JobValues) => updateJob(jobId, toPayload(values)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: JOBS_KEY }),
  })
}

export function useDeleteJob(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteJob(jobId),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: jobQuery(jobId).queryKey })
      await queryClient.invalidateQueries({ queryKey: JOBS_KEY })
    },
  })
}

/** Shows the new status straight away and puts the old one back if the API refuses. */
export function useSetJobStatus(job: Job) {
  const queryClient = useQueryClient()
  const key = jobQuery(job.id).queryKey
  return useMutation({
    mutationFn: (next: JobStatus) => setJobStatus(job.id, next),
    onMutate: (next) => {
      queryClient.setQueryData(key, { ...job, status: next })
    },
    onError: () => {
      queryClient.setQueryData(key, job)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: JOBS_KEY }),
  })
}

/** Resolves with the ids that changed; the rest failed. */
export function useSetJobsStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (changes: { id: string; status: JobStatus }[]) => {
      const results = await Promise.allSettled(
        changes.map(({ id, status }) => setJobStatus(id, status))
      )
      return changes
        .filter((_, i) => results[i]?.status === "fulfilled")
        .map(({ id }) => id)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: JOBS_KEY }),
  })
}
