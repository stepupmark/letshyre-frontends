import { z } from "zod";

/**
 * Builds the JD form schema with localized messages. `t` is the `employerJobs`
 * namespace translator, so validation copy follows the active locale.
 */
export const makeJobSchema = (t) =>
  z
    .object({
      title: z.string().min(1, t("postJob.validation.titleRequired")),
      work_type: z.string().min(1, t("postJob.validation.workTypeRequired")),
      employment_type: z.string().min(1, t("postJob.validation.employmentTypeRequired")),
      industry_type: z.string().min(1, t("postJob.validation.industryRequired")),
      customIndustry: z.string().optional(), // Conditionally required when industry_type is "other"

      must_have_skills: z.string().min(1, t("postJob.validation.skillsRequired")),
      salary_range: z.string().min(1, t("postJob.validation.salaryRequired")),

      country: z.string().min(1, t("postJob.validation.countryRequired")),
      state: z.string().min(1, t("postJob.validation.stateRequired")),
      city: z.string().min(1, t("postJob.validation.cityRequired")),
      location: z.string().optional(),

      education: z.string().min(1, t("postJob.validation.educationRequired")),
      specialization: z.string().min(1, t("postJob.validation.specializationRequired")),

      description: z.string().min(1, t("postJob.validation.responsibilitiesRequired")),
      job_description: z.string().min(1, t("postJob.validation.descriptionRequired")),

      experience_required: z.string().min(1, t("postJob.validation.experienceRequired")),
      number_of_openings: z
        .union([z.string(), z.number()])
        .refine((val) => Number(val) > 0, t("postJob.validation.openingsMin")),
      application_deadline: z.string().min(1, t("postJob.validation.deadlineRequired")),
    })
    .superRefine((data, ctx) => {
      if (data.industry_type === "other" && (!data.customIndustry || data.customIndustry.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("postJob.validation.customIndustryRequired"),
          path: ["customIndustry"],
        });
      }
    });
