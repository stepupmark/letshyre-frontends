import { zodResolver } from "@hookform/resolvers/zod"
import { HttpError } from "@workspace/api"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
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
import { useMutation } from "@tanstack/react-query"
import { CalendarClock, Eye, Share2 } from "lucide-react"
import { useId, useMemo, useState } from "react"
import { Controller, useForm, type FieldPath } from "react-hook-form"
import { toast } from "sonner"

import { CopyButton } from "@/components/copy-button"
import { TextField } from "@/components/text-field"
import { checkOnBlur } from "@/lib/forms"

import { createShareLink } from "../services/share.service"
import {
  makeShareSchema,
  type ShareLink,
  type ShareValues,
} from "../schemas/share.schema"
import { MAX_SHARE_DAYS, shareUrl } from "../lib/share"

interface JobOption {
  value: string
  label: string
}

const DEFAULTS: ShareValues = {
  job_id: "",
  expires_in_days: "14",
  max_views: "20",
}
const FIELDS = Object.keys(DEFAULTS) as FieldPath<ShareValues>[]

export function ShareDialog({
  unlockId,
  name,
  jobs,
  size = "default",
}: {
  unlockId: string
  name: string
  jobs: JobOption[] | undefined
  size?: "default" | "sm"
}) {
  const { t } = useTranslation("candidate")
  const [open, setOpen] = useState(false)
  const [link, setLink] = useState<ShareLink | null>(null)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setLink(null)
      }}
    >
      <Button
        variant="outline"
        size={size}
        onClick={() => {
          setLink(null)
          setOpen(true)
        }}
      >
        <Share2 />
        {t("share.button")}
      </Button>
      <DialogContent>
        {link ? (
          <Created link={link} name={name} />
        ) : (
          <ShareForm
            unlockId={unlockId}
            name={name}
            jobs={jobs}
            onCreated={setLink}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function ShareForm({
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

  const create = useMutation({
    mutationFn: (values: ShareValues) => createShareLink(unlockId, values),
    onSuccess: onCreated,
    onError: (error) => {
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
      <DialogHeader>
        <DialogTitle>{t("share.title", { name })}</DialogTitle>
        <DialogDescription>{t("share.lead")}</DialogDescription>
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

function Created({ link, name }: { link: ShareLink; name: string }) {
  const { t } = useTranslation(["candidate", "common"])
  const locale = useLocale()
  const url = shareUrl(link)
  const expires = link.expires_at ? new Date(link.expires_at) : null

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("share.readyTitle")}</DialogTitle>
        <DialogDescription>{t("share.readyLead", { name })}</DialogDescription>
      </DialogHeader>
      {url ? (
        <div className="flex min-w-0 flex-col gap-3 rounded-lg border p-4">
          <p className="truncate font-mono text-sm" dir="ltr" title={url}>
            {url}
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {expires && !Number.isNaN(expires.getTime()) && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-3.5" aria-hidden="true" />
                {t("share.expires", {
                  date: new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                  }).format(expires),
                })}
              </span>
            )}
            {link.max_views != null && (
              <span className="inline-flex items-center gap-1.5">
                <Eye className="size-3.5" aria-hidden="true" />
                {t("share.viewLimit", { count: link.max_views })}
              </span>
            )}
          </p>
          <CopyButton value={url} label={t("share.copy")} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("share.noLink")}</p>
      )}
      <DialogFooter>
        <DialogClose render={<Button />}>{t("share.done")}</DialogClose>
      </DialogFooter>
    </>
  )
}
