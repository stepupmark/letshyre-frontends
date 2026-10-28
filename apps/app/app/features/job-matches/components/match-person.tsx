import { safeUrl } from "@workspace/api"
import { useTranslation } from "@workspace/i18n/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"

import type { Match } from "../schemas/job-matches.schema"

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

export function MatchAvatar({ match }: { match: Match }) {
  const { t } = useTranslation("matches")
  const photo = safeUrl(match.profile_photo_url)
  return (
    <Avatar className="size-11 ring-2 ring-background">
      {photo && <AvatarImage src={photo} alt="" />}
      <AvatarFallback className="bg-brand-muted text-sm font-semibold text-brand-text">
        {initials(match.candidate_name ?? t("unnamed"))}
      </AvatarFallback>
    </Avatar>
  )
}

export function MatchPerson({ match }: { match: Match }) {
  const { t } = useTranslation("matches")
  const name = match.candidate_name ?? t("unnamed")
  const photo = safeUrl(match.profile_photo_url)
  return (
    <>
      <Avatar className="size-14">
        {photo && <AvatarImage src={photo} alt="" />}
        <AvatarFallback className="bg-brand-muted text-base font-semibold text-brand-text">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-base font-medium text-brand-text underline-offset-4 group-hover:underline">
          {name}
        </span>
        {match.ai_match?.role_applied && (
          <span className="truncate text-sm text-muted-foreground">
            {match.ai_match.role_applied}
          </span>
        )}
      </span>
    </>
  )
}
