import { useTranslation } from "@workspace/i18n/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { BadgeCheck, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export interface HeaderFact {
  icon: LucideIcon
  text: string
}

export function ProfileHeader({
  name,
  photo,
  verified,
  headline,
  facts,
  aside,
}: {
  name: string
  photo: string | null
  verified: boolean
  headline: string
  facts: HeaderFact[]
  /** actions for an employer, completion for the candidate */
  aside?: ReactNode
}) {
  const { t } = useTranslation("candidate")
  return (
    <header className="settle flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
      <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
        <Avatar className="size-16 shrink-0 ring-4 ring-brand-muted sm:size-20">
          {photo && <AvatarImage src={photo} alt="" className="object-cover" />}
          <AvatarFallback className="bg-brand-muted text-xl font-semibold text-brand-text sm:text-2xl">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:gap-2">
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <h1
              tabIndex={-1}
              className="flex items-center gap-1.5 text-xl font-semibold tracking-tight text-balance outline-none sm:gap-2 sm:text-3xl"
            >
              <span className="min-w-0 wrap-break-word">{name}</span>
              {verified && (
                <span className="pop inline-flex shrink-0 text-brand-text">
                  <BadgeCheck aria-hidden="true" className="size-5 sm:size-6" />
                  <span className="sr-only">{t("profile.verified")}</span>
                </span>
              )}
            </h1>
            {headline && (
              <p className="text-sm font-medium text-pretty text-brand-text sm:text-base">
                {headline}
              </p>
            )}
          </div>
          {facts.length > 0 && (
            <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground sm:gap-x-4 sm:text-sm">
              {facts.map((fact) => (
                <li key={fact.text} className="flex items-center gap-1.5">
                  <fact.icon
                    aria-hidden="true"
                    className="size-3.5 shrink-0 sm:size-4"
                  />
                  {fact.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {aside && (
        <div className="flex shrink-0 flex-wrap gap-2 max-sm:w-full max-sm:*:flex-1 print:hidden">
          {aside}
        </div>
      )}
    </header>
  )
}
