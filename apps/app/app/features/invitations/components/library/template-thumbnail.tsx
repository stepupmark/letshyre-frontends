import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"

import { previewDocument } from "../../lib/preview-html"
import { previewQuery } from "../../queries/templates.queries"
import type { Template } from "../../schemas/template.schema"
import { EmailFrame } from "../preview/email-frame"

/** The email as a candidate sees it, at half size; the local render stands in until the server's arrives. */
export function TemplateThumbnail({ template }: { template: Template }) {
  const { t } = useTranslation("invitations")
  const sample = {
    candidate_name: t("preview.sampleName"),
    job_role: t("preview.sampleRole"),
  }
  const server = useQuery({
    ...previewQuery(template.id, sample),
    retry: false,
  })
  const html =
    server.data?.preview_html ??
    previewDocument({
      body: template.body_html_template,
      values: {
        ...sample,
        employer_company_name: t("preview.sampleCompany"),
        sender_name: t("preview.sampleSender"),
      },
    })

  return (
    <div className="relative h-44 overflow-hidden rounded-t-lg border-b bg-muted mask-b-from-70%">
      <div className="absolute inset-x-0 top-0 w-[200%] origin-top-left scale-50 transition-transform duration-300 ease-out group-hover:-translate-y-16 motion-reduce:transition-none rtl:origin-top-right">
        <EmailFrame html={html} title={t("preview.frame")} />
      </div>
    </div>
  )
}
