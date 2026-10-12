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
import { Sparkles } from "lucide-react"
import { useId, type ComponentProps, type ReactNode } from "react"
import {
  Controller,
  useWatch,
  type FieldPath,
  type UseFormReturn,
} from "react-hook-form"

import { TextField } from "@/components/text-field"
import { checkOnBlur } from "@/lib/forms"

import { SkillsField } from "./skills-field"
import {
  EMPLOYMENT_TYPES,
  experienceText,
  salaryText,
  today,
  WORK_MODES,
  type Industry,
  type JobValues,
} from "../lib/job-values"

type Name = FieldPath<JobValues>

const NUMBER = { inputMode: "numeric", className: "tabular-nums" } as const
const DECIMAL = { inputMode: "decimal", className: "tabular-nums" } as const

/** The job's fields, shared by posting and editing. */
export function JobForm({
  form,
  industries,
  fromJd = {},
  isNew,
}: {
  form: UseFormReturn<JobValues>
  industries: Industry[]
  /** values the JD filled; marked until the employer changes them */
  fromJd?: Partial<JobValues>
  isNew: boolean
}) {
  const { t } = useTranslation("jobs")
  const values = useWatch({ control: form.control })
  const { errors } = form.formState

  const label = (name: Name, text: string) => {
    const suggested = fromJd[name as keyof JobValues]
    const still =
      suggested !== undefined &&
      JSON.stringify(suggested) ===
        JSON.stringify(values[name as keyof JobValues])
    return still ? (
      <>
        {text}
        <span className="inline-flex items-center gap-1 rounded-sm bg-info-muted px-1.5 py-0.5 text-xs font-normal text-info">
          <Sparkles className="size-3" aria-hidden="true" />
          {t("form.fromJd")}
        </span>
      </>
    ) : (
      text
    )
  }

  const text = (
    name: Name,
    title: string,
    props: Partial<ComponentProps<typeof TextField>> = {}
  ) => (
    <TextField
      label={label(name, title)}
      error={errors[name as keyof JobValues]?.message}
      {...checkOnBlur(form, name)}
      {...props}
    />
  )

  const industryItems =
    values.industry && !industries.some((i) => i.value === values.industry)
      ? [{ value: values.industry, label: values.industry }, ...industries]
      : industries

  const salary = salaryText(values.salary_min ?? "", values.salary_max ?? "")
  const experience = experienceText(
    values.experience_min ?? "",
    values.experience_max ?? ""
  )

  return (
    <div className="flex flex-col gap-10">
      <Section title={t("form.sections.role")}>
        {text("title", t("form.title"), { autoComplete: "off" })}
        <div className="grid gap-6 sm:grid-cols-2">
          <Choice
            form={form}
            name="work_mode"
            label={label("work_mode", t("form.workMode"))}
            placeholder={t("form.choose")}
            items={WORK_MODES.map((value) => ({
              value,
              label: t(`workMode.${value}`),
            }))}
          />
          <Choice
            form={form}
            name="employment_type"
            label={label("employment_type", t("form.employmentType"))}
            placeholder={t("form.choose")}
            items={EMPLOYMENT_TYPES.map((value) => ({
              value,
              label: t(`employment.${value}`),
            }))}
          />
          <Choice
            form={form}
            name="industry"
            label={label("industry", t("form.industry"))}
            placeholder={t("form.choose")}
            items={industryItems}
          />
          {text("openings", t("form.openings"), NUMBER)}
        </div>
      </Section>

      <Section title={t("form.sections.people")}>
        <Controller
          control={form.control}
          name="skills"
          render={({ field }) => (
            <Labelled
              label={label("skills", t("form.skills"))}
              hint={t("form.skillsHint")}
              error={errors.skills?.message}
            >
              {(id, describedBy) => (
                <SkillsField
                  id={id}
                  ref={field.ref}
                  value={field.value}
                  onChange={(skills) => {
                    field.onChange(skills)
                    if (errors.skills) void form.trigger("skills")
                  }}
                  onBlur={field.onBlur}
                  invalid={Boolean(errors.skills)}
                  describedBy={describedBy}
                />
              )}
            </Labelled>
          )}
        />
        <Range
          legend={t("form.experience")}
          preview={experience || t("notGiven")}
        >
          {text("experience_min", t("form.min"), NUMBER)}
          {text("experience_max", t("form.max"), NUMBER)}
        </Range>
        <div className="grid gap-6 sm:grid-cols-2">
          {text("education", t("form.education"), {
            placeholder: t("form.educationPlaceholder"),
          })}
          {text("specialization", t("form.specialization"), {
            hint: t("form.optional"),
          })}
        </div>
      </Section>

      <Section title={t("form.sections.pay")}>
        <Range legend={t("form.salary")} preview={salary || t("notDisclosed")}>
          {text("salary_min", t("form.min"), DECIMAL)}
          {text("salary_max", t("form.max"), DECIMAL)}
        </Range>
        <div className="grid gap-6 sm:grid-cols-3">
          {text("city", t("form.city"), { autoComplete: "address-level2" })}
          {text("state", t("form.state"), { autoComplete: "address-level1" })}
          {text("country", t("form.country"), {
            autoComplete: "country-name",
          })}
        </div>
        {text("location", t("form.location"), { hint: t("form.locationHint") })}
      </Section>

      <Section title={t("form.sections.description")}>
        <LongText
          form={form}
          name="overview"
          label={label("overview", t("form.overview"))}
          rows={5}
        />
        <LongText
          form={form}
          name="responsibilities"
          label={label("responsibilities", t("form.responsibilities"))}
          hint={t("form.responsibilitiesHint")}
          rows={6}
        />
        <div className="sm:w-1/2">
          {text("deadline", t("form.deadline"), {
            type: "date",
            min: isNew ? today() : undefined,
            max: "9999-12-31",
          })}
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="flex flex-col gap-6">
      <h2 id={id} className="text-base font-semibold">
        {title}
      </h2>
      <FieldGroup>{children}</FieldGroup>
    </section>
  )
}

function Range({
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

function Labelled({
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

function Choice({
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

function LongText({
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
