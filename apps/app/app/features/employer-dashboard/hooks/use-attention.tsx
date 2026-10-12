import { useTranslation } from "@workspace/i18n/react"
import { BriefcaseBusiness, Coins, FilePlus2 } from "lucide-react"
import type { ReactNode } from "react"
import { href } from "react-router"

import { LOW_CREDITS } from "../lib/employer-dashboard"

export interface AttentionItem {
  key: string
  icon: ReactNode
  title: string
  body: string
  action: string
  to: string
}

/** What needs the employer now, each with the one action that deals with it. */
export function useAttention({
  credits,
  openJobs,
  closedJobs,
}: {
  credits: number | undefined
  openJobs: number
  closedJobs: number
}): AttentionItem[] {
  const { t } = useTranslation("dashboard")
  const items: AttentionItem[] = []

  if (credits !== undefined && credits <= LOW_CREDITS) {
    items.push({
      key: "credits",
      icon: <Coins />,
      title:
        credits === 0
          ? t("attention.creditsOut.title")
          : t("attention.creditsLow.title"),
      body:
        credits === 0
          ? t("attention.creditsOut.body")
          : t("attention.creditsLow.body", { count: credits }),
      action: t("attention.addCredits"),
      to: href("/employer/billing"),
    })
  }
  if (openJobs === 0 && closedJobs > 0) {
    items.push({
      key: "no-open-jobs",
      icon: <BriefcaseBusiness />,
      title: t("attention.noOpenJobs.title"),
      body: t("attention.noOpenJobs.body", { count: closedJobs }),
      action: t("attention.viewJobs"),
      to: href("/employer/jobs"),
    })
  }
  if (openJobs === 0 && closedJobs === 0) {
    items.push({
      key: "no-jobs",
      icon: <FilePlus2 />,
      title: t("attention.noJobs.title"),
      body: t("attention.noJobs.body"),
      action: t("attention.postJob"),
      to: href("/employer/jobs/new"),
    })
  }
  return items
}
