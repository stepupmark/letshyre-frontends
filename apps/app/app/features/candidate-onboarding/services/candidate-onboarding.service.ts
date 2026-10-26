import { payloadOf, xhrUpload } from "@workspace/api"
import { z } from "zod"

import { api } from "@/lib/api"

export async function uploadResume(
  file: File,
  onProgress: (fraction: number) => void
) {
  const form = new FormData()
  form.append("resume", file)
  const body = payloadOf(
    await xhrUpload(api, "user/v1/candidate_resume_ai/upload/", form, {
      onProgress,
    })
  )
  const id = z
    .looseObject({ job_id: z.union([z.string(), z.number()]) })
    .parse(body).job_id
  return String(id)
}

export const submitProfile = (
  form: FormData,
  onProgress: (fraction: number) => void
) => xhrUpload(api, "user/v1/candidate_profile/", form, { onProgress })
