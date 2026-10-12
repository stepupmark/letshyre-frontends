import { Trans, useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import {
  ArchiveIcon,
  PencilLineIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  UserRoundPlusIcon,
} from "lucide-react"
import { useId } from "react"

import { Section, SectionHeader } from "@/components/section"

const STAGES = [
  { id: "live", icon: UserRoundPlusIcon, active: true },
  { id: "update", icon: PencilLineIcon, active: true },
  { id: "removed", icon: ArchiveIcon, active: false },
  { id: "again", icon: RotateCcwIcon, active: false },
] as const

export function ProfileDuration() {
  const { t } = useTranslation("about")
  const headingId = useId()

  return (
    <Section aria-labelledby={headingId} className="border-t py-14 sm:py-20">
      <SectionHeader id={headingId} title={t("profileDuration.title")} />
      <ol className="mt-10 grid md:grid-cols-4 md:gap-6">
        {STAGES.map(({ id, icon: Icon, active }, i) => {
          const last = i === STAGES.length - 1
          return (
            <li key={id} className="reveal flex gap-4 md:flex-col md:gap-5">
              <div
                aria-hidden
                className="flex flex-col items-center md:flex-row"
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full border",
                    active
                      ? "border-transparent bg-brand-muted text-brand-text"
                      : "bg-background text-muted-foreground"
                  )}
                >
                  <Icon className="size-4.5" />
                </span>
                {!last && (
                  <span
                    className={cn(
                      "mt-2 w-px flex-1 md:ms-3 md:mt-0 md:h-px md:w-auto md:bg-border",
                      active ? "bg-brand/50" : "bg-border"
                    )}
                  >
                    {active && (
                      <span className="grow-in hidden size-full origin-left bg-brand/50 md:block rtl:origin-right" />
                    )}
                  </span>
                )}
              </div>
              <div
                className={cn("flex flex-col gap-1.5", !last && "pb-8 md:pb-0")}
              >
                <p className="text-sm font-semibold text-brand-text tabular-nums">
                  {t(`profileDuration.stages.${id}.when`)}
                </p>
                <p className="text-pretty text-muted-foreground">
                  <Trans
                    t={t}
                    i18nKey={`profileDuration.stages.${id}.body`}
                    components={{
                      b: <strong className="font-semibold text-foreground" />,
                    }}
                  />
                </p>
              </div>
            </li>
          )
        })}
      </ol>
      <aside className="mt-12 flex gap-3 rounded-xl border bg-muted/40 p-4 text-sm sm:p-5">
        <ShieldCheckIcon
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-brand-text"
        />
        <p className="max-w-3xl text-pretty text-muted-foreground">
          <strong className="me-1.5 font-semibold text-foreground">
            {t("disclaimer.title")}
          </strong>
          {t("disclaimer.body")}
        </p>
      </aside>
    </Section>
  )
}
