import type { Job } from "../schemas/candidate-jobs.schema"

export const companyOf = (job: Job) =>
  (typeof job.employer === "string"
    ? job.employer
    : job.employer?.company_name) ??
  job.company_name ??
  null

export const logoOf = (job: Job) =>
  (typeof job.employer === "object"
    ? (job.employer?.kyc?.company_logo ?? job.employer?.company_logo)
    : null) ??
  job.company_logo ??
  null
