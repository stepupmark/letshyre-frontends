import { useTranslation } from "@workspace/i18n/react"
import { Banknote, BriefcaseBusiness, FileText, UsersRound } from "lucide-react"
import type { ComponentProps } from "react"
import {
  Controller,
  useWatch,
  type FieldPath,
  type UseFormReturn,
} from "react-hook-form"

import { TextField } from "@/components/text-field"
import { checkOnBlur } from "@/lib/forms"
import { SkillsInput } from "@/components/skills-input"

import {
  EMPLOYMENT_TYPES,
  experienceText,
  salaryText,
  today,
  WORK_MODES,
  type JobValues,
} from "../../lib/job-values"
import { type Industry } from "../../lib/job-mapping"
import { Choice, FormSection, Labelled, LongText, Range } from "./fields"

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
        <span className="pop inline-flex items-center rounded-md bg-brand-muted px-1.5 py-0.5 text-xs font-medium text-brand-text">
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
    <div className="flex flex-col gap-5">
      <FormSection
        title={t("form.sections.role")}
        hint={t("form.sectionHints.role")}
        icon={BriefcaseBusiness}
      >
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
      </FormSection>

      <FormSection
        title={t("form.sections.people")}
        hint={t("form.sectionHints.people")}
        icon={UsersRound}
        delay={60}
      >
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
                <SkillsInput
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
      </FormSection>

      <FormSection
        title={t("form.sections.pay")}
        hint={t("form.sectionHints.pay")}
        icon={Banknote}
        delay={120}
      >
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
      </FormSection>

      <FormSection
        title={t("form.sections.description")}
        hint={t("form.sectionHints.description")}
        icon={FileText}
        delay={180}
      >
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
      </FormSection>
    </div>
  )
}
