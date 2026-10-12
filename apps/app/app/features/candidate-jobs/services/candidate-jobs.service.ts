import { api } from "@/lib/api"

export const applyForJob = (jobId: string) =>
  api.post("user/v1/candidate_jobs/", { job: jobId })
