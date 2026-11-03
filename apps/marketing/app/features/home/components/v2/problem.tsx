import { useTranslation } from "@workspace/i18n/react"
import { BriefcaseBusinessIcon, UserRoundIcon } from "lucide-react"
import type { ReactNode } from "react"

import { BandHeading } from "@/components/band-heading"
import { Band } from "@/components/band"

import { ResumePile } from "./art/resume-pile"
import { SameCall } from "./art/same-call"

export function Problem() {
  const { t } = useTranslation(["home", "homeV2"])

  return (
    <Band id="tension" muted>
      <BandHeading
        id="tension-title"
        eyebrow={t("home:tension.eyebrow")}
        title={t("home:tension.title")}
        accent={t("home:tension.accent")}
        className="slide-in max-w-3xl"
      />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Side
          icon={<BriefcaseBusinessIcon aria-hidden className="size-4" />}
          label={t("home:tension.employer.label")}
          body={t("home:tension.employer.body")}
          art={<ResumePile label={t("homeV2:problem.employerArt")} />}
        />
        <Side
          icon={<UserRoundIcon aria-hidden className="size-4" />}
          label={t("home:tension.candidate.label")}
          body={t("home:tension.candidate.body")}
          art={<SameCall label={t("homeV2:problem.candidateArt")} />}
        />
      </div>
    </Band>
  )
}

function Side({
  icon,
  label,
  body,
  art,
}: {
  icon: ReactNode
  label: string
  body: string
  art: ReactNode
}) {
  return (
    <article className="slide-in flex flex-col overflow-hidden rounded-2xl border bg-card">
      <div className="aspect-8/5 border-b bg-muted/40 p-6">{art}</div>
      <div className="flex flex-col gap-2 p-6">
        <h3 className="flex items-center gap-2 font-semibold text-brand-text">
          {icon}
          {label}
        </h3>
        <p className="text-pretty text-muted-foreground">{body}</p>
      </div>
    </article>
  )
}
