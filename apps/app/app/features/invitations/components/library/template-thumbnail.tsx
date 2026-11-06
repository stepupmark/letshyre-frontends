import { useTranslation } from "@workspace/i18n/react"

import { useEmailPreview } from "../../hooks/use-email-preview"
import type { Template } from "../../schemas/template.schema"
import { EmailFrame } from "../preview/email-frame"

/** The email as a candidate sees it, at half size. */
export function TemplateThumbnail({ template }: { template: Template }) {
  const { t } = useTranslation("invitations")
  const { html } = useEmailPreview({
    templateId: template.id,
    subject: template.subject_template,
    body: template.body_html_template,
    person: {
      candidate_name: t("preview.sampleName"),
      job_role: t("preview.sampleRole"),
    },
  })

  return (
    <div
      inert
      className="relative h-44 overflow-hidden rounded-t-lg border-b bg-muted mask-b-from-70%"
    >
      <div className="absolute inset-x-0 top-0 w-[200%] origin-top-left scale-50 transition-transform duration-300 ease-out group-hover:-translate-y-16 motion-reduce:transition-none rtl:origin-top-right">
        <EmailFrame html={html} title={t("preview.frame")} />
      </div>
    </div>
  )
}
