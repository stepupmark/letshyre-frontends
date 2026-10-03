import { z } from "zod"

type ValidationKey =
  | "form.validation.nameMin"
  | "form.validation.emailInvalid"
  | "form.validation.subjectMin"
  | "form.validation.messageMin"

/** `t` is the `contact` translator, so messages follow the page language. */
export const makeContactSchema = (t: (key: ValidationKey) => string) =>
  z.object({
    name: z.string().trim().min(2, t("form.validation.nameMin")),
    email: z
      .string()
      .trim()
      .pipe(z.email(t("form.validation.emailInvalid"))),
    subject: z.string().trim().min(3, t("form.validation.subjectMin")),
    message: z.string().trim().min(10, t("form.validation.messageMin")),
  })

export type ContactValues = z.input<ReturnType<typeof makeContactSchema>>
