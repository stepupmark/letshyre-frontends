import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { industriesQuery } from "@/lib/industries"

import { useJobForm } from "../../hooks/use-job-form"
import { usePostDraft } from "../../hooks/use-post-draft"
import { EMPTY, type JobValues } from "../../lib/job-values"
import { useParseJd } from "../../mutations/use-parse-jd"
import { FlowSteps } from "./flow-steps"
import { ReadingStep } from "./reading-step"
import { ReviewStep } from "./review-step"
import { UploadStep } from "./upload-step"

/** Every job starts from a JD: upload it, let the AI fill the form, then check and post. */
export function PostJob() {
  const [jd, setJd] = useState<File | null>(null)
  const draft = usePostDraft((file) => {
    setJd((current) => current ?? file)
  })
  const [title, setTitle] = useState("")
  const [fromJd, setFromJd] = useState<Partial<JobValues>>(
    draft.initial?.fromJd ?? {}
  )
  const [reviewing, setReviewing] = useState(draft.initial !== null)
  const industries = useQuery(industriesQuery())
  const { form, showServerErrors } = useJobForm(
    { ...EMPTY, ...draft.initial?.values },
    { isNew: true }
  )
  const parse = useParseJd()

  const startOver = () => {
    draft.discard()
    parse.reset()
    form.reset(EMPTY)
    setJd(null)
    setFromJd({})
    setReviewing(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <FlowSteps current={reviewing ? 2 : parse.isPending ? 1 : 0} />
      {reviewing ? (
        <ReviewStep
          form={form}
          showServerErrors={showServerErrors}
          fromJd={fromJd}
          jd={jd}
          jdChecked={draft.jdChecked}
          onJd={(file) => {
            setJd(file)
            draft.saveJd(file)
          }}
          industries={industries.data ?? []}
          onSave={draft.save}
          onPosted={draft.discard}
          onStartOver={startOver}
        />
      ) : parse.isPending ? (
        <ReadingStep
          stage={parse.stage}
          progress={parse.progress}
          onCancel={parse.cancel}
        />
      ) : (
        <UploadStep
          title={title}
          onTitle={setTitle}
          jd={jd}
          onJd={setJd}
          failed={parse.isError}
          onRead={(file, typed) => {
            parse.mutate(
              { file, title: typed },
              {
                onSuccess: (result) => {
                  form.reset(result.values)
                  setFromJd(result.fromJd)
                  draft.save(result)
                  draft.saveJd(file)
                  setReviewing(true)
                },
              }
            )
          }}
        />
      )}
    </div>
  )
}
