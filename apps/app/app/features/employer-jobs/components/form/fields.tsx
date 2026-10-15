import { useTranslation } from "@workspace/i18n/react"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import type { LucideIcon } from "lucide-react"
import { useId, type ReactNode } from "react"
import { Controller, type UseFormReturn } from "react-hook-form"

import { checkOnBlur } from "@/lib/forms"

import type { JobValues } from "../../lib/job-values"

export function FormSection({
  title,
  hint,
  icon: Icon,
  delay = 0,
  children,
}: {
  title: string
  hint: string
  icon: LucideIcon
  /** ms, to stagger sections as the form settles */
  delay?: number
  children: ReactNode
}) {
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      style={{ transitionDelay: `${delay}ms` }}
      className="settle flex flex-col gap-6 rounded-2xl border bg-card p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-muted text-brand-text [&_svg]:size-5"
        >
          <Icon />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2
            id={id}
            className="text-base font-semibold text-balance text-brand-text"
          >
            {title}
          </h2>
          <p className="text-sm text-pretty text-muted-foreground">{hint}</p>
        </div>
      </div>
      <FieldGroup>{children}</FieldGroup>
    </section>
  )
}

export function Range({
  legend,
  preview,
  children,
}: {
  legend: string
  preview: string
  children: ReactNode
}) {
  const { t } = useTranslation("jobs")
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-sm font-medium">{legend}</legend>
      <div className="grid grid-cols-2 gap-4">{children}</div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {t("form.candidatesSee", { value: preview })}
      </p>
    </fieldset>
  )
}

export function Labelled({
  label,
  hint,
  error,
  children,
}: {
  label: ReactNode
  hint?: string
  error?: string
  children: (id: string, describedBy: string | undefined) => ReactNode
}) {
  const id = useId()
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") ||
    undefined
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children(id, describedBy)}
      {hint && <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription>}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </Field>
  )
}

export function Choice({
  form,
  name,
  label,
  placeholder,
  items,
}: {
  form: UseFormReturn<JobValues>
  name: "work_mode" | "employment_type" | "industry"
  label: ReactNode
  placeholder: string
  items: { value: string; label: string }[]
}) {
  const error = form.formState.errors[name]?.message
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <Labelled label={label} error={error}>
          {(id, describedBy) => (
            <Select
              items={items}
              value={field.value || null}
              onValueChange={(value) => {
                field.onChange(value ?? "")
                if (error) void form.trigger(name)
              }}
            >
              <SelectTrigger
                id={id}
                ref={field.ref}
                className="w-full"
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy}
                onBlur={field.onBlur}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Labelled>
      )}
    />
  )
}

export function LongText({
  form,
  name,
  label,
  hint,
  rows,
}: {
  form: UseFormReturn<JobValues>
  name: "overview" | "responsibilities"
  label: ReactNode
  hint?: string
  rows: number
}) {
  const error = form.formState.errors[name]?.message
  return (
    <Labelled label={label} hint={hint} error={error}>
      {(id, describedBy) => (
        <Textarea
          id={id}
          rows={rows}
          className="field-sizing-content min-h-28"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...checkOnBlur(form, name)}
        />
      )}
    </Labelled>
  )
}
