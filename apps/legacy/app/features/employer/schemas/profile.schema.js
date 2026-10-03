import { z } from "zod";

/**
 * Builds the employer-profile edit schema with localized messages. `t` is the
 * `employer` namespace translator.
 */
export const makeEmployerProfileSchema = (t) =>
  z.object({
    email: z.string().email(t("profile.validation.emailInvalid")),
    location: z.string().min(1, t("profile.validation.locationRequired")),

    industry: z.string().min(1, t("profile.validation.industryRequired")),

    linkedinUrl: z
      .string()
      .url(t("profile.validation.linkedinInvalid"))
      .regex(/linkedin\.com/, t("profile.validation.linkedinDomain"))
      .optional()
      .or(z.literal("")),

    companyDescription: z
      .string()
      .max(500, t("profile.validation.descriptionMax"))
      .optional()
      .or(z.literal("")),

    companyLogo: z
      .any()
      .optional()
      .refine(
        (files) =>
          !files ||
          files.length === 0 ||
          (files[0] && files[0].size <= 5 * 1024 * 1024),
        t("profile.validation.logoSize"),
      )
      .refine(
        (files) =>
          !files ||
          files.length === 0 ||
          (files[0] &&
            ["image/jpeg", "image/png", "image/svg+xml", "image/webp"].includes(
              files[0].type,
            )),
        t("profile.validation.logoType"),
      ),
  });
