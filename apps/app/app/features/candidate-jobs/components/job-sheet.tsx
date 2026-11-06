import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { CircleCheck } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { DetailSheet } from "@/components/detail-sheet"
import { useLastDefined } from "@/hooks/use-last-defined"
import { duration, ease } from "@/lib/motion"

import { companyOf } from "../lib/candidate-jobs"
import { useApply } from "../mutations/use-apply"
import { type Job } from "../schemas/candidate-jobs.schema"
import { InterviewFirst } from "./interview-first"
import { JobDetail } from "./job-detail"
import { ApplicationStatus } from "./job-parts"

export function JobSheet({
  jobs,
  openId,
  query,
  onOpen,
  needsInterview,
  onNeedsInterview,
}: {
  jobs: Job[] | undefined
  openId: string | null
  query: string
  onOpen: (id: string | null) => void
  needsInterview: boolean
  onNeedsInterview: () => void
}) {
  const { t } = useTranslation("candidateJobs")
  const apply = useApply({ onNeedsInterview })
  const index = jobs?.findIndex((job) => job.id === openId) ?? -1
  const open = index >= 0 ? jobs?.[index] : undefined
  const shown = useLastDefined(open)

  return (
    <DetailSheet
      open={Boolean(open)}
      onClose={() => {
        onOpen(null)
      }}
      title={shown?.title ?? t("untitled")}
      description={shown ? companyOf(shown) : undefined}
      position={
        jobs && index >= 0
          ? { current: index + 1, total: jobs.length }
          : undefined
      }
      onPrevious={
        jobs && index > 0
          ? () => {
              onOpen(jobs[index - 1]?.id ?? null)
            }
          : undefined
      }
      onNext={
        jobs && index >= 0 && index < jobs.length - 1
          ? () => {
              onOpen(jobs[index + 1]?.id ?? null)
            }
          : undefined
      }
      footer={
        shown && (
          <AnimatePresence mode="wait" initial={false}>
            {shown.status ? (
              <m.div
                key="applied"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: duration.base, ease }}
                className="flex w-full items-center justify-between gap-3"
              >
                <span className="flex items-center gap-2">
                  <CircleCheck
                    aria-hidden="true"
                    className="size-4 text-success"
                  />
                  <ApplicationStatus status={shown.status} />
                </span>
                <AppLink
                  to={href("/employee/applications")}
                  className="text-sm font-medium underline-offset-4 hover:underline"
                >
                  {t("apply.track")}
                </AppLink>
              </m.div>
            ) : needsInterview ? (
              <m.div
                key="interview"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: duration.base, ease }}
                className="w-full"
              >
                <InterviewFirst
                  focus={apply.isError && apply.variables === shown.id}
                />
              </m.div>
            ) : (
              <m.div
                key="apply"
                exit={{ opacity: 0, transition: { duration: duration.fast } }}
                className="flex w-full flex-col gap-2"
              >
                <Button
                  className="h-10 w-full"
                  disabled={apply.isPending}
                  onClick={() => {
                    apply.mutate(shown.id)
                  }}
                >
                  {apply.isPending && <Spinner />}
                  {apply.isPending ? t("apply.sending") : t("apply.button")}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  {t("apply.note")}
                </p>
              </m.div>
            )}
          </AnimatePresence>
        )
      }
    >
      {shown && <JobDetail job={shown} query={query} />}
    </DetailSheet>
  )
}
