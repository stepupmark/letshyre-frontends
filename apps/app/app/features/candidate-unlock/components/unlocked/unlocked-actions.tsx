import { useTranslation } from "@workspace/i18n/react"
import { ArrowRight, UserRound } from "lucide-react"
import type { ReactNode } from "react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"

import type { Unlocked } from "../../schemas/candidate-unlock.schema"

export function UnlockedActions({
  row,
  share,
}: {
  row: Unlocked
  share?: (row: Unlocked) => ReactNode
}) {
  const { t } = useTranslation("unlock")
  return (
    <span className="flex items-center justify-end gap-2">
      {share?.(row)}
      <AppLink
        to={href("/employer/candidates/:candidateId", {
          candidateId: row.id,
        })}
        className={buttonLink({
          variant: "outline",
          size: "sm",
          className: "text-brand-text max-md:h-11 max-md:flex-1",
        })}
      >
        <UserRound />
        {t("list.profile")}
        {row.candidate_name && (
          <span className="sr-only">{row.candidate_name}</span>
        )}
      </AppLink>
      <AppLink
        to={href("/employer/candidates/:candidateId/scorecard", {
          candidateId: row.id,
        })}
        className={buttonLink({
          variant: "outline",
          size: "sm",
          className: "group text-brand-text max-md:h-11 max-md:flex-1",
        })}
      >
        {t("list.scorecard")}
        {row.candidate_name && (
          <span className="sr-only">{row.candidate_name}</span>
        )}
        <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
      </AppLink>
    </span>
  )
}
