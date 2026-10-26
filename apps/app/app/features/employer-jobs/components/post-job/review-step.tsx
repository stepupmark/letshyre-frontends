import { dirFor } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { Spinner } from "@workspace/ui/components/spinner"
import { CircleAlert, Eye } from "lucide-react"
import { useRef, useState } from "react"
import { useWatch } from "react-hook-form"
import { href } from "react-router"
import { toast } from "sonner"

import { DraftSaved } from "@/components/draft-saved"
import { FileDropzone } from "@/components/file-dropzone"
import { useGo } from "@/lib/navigation"
import { useAutosave } from "@/hooks/use-draft"

import type { useJobForm } from "../../hooks/use-job-form"
import type { PostDraft } from "../../hooks/use-post-draft"
import type { Industry, JobValues } from "../../lib/job-values"
import { JD_RULES } from "../../lib/employer-jobs"
import { useCreateJob } from "../../mutations/use-job-changes"
import { JobForm } from "../form/job-form"
import { JobView } from "../job-view"

export function ReviewStep({
  form,
  showServerErrors,
  fromJd,
  jd,
  jdChecked,
  onJd,
  industries,
  onSave,
  onPosted,
  onStartOver,
}: {
  form: ReturnType<typeof useJobForm>["form"]
  showServerErrors: (error: unknown) => boolean
  fromJd: Partial<JobValues>
  jd: File | null
  /** false until the stored JD has been looked for */
  jdChecked: boolean
  onJd: (file: File | null) => void
  industries: Industry[]
  onSave: (draft: PostDraft) => void
  onPosted: () => void
  onStartOver: () => void
}) {
  const { t } = useTranslation("jobs")
  const side = dirFor(useLocale()) === "rtl" ? "left" : "right"
  const go = useGo()
  const post = useCreateJob()
  const reattach = useRef<HTMLDivElement>(null)
  const [previewing, setPreviewing] = useState(false)
  const [jdMissing, setJdMissing] = useState(false)
  const values = useWatch({ control: form.control }) as JobValues
  const saves = useAutosave(values, () => {
    onSave({ values: form.getValues(), fromJd })
  })

  return (
    <form
      noValidate
      className="flex max-w-3xl flex-col gap-5"
      onSubmit={(event) => {
        void form.handleSubmit((next) => {
          if (!jd) {
            setJdMissing(true)
            reattach.current?.querySelector("input")?.focus()
            return
          }
          post.mutate(
            { values: next, jd },
            {
              onSuccess: (job) => {
                onPosted()
                toast.success(t("post.posted"), {
                  description: t("post.postedBody"),
                })
                go(
                  job.id
                    ? href("/employer/jobs/:jobId", { jobId: job.id })
                    : href("/employer/jobs")
                )
              },
              onError: (error) => {
                showServerErrors(error)
              },
            }
          )
        })(event)
      }}
    >
      {jdChecked && !jd && (
        <div
          ref={reattach}
          className="settle flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:p-6"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-brand-text">
              {t("post.reattach.title")}
            </h2>
            <p className="text-sm text-pretty text-muted-foreground">
              {t("post.reattach.body")}
            </p>
          </div>
          <FileDropzone
            label={t("post.jdLabel")}
            description={t("post.jdHint")}
            rules={JD_RULES}
            value={jd}
            error={jdMissing ? t("post.needFileToPost") : undefined}
            onSelect={(file) => {
              onJd(file)
              if (file) setJdMissing(false)
            }}
          />
        </div>
      )}

      <JobForm form={form} industries={industries} fromJd={fromJd} isNew />

      {post.isError && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{t("post.submitFailed")}</AlertDescription>
        </Alert>
      )}

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border bg-background/95 p-3 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <Button type="submit" size="lg" disabled={post.isPending}>
          {post.isPending && <Spinner />}
          {post.isPending ? t("post.submitting") : t("post.submit")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => {
            setPreviewing(true)
          }}
        >
          <Eye />
          {t("post.preview")}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onStartOver}>
          {t("post.startOver")}
        </Button>
        <div className="ms-auto">
          <DraftSaved saves={saves} />
        </div>
      </div>

      <Sheet open={previewing} onOpenChange={setPreviewing}>
        <SheetContent side={side} className="w-full gap-0 sm:max-w-lg">
          <SheetHeader className="border-b">
            <SheetTitle className="text-lg text-brand-text">
              {values.title.trim() || t("preview.title")}
            </SheetTitle>
            <SheetDescription>{t("preview.lead")}</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto p-4">
            <JobView values={values} industries={industries} />
          </div>
        </SheetContent>
      </Sheet>
    </form>
  )
}
