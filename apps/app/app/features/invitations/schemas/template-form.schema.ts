import { z } from "zod"

import { NAME_LIMIT, SUBJECT_LIMIT } from "../lib/limits"
import { fieldsIn, unknownFieldsIn } from "../lib/merge-fields"

const hasText = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length > 0

export const makeTemplateFormSchema = (m: {
  name: string
  subject: string
  body: string
  inviteLink: string
  unknown: string
}) =>
  z.object({
    name: z.string().trim().min(1, m.name).max(NAME_LIMIT, m.name),
    subject: z
      .string()
      .trim()
      .min(1, m.subject)
      .max(SUBJECT_LIMIT, m.subject)
      .refine((value) => unknownFieldsIn(value).length === 0, m.unknown),
    body: z
      .string()
      .refine(hasText, m.body)
      .refine((value) => fieldsIn(value).includes("invite_link"), m.inviteLink)
      .refine((value) => unknownFieldsIn(value).length === 0, m.unknown),
  })

export type TemplateValues = z.infer<ReturnType<typeof makeTemplateFormSchema>>
