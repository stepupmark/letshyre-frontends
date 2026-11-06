import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { ArrowRight, Video } from "lucide-react"
import { useEffect, useRef } from "react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"

/**
 * Takes Apply's place until the candidate has finished an interview. Applying stays one tap away,
 * since a scorecard can lag behind the interview and the API makes the final call.
 */
export function InterviewFirst({
  focus = false,
  applying,
  onApply,
}: {
  focus?: boolean
  applying: boolean
  onApply: () => void
}) {
  const { t } = useTranslation("candidateJobs")
  const link = useRef<HTMLAnchorElement>(null)

  // Apply was just pressed and is gone; keep keyboard focus in the footer
  useEffect(() => {
    if (focus) link.current?.focus()
  }, [focus])

  return (
    <div className="flex w-full flex-col gap-3">
      <div role="status" className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-info-muted text-info"
        >
          <Video className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {t("apply.needsInterviewTitle")}
          </p>
          <p className="text-sm text-pretty text-muted-foreground">
            {t("apply.needsInterviewBody")}
          </p>
        </div>
      </div>
      <AppLink
        ref={link}
        to={href("/employee/interview-guide")}
        className={buttonLink({ className: "h-10 w-full" })}
      >
        {t("apply.takeInterview")}
        <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
      </AppLink>
      <Button
        variant="ghost"
        size="sm"
        className="self-center text-muted-foreground max-md:h-11"
        disabled={applying}
        onClick={onApply}
      >
        {applying && <Spinner />}
        {applying ? t("apply.sending") : t("apply.alreadyTaken")}
      </Button>
    </div>
  )
}
