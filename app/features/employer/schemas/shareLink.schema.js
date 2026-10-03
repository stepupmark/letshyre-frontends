import { z } from "zod";

// The server caps both fields at 30 days — the client mirrors that cap so a
// rejected submission is the exception, not the common path.
export const makeShareLinkSchemas = (t) => {
  const createShareLinkSchema = z.object({
    job_id: z.string().min(1, t("sharing.validation.jobRequired")),
    expires_in_days: z.coerce
      .number({ error: t("sharing.validation.expiryRequired") })
      .int(t("sharing.validation.expiryInt"))
      .min(1, t("sharing.validation.expiryMin"))
      .max(30, t("sharing.validation.expiryMax")),
    max_views: z.coerce
      .number({ error: t("sharing.validation.maxViewsRequired") })
      .int(t("sharing.validation.maxViewsInt"))
      .min(1, t("sharing.validation.maxViewsMin")),
  });

  const editShareLinkSchema = z.object({
    extend_expiry_days: z.coerce
      .number({ error: t("sharing.validation.extendRequired") })
      .int(t("sharing.validation.extendInt"))
      .min(0, t("sharing.validation.extendMin"))
      .max(30, t("sharing.validation.extendMax")),
    max_views: z.coerce
      .number({ error: t("sharing.validation.maxViewsRequired") })
      .int(t("sharing.validation.maxViewsInt"))
      .min(1, t("sharing.validation.maxViewsMin")),
    is_active: z.boolean(),
  });

  return { createShareLinkSchema, editShareLinkSchema };
};
