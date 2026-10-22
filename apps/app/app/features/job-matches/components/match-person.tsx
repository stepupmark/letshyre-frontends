import { useTranslation } from "@workspace/i18n/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"

import { safeUrl } from "@/lib/safe-url"

import type { Match } from "../schemas/job-matches.schema"

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

export function MatchPerson({ match }: { match: Match }) {
  const { t } = useTranslation("matches")
  const name = match.candidate_name ?? t("unnamed")
  const photo = safeUrl(match.profile_photo_url)
  return (
    <>
      <Avatar>
        {photo && <AvatarImage src={photo} alt="" />}
        <AvatarFallback className="bg-brand-muted text-xs font-medium text-brand-text">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-medium underline-offset-4 group-hover:underline">
          {name}
        </span>
        {match.ai_match?.role_applied && (
          <span className="truncate text-xs text-muted-foreground">
            {match.ai_match.role_applied}
          </span>
        )}
      </span>
    </>
  )
}
