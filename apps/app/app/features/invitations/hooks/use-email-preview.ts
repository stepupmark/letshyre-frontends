import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"

import { fillFields } from "../lib/merge-fields"
import { previewDocument } from "../lib/preview-html"
import { sampleInviteLink } from "../lib/sample-values"
import { previewQuery } from "../queries/templates.queries"

/**
 * The email for one candidate. Company, sender and link come from the server's sample when it
 * loads; `person` always wins, so switching candidates changes the whole email.
 */
export function useEmailPreview({
  templateId,
  subject,
  body,
  person,
  mark = false,
}: {
  templateId: string
  subject: string
  body: string
  person: { candidate_name: string; job_role: string }
  mark?: boolean
}) {
  const { t } = useTranslation("invitations")
  const server = useQuery({ ...previewQuery(templateId), retry: false })
  const values = {
    employer_company_name: t("preview.sampleCompany"),
    sender_name: t("preview.sampleSender"),
    invite_link: sampleInviteLink(),
    ...server.data?.merge_context,
    ...person,
  }

  return {
    html: previewDocument({
      body,
      values,
      mark,
      frame: server.data && {
        html: server.data.preview_html,
        body: server.data.body_html,
      },
    }),
    subject: fillFields(subject, values, { html: false }),
    values,
    pending: server.isPending,
    local: server.isError,
  }
}
