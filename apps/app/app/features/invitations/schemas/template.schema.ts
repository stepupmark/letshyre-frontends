import { paginated, unwrap } from "@workspace/api"
import { z } from "zod"

const templateSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  is_system: z.boolean(),
  subject_template: z.string(),
  body_html_template: z.string(),
  updated_at: z.string().nullish(),
})

export type Template = z.infer<typeof templateSchema>

export const parseTemplate = unwrap(templateSchema)

export const parseTemplates = unwrap(
  paginated(templateSchema).transform((page) => page.results)
)

const previewSchema = z.looseObject({
  subject: z.string(),
  body_html: z.string(),
  preview_html: z.string(),
  merge_context: z.record(z.string(), z.string()).catch({}),
})

export const parsePreview = unwrap(previewSchema)

const sentSchema = z.looseObject({
  queued_count: z.number(),
  recipients: z.array(z.string()),
})

export const parseSent = unwrap(sentSchema)
