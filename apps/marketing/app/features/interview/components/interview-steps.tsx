import { Trans, useFormat, useTranslation } from "@workspace/i18n/react"
import {
  BriefcaseIcon,
  DownloadIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  LightbulbIcon,
  LogInIcon,
  PlayIcon,
  ScanFaceIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { useGuideLinks } from "../hooks/use-guide-links"
import {
  hasTip,
  PHASES,
  STEP_ANCHORS,
  type StepId,
  type TipStepId,
} from "../lib/sections"

const ICONS = {
  download: DownloadIcon,
  signIn: LogInIcon,
  dashboard: LayoutDashboardIcon,
  clearEnv: ShieldCheckIcon,
  permissions: KeyRoundIcon,
  verifyId: ScanFaceIcon,
  chooseRole: BriefcaseIcon,
  begin: PlayIcon,
} as const satisfies Record<StepId, unknown>

// numbering runs on across phases
const PHASE_START = PHASES.map((_, i) =>
  PHASES.slice(0, i).reduce((count, phase) => count + phase.steps.length, 1)
)

function Tip({ id }: { id: TipStepId }) {
  const { t } = useTranslation("interview")

  return (
    <div className="flex max-w-2xl items-start gap-3 rounded-lg bg-brand/10 px-4 py-3 text-sm">
      <LightbulbIcon
        aria-hidden
        className="mt-0.5 size-4 shrink-0 text-brand"
      />
      <p>
        <strong className="block font-semibold">{t("tip")}</strong>
        {t(`steps.${id}.tip`)}
      </p>
    </div>
  )
}

export function InterviewSteps() {
  const { t } = useTranslation("interview")
  const format = useFormat()
  const links = useGuideLinks()

  return (
    <div className="flex flex-col gap-10">
      {PHASES.map((phase, p) => {
        const start = PHASE_START[p] ?? 1
        const steps: readonly StepId[] = phase.steps

        return (
          <section key={phase.id} aria-labelledby={`phase-${phase.id}`}>
            <h2
              id={`phase-${phase.id}`}
              className="text-2xl font-semibold tracking-tight text-brand"
            >
              {t(`phases.${phase.id}`)}
            </h2>
            <ol start={start} className="mt-6 flex flex-col">
              {steps.map((id, i) => {
                const Icon = ICONS[id]
                const last = i === steps.length - 1

                return (
                  <li
                    key={id}
                    id={STEP_ANCHORS[id]}
                    className="flex scroll-mt-24 gap-4 sm:gap-5"
                  >
                    <div aria-hidden className="flex flex-col items-center">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground tabular-nums">
                        {format.number(start + i)}
                      </span>
                      {!last && (
                        <span className="mt-2 w-px flex-1 bg-brand/25" />
                      )}
                    </div>
                    <div
                      className={
                        last
                          ? "flex min-w-0 flex-col gap-2"
                          : "flex min-w-0 flex-col gap-2 pb-8"
                      }
                    >
                      <h3 className="flex items-center gap-2 pt-0.5 text-lg font-semibold tracking-tight">
                        <Icon
                          aria-hidden
                          className="size-5 shrink-0 text-brand"
                        />
                        {t(`steps.${id}.title`)}
                      </h3>
                      <p className="max-w-2xl text-pretty text-muted-foreground">
                        <Trans
                          t={t}
                          i18nKey={`steps.${id}.desc`}
                          components={links}
                        />
                      </p>
                      {hasTip(id) && <Tip id={id} />}
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}
    </div>
  )
}
