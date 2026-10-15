import { xhrUpload } from "@workspace/api"
import { z } from "zod"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

import { capitalised } from "../lib/employer-jobs"
import { id, parsedJdSchema } from "../schemas/employer-jobs.schema"
import type { JobStatus } from "../types"

export const setJobStatus = (jobId: string, status: JobStatus) =>
  api.patch(`user/v1/employer_job_detail/${jobId}/`, {
    status: capitalised(status),
  })

export const updateJob = (jobId: string, payload: Record<string, unknown>) =>
  api.patch(`user/v1/employer_job_detail/${jobId}/`, payload)

export const deleteJob = (jobId: string) =>
  api.delete(`user/v1/employer_job_detail/${jobId}/`)

export const createJob = async (form: FormData) =>
  z
    .looseObject({ id: id.nullish() })
    .catch({ id: null })
    .parse(dataOf(await xhrUpload(api, "user/v1/employer_jobs/", form)))

// AI parsing can take longer than the fetch timeout; uploads have none
export async function parseJd(
  file: File,
  title: string,
  options: { onProgress: (fraction: number) => void; signal: AbortSignal }
) {
  const form = new FormData()
  form.append("file", file)
  form.append("title", title)
  const body = dataOf(
    await xhrUpload(api, "user/v1/employer_job_jd_ai/parse/", form, options)
  ) as { parse_response?: { flat?: unknown }; parsed_fields?: unknown } | null
  return parsedJdSchema.parse(
    body?.parse_response?.flat ?? body?.parsed_fields ?? {}
  )
}
