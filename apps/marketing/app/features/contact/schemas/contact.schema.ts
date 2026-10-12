import { z } from "zod"

export const LIMITS = { name: 100, subject: 200, message: 1000 } as const

type ValidationKey =
  | "form.validation.nameRequired"
  | "form.validation.emailRequired"
  | "form.validation.subjectRequired"
  | "form.validation.messageRequired"
  | "form.validation.nameMin"
  | "form.validation.nameMax"
  | "form.validation.emailInvalid"
  | "form.validation.subjectMin"
  | "form.validation.subjectMax"
  | "form.validation.messageMin"
  | "form.validation.messageMax"

/** `t` is the `contact` translator, so messages follow the page language. */
export const makeContactSchema = (t: (key: ValidationKey) => string) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, t("form.validation.nameRequired"))
      .min(2, t("form.validation.nameMin"))
      .max(LIMITS.name, t("form.validation.nameMax")),
    email: z
      .string()
      .trim()
      .min(1, t("form.validation.emailRequired"))
      .pipe(z.email(t("form.validation.emailInvalid"))),
    subject: z
      .string()
      .trim()
      .min(1, t("form.validation.subjectRequired"))
      .min(3, t("form.validation.subjectMin"))
      .max(LIMITS.subject, t("form.validation.subjectMax")),
    message: z
      .string()
      .trim()
      .min(1, t("form.validation.messageRequired"))
      .min(10, t("form.validation.messageMin"))
      .max(LIMITS.message, t("form.validation.messageMax")),
  })

export type ContactValues = z.input<ReturnType<typeof makeContactSchema>>
