import { zodResolver } from "@hookform/resolvers/zod"
import { HttpError } from "@workspace/api"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { CalendarClock, Share2 } from "lucide-react"
import { useId, useMemo } from "react"
import { Controller, useForm, type FieldPath } from "react-hook-form"
import { toast } from "sonner"

import { TextField } from "@/components/text-field"
import { checkOnBlur } from "@/lib/forms"

import { useCreateShareLink } from "../mutations/use-shared-links"
import {
  makeShareSchema,
  type ShareLink,
  type ShareValues,
} from "../schemas/share.schema"
import { MAX_SHARE_DAYS } from "../lib/share"

export interface JobOption {
  value: string
  label: string
}

const DEFAULTS: ShareValues = {
  job_id: "",
  expires_in_days: "14",
  max_views: "20",
}

const FIELDS = Object.keys(DEFAULTS) as FieldPath<ShareValues>[]

export function ShareForm({
  unlockId,
  name,
  jobs,
  onCreated,
}: {
  unlockId: string
  name: string
  jobs: JobOption[] | undefined
  onCreated: (link: ShareLink) => void
}) {
  const { t } = useTranslation(["candidate", "common"])
  const jobId = useId()
  const schema = useMemo(
    () =>
      makeShareSchema({
        job: t("share.errors.job"),
        days: t("share.errors.days", { max: MAX_SHARE_DAYS }),
        views: t("share.errors.views"),
      }),
    [t]
  )
  const form = useForm<ShareValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
    mode: "onSubmit",
  })
  const errors = form.formState.errors
  const locale = useLocale()
  const days = Number(form.watch("expires_in_days"))
  const views = Number(form.watch("max_views"))
  const valid =
    Number.isInteger(days) &&
    days >= 1 &&
    days <= MAX_SHARE_DAYS &&
    Number.isInteger(views) &&
    views >= 1
  const until = valid
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
        Date.now() + days * 86_400_000
      )
    : null

  const create = useCreateShareLink(unlockId, {
    onCreated,
    onFailed: (error) => {
      const fields = error instanceof HttpError ? error.fieldErrors : undefined
      let placed = false
      for (const name of FIELDS) {
        const message = fields?.[name]
        if (!message) continue
        form.setError(name, { message })
        placed = true
      }
      if (!placed) toast.error(t("share.failed"))
    },
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        void form.handleSubmit((values) => {
          create.mutate(values)
        })(event)
      }}
    >
      <DialogHeader className="flex-row items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand-text">
          <Share2 className="size-5" aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-col gap-1.5">
          <DialogTitle className="text-lg text-balance">
            {t("share.title", { name })}
          </DialogTitle>
          <DialogDescription className="text-pretty">
            {t("share.lead")}
          </DialogDescription>
        </span>
      </DialogHeader>

      <div className="flex flex-col gap-5">
        <Controller
          control={form.control}
          name="job_id"
          render={({ field }) => (
            <Field data-invalid={Boolean(errors.job_id)}>
              <FieldLabel htmlFor={jobId}>{t("share.job")}</FieldLabel>
              <Select
                items={jobs ?? []}
                value={field.value || null}
                onValueChange={(value) => {
                  field.onChange(value ?? "")
                }}
              >
                <SelectTrigger
                  id={jobId}
                  ref={field.ref}
                  className="w-full"
                  disabled={!jobs}
                  aria-invalid={Boolean(errors.job_id)}
                  aria-describedby={
                    errors.job_id ? `${jobId}-error` : undefined
                  }
                >
                  <SelectValue
                    placeholder={
                      jobs ? t("share.chooseJob") : t("common:state.loading")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(jobs ?? []).map((job) => (
                    <SelectItem key={job.value} value={job.value}>
                      {job.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id={`${jobId}-error`}>
                {errors.job_id?.message}
              </FieldError>
            </Field>
          )}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label={t("share.days")}
            hint={t("share.daysHint", { max: MAX_SHARE_DAYS })}
            inputMode="numeric"
            error={errors.expires_in_days?.message}
            {...checkOnBlur(form, "expires_in_days")}
          />
          <TextField
            label={t("share.views")}
            hint={t("share.viewsHint")}
            inputMode="numeric"
            error={errors.max_views?.message}
            {...checkOnBlur(form, "max_views")}
          />
        </div>
        {until && (
          <p className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground tabular-nums">
            <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
            {t("share.summary", { date: until })}
          </p>
        )}
      </div>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>
          {t("common:confirm.cancel")}
        </DialogClose>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? t("share.creating") : t("share.create")}
        </Button>
      </DialogFooter>
    </form>
  )
}
