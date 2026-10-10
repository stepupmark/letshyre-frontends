import { dirFor } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"

import { StepTransition } from "@/components/motion/step-transition"

import { AuthHeading } from "./auth-heading"

/** Heading, step count and back for one screen of an auth flow. */
export function StepFrame({
  stepKey,
  direction,
  progress,
  onBack,
  title,
  description,
  children,
}: {
  stepKey: string
  direction: 1 | -1
  progress?: { current: number; total: number }
  onBack?: () => void
  title: string
  description?: ReactNode
  children: ReactNode
}) {
  const { t } = useTranslation("auth")
  const dir = dirFor(useLocale())

  return (
    <div className="flex flex-col gap-6">
      {(progress ?? onBack) && (
        <div className="flex h-8 items-center justify-between gap-4 text-sm text-muted-foreground">
          {onBack ? (
            <Button
              variant="ghost"
              size="sm"
              className="-ms-2"
              onClick={onBack}
            >
              <ArrowLeft className="rtl:-scale-x-100" />
              {t("back")}
            </Button>
          ) : (
            <span />
          )}
          {progress && (
            <span className="tabular-nums">{t("step", progress)}</span>
          )}
        </div>
      )}
      <StepTransition step={stepKey} direction={direction} dir={dir}>
        <div className="flex flex-col gap-6">
          <AuthHeading title={title} lead={description} />
          {children}
        </div>
      </StepTransition>
    </div>
  )
}
