import { useTranslation } from "@workspace/i18n/react"
import { CircleAlert } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"

import { duration, ease } from "@/lib/motion"

import type { Issue } from "../../lib/readiness"

/** Only what blocks sending; nothing when the template is ready. */
export function ReadinessIssues({ issues }: { issues: Issue[] }) {
  const { t } = useTranslation("invitations")
  const label = (issue: Issue) =>
    issue.kind === "subject"
      ? t("ready.needSubject")
      : issue.kind === "invite"
        ? t("ready.needInvite")
        : t("ready.unknown", {
            fields: issue.fields.map((key) => `{{${key}}}`).join(", "),
          })

  return (
    <ul aria-live="polite" className="flex flex-col gap-1.5 empty:hidden">
      <AnimatePresence initial={false}>
        {issues.map((issue) => (
          <m.li
            key={issue.kind}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.fast, ease }}
            className="flex items-start gap-2 text-sm text-danger"
          >
            <CircleAlert
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
            {label(issue)}
          </m.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
