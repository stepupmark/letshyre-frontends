import { fieldsIn, unknownFieldsIn } from "./merge-fields"

type SendBlock = "inactive" | "notReady"

/** Why a template can't go out yet; the same checks the editor shows as Ready to send. */
export function sendBlock(template: {
  is_active?: boolean
  subject_template: string
  body_html_template: string
}): SendBlock | null {
  if (template.is_active === false) return "inactive"
  const { subject_template: subject, body_html_template: body } = template
  const ready =
    subject.trim().length > 0 &&
    fieldsIn(body).includes("invite_link") &&
    unknownFieldsIn(`${subject} ${body}`).length === 0
  return ready ? null : "notReady"
}
