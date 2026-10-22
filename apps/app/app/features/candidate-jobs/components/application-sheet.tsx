import { useLocale, useTranslation } from "@workspace/i18n/react"

import { DetailSheet } from "@/components/detail-sheet"
import { useLastDefined } from "@/hooks/use-last-defined"

import { appliedOn, type Stage } from "../lib/applications"
import { companyOf } from "../lib/candidate-jobs"
import { type Job } from "../schemas/candidate-jobs.schema"
import { NextStep } from "./application-card"
import { ApplicationStepper } from "./application-stepper"
import { JobDetail } from "./job-detail"

export function ApplicationSheet({
  jobs,
  stage,
  openId,
  query,
  onOpen,
}: {
  jobs: Job[] | undefined
  stage: Stage
  openId: string | null
  query: string
  onOpen: (id: string | null) => void
}) {
  const { t } = useTranslation("candidateJobs")
  const locale = useLocale()
  const index = jobs?.findIndex((job) => job.id === openId) ?? -1
  const shown = useLastDefined(index >= 0 ? jobs?.[index] : undefined)
  const applied = shown ? appliedOn(shown, locale) : null

  return (
    <DetailSheet
      open={index >= 0}
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
    >
      {shown && (
        <>
          <section className="flex flex-col gap-4 rounded-lg border p-4">
            <ApplicationStepper
              stage={stage}
              vertical
              notes={
                applied
                  ? { Applied: t("applications.appliedOn", { date: applied }) }
                  : undefined
              }
            />
            <div className="border-t pt-3">
              <NextStep stage={stage} />
            </div>
          </section>
          <JobDetail job={shown} query={query} />
        </>
      )}
    </DetailSheet>
  )
}
