import { useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { CircleAlert } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirm-dialog"

import { useJobForm } from "../../hooks/use-job-form"
import type { Industry, JobValues } from "../../lib/job-values"
import { useUpdateJob } from "../../mutations/use-job-changes"
import { JobForm } from "../form/job-form"

export function EditJob({
  jobId,
  values,
  industries,
  onDone,
}: {
  jobId: string
  values: JobValues
  industries: Industry[]
  onDone: () => void
}) {
  const { t } = useTranslation("jobs")
  const [discarding, setDiscarding] = useState(false)
  const { form, showServerErrors } = useJobForm(values, { isNew: false })
  const save = useUpdateJob(jobId)

  return (
    <form
      noValidate
      className="flex max-w-3xl flex-col gap-5"
      onSubmit={(event) => {
        void form.handleSubmit((next) => {
          save.mutate(next, {
            onSuccess: () => {
              toast.success(t("detail.saved"))
              onDone()
            },
            onError: (error) => {
              showServerErrors(error)
            },
          })
        })(event)
      }}
    >
      <JobForm form={form} industries={industries} isNew={false} />
      {save.isError && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{t("detail.saveFailed")}</AlertDescription>
        </Alert>
      )}
      <div className="sticky bottom-3 z-10 flex flex-wrap gap-2 rounded-2xl border bg-background/95 p-3 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <Button type="submit" size="lg" disabled={save.isPending}>
          {save.isPending && <Spinner />}
          {save.isPending ? t("detail.saving") : t("detail.save")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => {
            if (form.formState.isDirty) setDiscarding(true)
            else onDone()
          }}
        >
          {t("detail.cancel")}
        </Button>
      </div>
      <ConfirmDialog
        open={discarding}
        onOpenChange={setDiscarding}
        title={t("detail.discardTitle")}
        description={t("detail.discardBody")}
        confirmLabel={t("detail.discard")}
        destructive
        onConfirm={onDone}
      />
    </form>
  )
}
