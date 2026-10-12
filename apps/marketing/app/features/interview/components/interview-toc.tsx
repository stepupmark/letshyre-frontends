import { useTranslation } from "@workspace/i18n/react"
import { ChevronDownIcon } from "lucide-react"

import {
  PHASES,
  PRIVACY_ANCHOR,
  REQUIREMENTS_ANCHOR,
  STEP_ANCHORS,
} from "../lib/sections"

function TocLink({
  anchor,
  active,
  children,
}: {
  anchor: string
  active?: string
  children: string
}) {
  return (
    <a
      href={`#${anchor}`}
      aria-current={anchor === active ? "location" : undefined}
      className="block rounded-md px-2 py-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none aria-[current=location]:bg-brand/10 aria-[current=location]:font-medium aria-[current=location]:text-foreground"
    >
      {children}
    </a>
  )
}

function TocLinks({ active }: { active?: string }) {
  const { t } = useTranslation("interview")

  return (
    <ul className="flex flex-col gap-0.5 text-sm">
      <li>
        <TocLink anchor={REQUIREMENTS_ANCHOR} active={active}>
          {t("requirements.title")}
        </TocLink>
      </li>
      {PHASES.map((phase) => (
        <li key={phase.id} className="mt-3">
          <p className="px-2 text-xs font-medium text-muted-foreground">
            {t(`phases.${phase.id}`)}
          </p>
          <ul className="mt-1 flex flex-col gap-0.5">
            {phase.steps.map((id) => (
              <li key={id}>
                <TocLink anchor={STEP_ANCHORS[id]} active={active}>
                  {t(`steps.${id}.title`)}
                </TocLink>
              </li>
            ))}
          </ul>
        </li>
      ))}
      <li className="mt-3">
        <TocLink anchor={PRIVACY_ANCHOR} active={active}>
          {t("privacy.title")}
        </TocLink>
      </li>
    </ul>
  )
}

export function InterviewToc({ active }: { active?: string }) {
  const { t } = useTranslation("interview")
  const label = t("toc.label")

  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <nav aria-label={label} className="lg:hidden">
        <details className="group rounded-xl border">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl p-4 text-sm font-medium focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
            {label}
            <ChevronDownIcon
              aria-hidden
              className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="border-t p-2">
            <TocLinks active={active} />
          </div>
        </details>
      </nav>
      <nav aria-label={label} className="hidden lg:block">
        <p className="px-2 text-sm font-medium">{label}</p>
        <div className="mt-3">
          <TocLinks active={active} />
        </div>
      </nav>
    </div>
  )
}
