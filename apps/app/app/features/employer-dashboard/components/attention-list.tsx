import { useTranslation } from "@workspace/i18n/react"
import { BriefcaseBusiness, Coins, FilePlus2 } from "lucide-react"
import * as m from "motion/react-m"
import { useId } from "react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"
import { duration, ease } from "@/lib/motion"

import type { Attention } from "../lib/employer-dashboard"

export function AttentionList({
  items,
  credits,
  closedJobs,
}: {
  items: Attention[]
  credits: number | undefined
  closedJobs: number
}) {
  const { t } = useTranslation("dashboard")
  const id = useId()
  if (items.length === 0) return null

  const view = {
    creditsOut: {
      icon: <Coins />,
      title: t("attention.creditsOut.title"),
      body: t("attention.creditsOut.body"),
      action: t("attention.addCredits"),
      to: href("/employer/billing"),
    },
    creditsLow: {
      icon: <Coins />,
      title: t("attention.creditsLow.title"),
      body: t("attention.creditsLow.body", { count: credits ?? 0 }),
      action: t("attention.addCredits"),
      to: href("/employer/billing"),
    },
    noOpenJobs: {
      icon: <BriefcaseBusiness />,
      title: t("attention.noOpenJobs.title"),
      body: t("attention.noOpenJobs.body", { count: closedJobs }),
      action: t("attention.viewJobs"),
      to: `${href("/employer/jobs")}?status=closed`,
    },
    noJobs: {
      icon: <FilePlus2 />,
      title: t("attention.noJobs.title"),
      body: t("attention.noJobs.body"),
      action: t("attention.postJob"),
      to: href("/employer/jobs/new"),
    },
  }

  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="text-base font-semibold tracking-tight">
        {t("attention.heading")}
      </h2>
      <ul className="divide-y rounded-lg border bg-card">
        {items.map((key, i) => {
          const item = view[key]
          return (
            <m.li
              key={key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: duration.base, ease, delay: i * 0.05 }}
              className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4"
            >
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-lg bg-warning-muted text-warning [&_svg]:size-4"
              >
                {item.icon}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm">
                <span className="font-medium">{item.title}</span>
                <span className="text-pretty text-muted-foreground">
                  {item.body}
                </span>
              </span>
              <AppLink
                to={item.to}
                className={buttonLink({
                  variant: "outline",
                  size: "sm",
                  className: "max-sm:w-full",
                })}
              >
                {item.action}
              </AppLink>
            </m.li>
          )
        })}
      </ul>
    </section>
  )
}
