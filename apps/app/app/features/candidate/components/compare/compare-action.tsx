import { useTranslation } from "@workspace/i18n/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Columns3 } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"

import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"
import { duration, ease } from "@/lib/motion"
import { safeUrl } from "@/lib/safe-url"

import { compareHref, MAX_COMPARE } from "../../lib/compare"

interface Picked {
  id: string
  name: string
  photo?: string | null
}

export function CompareAction({ people }: { people: Picked[] }) {
  const { t } = useTranslation("scorecard")
  const ready = people.length >= 2 && people.length <= MAX_COMPARE

  return (
    <span className="flex items-center gap-3">
      <span aria-hidden="true" className="flex">
        <AnimatePresence initial={false}>
          {people.slice(0, MAX_COMPARE).map((person) => (
            <m.span
              key={person.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: duration.fast, ease }}
              className="not-first:-ms-2"
            >
              <Avatar className="size-6 ring-2 ring-popover">
                <AvatarImage src={safeUrl(person.photo) ?? undefined} alt="" />
                <AvatarFallback className="bg-brand-muted text-xs font-medium text-brand-text">
                  {person.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </m.span>
          ))}
        </AnimatePresence>
      </span>
      {ready ? (
        <AppLink
          to={compareHref(people.map((person) => person.id))}
          className={buttonLink({ size: "sm" })}
        >
          <Columns3 />
          {t("compare.go")}
        </AppLink>
      ) : (
        <span className="text-xs text-muted-foreground">
          {people.length < 2
            ? t("compare.pickMore")
            : t("compare.tooMany", { max: MAX_COMPARE })}
        </span>
      )}
    </span>
  )
}
