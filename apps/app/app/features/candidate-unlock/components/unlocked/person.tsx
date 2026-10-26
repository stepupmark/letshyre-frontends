import { safeUrl } from "@workspace/api"
import { useTranslation } from "@workspace/i18n/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { BadgeCheck } from "lucide-react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"

import { initials, roleOf } from "../../lib/unlocked"
import type { Unlocked } from "../../schemas/candidate-unlock.schema"

export function Person({ row }: { row: Unlocked }) {
  const { t } = useTranslation("unlock")
  const name = row.candidate_name?.trim() ? row.candidate_name.trim() : "—"
  const photo = safeUrl(row.candidate_profile_photo)
  const role = roleOf(row)

  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar className="max-md:size-10">
        {photo && <AvatarImage src={photo} alt="" />}
        <AvatarFallback className="bg-brand-muted text-xs font-medium text-brand-text">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex min-w-0 items-center gap-1">
          <AppLink
            to={href("/employer/candidates/:candidateId", {
              candidateId: row.id,
            })}
            className="truncate rounded-sm font-medium text-brand-text underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {name}
          </AppLink>
          {row.candidate_is_verified && (
            <BadgeCheck
              role="img"
              aria-label={t("list.verified")}
              className="size-4 shrink-0 text-info"
            />
          )}
        </span>
        {role && (
          <span className="truncate text-xs text-muted-foreground">{role}</span>
        )}
      </span>
    </span>
  )
}
