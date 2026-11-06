import { issuesOf } from "./readiness"

type SendBlock = "inactive" | "notReady"

export function sendBlock(template: {
  is_active?: boolean
  subject_template: string
  body_html_template: string
}): SendBlock | null {
  if (template.is_active === false) return "inactive"
  return issuesOf(template.subject_template, template.body_html_template)
    .length > 0
    ? "notReady"
    : null
}
