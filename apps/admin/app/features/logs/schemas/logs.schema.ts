import { z } from "zod";
import { id, paginated } from "~/lib/api/schemas";

const logBase = {
  id,
  otp_status: z.string(),
  is_verified: z.boolean(),
  created_at: z.string(),
};

export const emailLogSchema = z.object({
  ...logBase,
  email: z.string(),
  otp_type: z.string().nullish(),
});

export const smsLogSchema = z.object({
  ...logBase,
  phone_number: z.string(),
});

export const emailLogsSchema = paginated(emailLogSchema);
export const smsLogsSchema = paginated(smsLogSchema);

export type EmailLog = z.infer<typeof emailLogSchema>;
export type SmsLog = z.infer<typeof smsLogSchema>;
