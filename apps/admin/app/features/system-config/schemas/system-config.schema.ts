import { z } from "zod";
import { formatNumber } from "~/lib/format";
import { envelope, id } from "~/lib/api/schemas";

const systemConfigSchema = z.object({
  id,
  maintenance_mode: z.boolean(),
  mfa_required_for_admins: z.boolean(),
  max_file_upload_size_mb: z.number(),
  api_rate_limit_per_min: z.number(),
  default_video_retention_days: z.number(),
  celery_task_default_queue: z.string().nullish(),
  updated_at: z.string().nullish(),
});

export const systemConfigResponseSchema = envelope(systemConfigSchema);

const wholeNumber = (min: number, max: number) =>
  z
    .number({ error: "Enter a number" })
    .int("Use a whole number")
    .min(min, `At least ${min}`)
    .max(max, `At most ${formatNumber(max)}`);

export const limitsSchema = z.object({
  max_file_upload_size_mb: wholeNumber(1, 500),
  api_rate_limit_per_min: wholeNumber(1, 10_000),
  default_video_retention_days: wholeNumber(1, 3650),
});

export type SystemConfig = z.infer<typeof systemConfigSchema>;
export type LimitsInput = z.infer<typeof limitsSchema>;
export type SystemConfigUpdate = Partial<
  LimitsInput &
    Pick<SystemConfig, "maintenance_mode" | "mfa_required_for_admins">
>;
