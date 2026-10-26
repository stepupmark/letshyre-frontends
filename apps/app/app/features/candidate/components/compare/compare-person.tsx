import { safeUrl } from "@workspace/api"
import { useTranslation } from "@workspace/i18n/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { RotateCw, X } from "lucide-react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"

import type { Scorecard } from "../../schemas/scorecard.schema"

export function ComparePerson({
  id,
  report,
  removeTo,
}: {
  id: string
  report: Scorecard
  removeTo?: string
}) {
  const { t } = useTranslation("scorecard")
  const name = report.candidate_name?.trim()
    ? report.candidate_name.trim()
    : t("header.unnamed")
  const photo = safeUrl(report.candidate_profile_photo)
  const role = report.candidate_role?.trim()

  return (
    <div className="flex items-start gap-3">
      <Avatar className="size-10 max-sm:hidden">
        {photo && <AvatarImage src={photo} alt="" />}
        <AvatarFallback className="bg-brand-muted font-medium text-brand-text">
          {name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <AppLink
          to={href("/employer/candidates/:candidateId/scorecard", {
            candidateId: id,
          })}
          className="rounded-sm font-semibold text-pretty underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {name}
        </AppLink>
        {role && (
          <span className="text-xs font-normal text-pretty text-muted-foreground">
            {t("compare.interviewedFor", { role })}
          </span>
        )}
      </div>
      {removeTo && (
        <AppLink
          to={removeTo}
          replace
          preventScrollReset
          aria-label={t("compare.remove", { name })}
          className={buttonLink({
            variant: "ghost",
            size: "icon-sm",
            className: "-me-1.5 -mt-1 shrink-0 text-muted-foreground",
          })}
        >
          <X />
        </AppLink>
      )}
    </div>
  )
}

export function CompareFailed({
  onRetry,
  retrying,
}: {
  onRetry: () => void
  retrying: boolean
}) {
  const { t } = useTranslation(["scorecard", "common"])
  return (
    <div role="alert" className="flex flex-col items-start gap-2">
      <span className="text-sm font-normal text-muted-foreground">
        {t("compare.failed")}
      </span>
      <Button variant="outline" size="sm" disabled={retrying} onClick={onRetry}>
        <RotateCw
          className={
            retrying ? "animate-spin motion-reduce:animate-none" : undefined
          }
        />
        {t("common:state.retry")}
      </Button>
    </div>
  )
}
