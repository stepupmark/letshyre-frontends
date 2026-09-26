import { z } from "zod";
import { envelope, id, paginated } from "~/lib/api/schemas";

const text = z.string().nullish();
const num = z.number().nullish();
const list = <T extends z.ZodType>(item: T) =>
  z
    .array(item)
    .nullish()
    .transform((value) => value ?? []);
const count = z
  .number()
  .nullish()
  .transform((value) => value ?? 0);

export const JOB_STATUSES = ["open", "paused", "closed"] as const;
export const APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

function approvalOf(job: {
  is_approved?: boolean | null;
  is_rejected?: boolean | null;
}): ApprovalStatus {
  if (job.is_approved) return "approved";
  if (job.is_rejected) return "rejected";
  return "pending";
}

export const jobSchema = z
  .object({
    id,
    title: text,
    company_name: text,
    employer_name: text,
    applications_count: count,
    employment_type: text,
    industry_type: text,
    created_at: z.string(),
    status: text,
    is_approved: z.boolean().nullish(),
    is_rejected: z.boolean().nullish(),
  })
  .transform((job) => ({ ...job, approval: approvalOf(job) }));

export const jobDetailSchema = z
  .object({
    id,
    employer: z.union([z.string(), z.number()]).nullish(),
    title: text,
    description: text,
    jd_file_url: text,
    responsibilities: list(z.string()),
    number_of_openings: num,
    location: text,
    city: text,
    state: text,
    country: text,
    work_mode: text,
    employment_type: text,
    industry_type: text,
    salary_range: text,
    salary_min_lpa: num,
    salary_max_lpa: num,
    experience_required: text,
    experience_min_years: num,
    experience_max_years: num,
    skills_required: list(z.string()),
    minimum_education: text,
    specialization: text,
    questions: list(z.string()),
    keywords: list(z.string()),
    application_deadline: text,
    deadline: text,
    job_status: text,
    status: text,
    job_posted_date: text,
    created_at: text,
  })
  .transform((job) => ({
    ...job,
    approval: (job.job_status?.toLowerCase() ?? "pending") as ApprovalStatus,
  }));

export const jobsSummarySchema = z.object({
  total_post_jobs: count,
  today_job_posts: count,
  approved_jobs: count,
  rejected_jobs: count,
  pending_approvals: count,
});

export const jobsResponseSchema = envelope(paginated(jobSchema));
export const jobDetailResponseSchema = envelope(jobDetailSchema);
export const jobsSummaryResponseSchema = envelope(jobsSummarySchema);

export const rejectJobsSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "At least 10 characters")
    .max(500, "At most 500 characters")
    .refine((value) => !/<[^>]*>/.test(value), "HTML isn't allowed"),
});

export type Job = z.infer<typeof jobSchema>;
export type JobDetail = z.infer<typeof jobDetailSchema>;
export type RejectJobsInput = z.infer<typeof rejectJobsSchema>;
export type JobsFilters = {
  page: number;
  search?: string;
  status?: string;
  is_pending?: boolean;
  is_approved?: boolean;
  is_rejected?: boolean;
  from_date?: string;
  end_date?: string;
};
export type JobsAction =
  | { action: "approve"; job_ids: string[] }
  | { action: "reject"; job_ids: string[]; reason: string };
