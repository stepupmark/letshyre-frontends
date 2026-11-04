import { useTranslation } from "@workspace/i18n/react"
import { Check, Circle, CircleAlert } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useId } from "react"

import { duration, ease } from "@/lib/motion"

import { fieldsIn, unknownFieldsIn } from "../../lib/merge-fields"

type State = "done" | "todo" | "problem"

/** What makes an invitation work, checked as the employer types. */
export function Readiness({
  subject,
  body,
}: {
  subject: string
  body: string
}) {
  const { t } = useTranslation("invitations")
  const id = useId()
  const fields = fieldsIn(body)
  const unknown = unknownFieldsIn(`${subject} ${body}`)
  const items: { key: string; label: string; state: State }[] = [
    {
      key: "subject",
      label: t("ready.subject"),
      state: subject.trim() ? "done" : "todo",
    },
    {
      key: "invite",
      label: t("ready.invite"),
      state: fields.includes("invite_link") ? "done" : "problem",
    },
    {
      key: "name",
      label: t("ready.name"),
      state: fields.includes("candidate_name") ? "done" : "todo",
    },
    {
      key: "role",
      label: t("ready.role"),
      state: fieldsIn(`${subject} ${body}`).includes("job_role")
        ? "done"
        : "todo",
    },
    {
      key: "unknown",
      label:
        unknown.length > 0
          ? t("ready.unknown", {
              fields: unknown.map((key) => `{{${key}}}`).join(", "),
            })
          : t("ready.known"),
      state: unknown.length > 0 ? "problem" : "done",
    },
  ]
  const done = items.filter((item) => item.state === "done").length

  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-3 rounded-lg border p-4"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={id} className="text-sm font-medium">
          {t("ready.title")}
        </h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {t("ready.count", { done, total: items.length })}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.key}
            data-state={item.state}
            className="flex items-start gap-2 text-sm text-muted-foreground data-[state=done]:text-foreground data-[state=problem]:text-danger"
          >
            <span className="relative mt-0.5 grid size-4 shrink-0 place-items-center">
              <AnimatePresence initial={false} mode="popLayout">
                <m.span
                  key={item.state}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: duration.fast, ease }}
                  className="flex"
                >
                  {item.state === "done" ? (
                    <Check
                      aria-hidden="true"
                      strokeWidth={2.5}
                      className="size-4 text-success"
                    />
                  ) : item.state === "problem" ? (
                    <CircleAlert aria-hidden="true" className="size-4" />
                  ) : (
                    <Circle aria-hidden="true" className="size-4" />
                  )}
                </m.span>
              </AnimatePresence>
            </span>
            <span className="text-pretty">
              <span className="sr-only">{t(`ready.state.${item.state}`)} </span>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
