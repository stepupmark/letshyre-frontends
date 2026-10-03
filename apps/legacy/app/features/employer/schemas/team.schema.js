import { z } from "zod";

/**
 * Builds the team-member schemas with localized messages. `t` is the `employer`
 * namespace translator. Returns both the add and edit variants.
 */
export const makeTeamSchemas = (t) => {
  const memberSchema = z.object({
    full_name: z
      .string()
      .min(2, t("team.validation.nameMin"))
      .max(100, t("team.validation.nameMax")),
    email: z.string().email(t("team.validation.emailInvalid")),
  });

  const addMemberSchema = memberSchema.extend({
    password: z
      .string()
      .min(6, t("team.validation.passwordMin"))
      .max(50, t("team.validation.passwordMax")),
  });

  return { memberSchema, addMemberSchema, editMemberSchema: memberSchema };
};
