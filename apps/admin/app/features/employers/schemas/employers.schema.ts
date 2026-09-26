import { z } from "zod";
import { companyKycSchema } from "~/features/kyc";
import { envelope, id, paginated } from "~/lib/api/schemas";

const count = z
  .number()
  .nullish()
  .transform((value) => value ?? 0);

export const employerSchema = z.object({
  id,
  user_name: z.string().nullish(),
  email: z.string().nullish(),
  phone_number: z.string().nullish(),
  role: z.string().nullish(),
  job_posts: count,
  employer_kyc: companyKycSchema.nullish(),
});

export const employerSummarySchema = z.object({
  total_employees: count,
  today_registerations: count,
  completed_kycs: count,
  in_completed_kycs: count,
  pending_kycs: count,
  verified_kycs: count,
});

export const employersResponseSchema = envelope(paginated(employerSchema));
export const employerResponseSchema = envelope(employerSchema);
export const employerSummaryResponseSchema = envelope(employerSummarySchema);

export type Employer = z.infer<typeof employerSchema>;
