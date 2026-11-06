import { payloadOf } from "@workspace/api"

import { api } from "@/lib/api"

export const applyForJob = async (jobId: string) =>
  payloadOf(await api.post("user/v1/candidate_jobs/", { job: jobId }))
