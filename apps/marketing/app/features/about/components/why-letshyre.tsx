import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  BrainCircuitIcon,
  ClipboardCheckIcon,
  LockOpenIcon,
  TimerIcon,
  UsersIcon,
} from "lucide-react"
import { useId } from "react"
import { Link } from "react-router"

import { Section, SectionHeader } from "@/components/section"
import { PAGES } from "@/lib/pages"

const REASONS = [
  { id: "aiPowered", icon: BrainCircuitIcon, link: "interview" },
  { id: "faster", icon: TimerIcon },
  { id: "network", icon: UsersIcon },
  { id: "payPerUnlock", icon: LockOpenIcon, link: "pricing" },
  { id: "transparency", icon: ClipboardCheckIcon },
] as const

export function WhyLetsHyre() {
  const { t } = useTranslation("about")
  const lang = useLocale()
  const headingId = useId()

  return (
    <Section aria-labelledby={headingId} className="border-t py-12 sm:py-16">
      <SectionHeader id={headingId} title={t("why.heading")} />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REASONS.map((reason) => (
          <li
            key={reason.id}
            className="flex flex-col gap-2 rounded-xl border p-5 sm:p-6 sm:first:col-span-2"
          >
            <span className="mb-1 flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <reason.icon aria-hidden className="size-5" />
            </span>
            <h3 className="text-lg font-semibold">
              {t(`why.cards.${reason.id}.title`)}
            </h3>
            <p className="text-pretty text-muted-foreground">
              {t(`why.cards.${reason.id}.desc`)}
            </p>
            {"link" in reason && (
              <Link
                to={localePath(lang, PAGES[reason.link].path)}
                className="mt-auto w-fit rounded-sm pt-1 text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {t(`why.links.${reason.link}`)}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </Section>
  )
}
