import { useTranslation } from "@workspace/i18n/react"
import { ArrowRight, Video } from "lucide-react"
import { useEffect, useRef } from "react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"

/** Takes Apply's place until the candidate has finished an interview. */
export function InterviewFirst({ focus = false }: { focus?: boolean }) {
  const { t } = useTranslation("candidateJobs")
  const link = useRef<HTMLAnchorElement>(null)

  // Apply was just pressed and is gone; keep keyboard focus in the footer
  useEffect(() => {
    if (focus) link.current?.focus()
  }, [focus])

  return (
    <div role="status" className="flex w-full flex-col gap-3">
      <div className="flex items-start gap-3">
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
    </div>
  )
}
