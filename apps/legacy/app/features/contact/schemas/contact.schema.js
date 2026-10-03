import { z } from "zod";

// `t` is the `contact` namespace translator, so validation copy follows the
// active locale.
export const makeContactSchema = (t) =>
  z.object({
    name: z.string().min(2, t("form.validation.nameMin")),
    email: z.string().email(t("form.validation.emailInvalid")),
    subject: z.string().min(3, t("form.validation.subjectMin")),
    message: z.string().min(10, t("form.validation.messageMin")),
  });
