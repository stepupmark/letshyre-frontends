import { safeUrl } from "@workspace/api"
import { useTranslation } from "@workspace/i18n/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { cn } from "@workspace/ui/lib/utils"

import { initials, splitMatch, yearsOf } from "../lib/result"
import type { SearchResult } from "../schemas/candidate-search.schema"

export function PersonAvatar({
  row,
  name,
  className,
}: {
  row: SearchResult
  name: string
  className?: string
}) {
  const photo = safeUrl(row.candidate_profile_photo)
  return (
    <Avatar className={cn("size-10", className)}>
      {photo && <AvatarImage src={photo} alt="" />}
      <AvatarFallback className="bg-brand-muted text-xs font-semibold text-brand-text">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

export function Highlight({ text, term }: { text: string; term: string }) {
  const parts = splitMatch(text, term)
  if (!parts) return text
  return (
    <>
      {parts.before}
      <mark className="rounded-sm bg-brand-muted px-0.5 font-medium text-brand-text">
        {parts.match}
      </mark>
      {parts.after}
    </>
  )
}

/** Location and years of experience on one line, or nothing. */
export function Facts({
  row,
  className,
}: {
  row: SearchResult
  className: string
}) {
  const { t } = useTranslation("candidateSearch")
  const years = yearsOf(row.total_experience_years)
  const facts = [
    row.candidate_location,
    years === null
      ? null
      : years === "under"
        ? t("card.underYear")
        : t("card.years", { count: years }),
  ].filter(Boolean)
  if (facts.length === 0) return null
  return <span className={cn("block", className)}>{facts.join(" · ")}</span>
}
