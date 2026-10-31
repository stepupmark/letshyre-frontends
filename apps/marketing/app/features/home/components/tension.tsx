import { useTranslation } from "@workspace/i18n/react"
import { BriefcaseBusinessIcon, UserRoundIcon } from "lucide-react"
import { lazy, Suspense, type ComponentType } from "react"

import { BandHeading } from "@/components/band-heading"
import { Band } from "@/components/band"
import { useHydrated } from "@/hooks/use-hydrated"

// decorative, so it loads after hydration; a prerendered Suspense needs inline scripts the CSP blocks
const LookalikeResumes = lazy(() => import("./art/lookalike-resumes"))
const RepeatQuestion = lazy(() => import("./art/repeat-question"))

export function Tension() {
  const { t } = useTranslation("home")
  const sides = [
    {
      id: "employer",
      icon: BriefcaseBusinessIcon,
      Art: LookalikeResumes,
      ...t("tension.employer", { returnObjects: true }),
    },
    {
      id: "candidate",
      icon: UserRoundIcon,
      Art: RepeatQuestion,
      ...t("tension.candidate", { returnObjects: true }),
    },
  ]

  return (
    <Band id="tension" muted>
      <BandHeading
        id="tension-title"
        eyebrow={t("tension.eyebrow")}
        title={t("tension.title")}
        accent={t("tension.accent")}
        className="slide-in max-w-3xl"
      />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {sides.map((side) => (
          <PainCard key={side.id} {...side} />
        ))}
      </div>
    </Band>
  )
}

function PainCard({
  icon: Icon,
  Art,
  label,
  body,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>
  Art: ComponentType
  label: string
  body: string
}) {
  const hydrated = useHydrated()

  return (
    <article className="slide-in flex flex-col overflow-hidden rounded-2xl border">
      <div className="h-48 border-b p-5 sm:h-56 sm:p-6">
        {hydrated && (
          <Suspense>
            <Art />
          </Suspense>
        )}
      </div>
      <div className="flex flex-col gap-2 p-5 sm:p-6">
        <h3 className="flex items-center gap-2 font-semibold text-brand-text">
          <Icon aria-hidden className="size-4" />
          {label}
        </h3>
        <p className="text-pretty text-muted-foreground">{body}</p>
      </div>
    </article>
  )
}
