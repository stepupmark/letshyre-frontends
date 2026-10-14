import { useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { useQuery } from "@tanstack/react-query"
import {
  FileBadge,
  FileCheck,
  FileSignature,
  FileText,
  X,
  type LucideIcon,
} from "lucide-react"
import { useId, useState } from "react"
import { Controller, useWatch, type UseFormReturn } from "react-hook-form"

import { FileDropzone } from "@/components/file-dropzone"
import { TextField } from "@/components/text-field"
import { checkOnBlur } from "@/lib/forms"
import { industriesQuery } from "@/lib/industries"
import { useFieldValid } from "@/lib/use-field-valid"

import { draftFiles } from "../../hooks/use-onboarding-draft"
import {
  DOCUMENT,
  DOCUMENTS,
  PROOF_TYPES,
  REQUIRED_DOCUMENTS,
  type DocumentField,
  type Values,
} from "../../schemas/onboarding-form.schema"
import { ChoiceField } from "./choice-field"

const ICONS: Record<DocumentField, LucideIcon> = {
  resignation_letter: FileSignature,
  experience_letter: FileBadge,
  notice_period_proof: FileCheck,
  present_offer: FileText,
}

export function WorkStep({ form }: { form: UseFormReturn<Values> }) {
  const { t } = useTranslation("candidateOnboarding")
  const industries = useQuery(industriesQuery())
  const isValid = useFieldValid(form)
  const { errors } = form.formState
  const files = useWatch({ control: form.control, name: REQUIRED_DOCUMENTS })
  const added = files.filter((file) => file instanceof File).length

  return (
    <FieldGroup>
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label={t("work.company")}
          autoComplete="organization"
          valid={isValid("present_or_last_working_company")}
          error={errors.present_or_last_working_company?.message}
          {...checkOnBlur(form, "present_or_last_working_company")}
        />
        <TextField
          label={t("work.lastDay")}
          hint={t("work.lastDayHint")}
          type="date"
          valid={isValid("last_day_of_working")}
          error={errors.last_day_of_working?.message}
          {...checkOnBlur(form, "last_day_of_working")}
        />
        <TextField
          label={t("work.current")}
          hint={t("work.lpaHint")}
          inputMode="decimal"
          className="tabular-nums"
          valid={isValid("current_ctc")}
          error={errors.current_ctc?.message}
          {...checkOnBlur(form, "current_ctc")}
        />
        <TextField
          label={t("work.expected")}
          hint={t("work.lpaHint")}
          inputMode="decimal"
          className="tabular-nums"
          valid={isValid("expected_ctc")}
          error={errors.expected_ctc?.message}
          {...checkOnBlur(form, "expected_ctc")}
        />
      </div>
      <ChoiceField
        form={form}
        name="preferred_industry"
        label={t("work.industry")}
        disabled={!industries.data}
        items={(industries.data ?? []).map((item) => ({
          value: item.label,
          label: item.label,
        }))}
      />
      <Controller
        control={form.control}
        name="preferred_locations"
        render={({ field }) => (
          <Places
            value={field.value}
            error={errors.preferred_locations?.message}
            onChange={(next) => {
              field.onChange(next)
              if (errors.preferred_locations)
                void form.trigger("preferred_locations")
            }}
          />
        )}
      />
      <ChoiceField
        form={form}
        name="notice_period_proof_type"
        label={t("work.proofType")}
        items={PROOF_TYPES.map((p) => ({
          value: p,
          label: t(`work.proofTypes.${p}`),
        }))}
      />

      <section
        aria-labelledby="documents"
        className="overflow-hidden rounded-xl border"
      >
        <div className="flex items-center justify-between gap-4 border-b bg-muted/30 px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <h3 id="documents" className="text-sm font-medium">
              {t("work.documents")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("work.documentsLead")}
            </p>
          </div>
          <p className="shrink-0 text-xs font-medium tabular-nums">
            {t("work.count", {
              added,
              total: REQUIRED_DOCUMENTS.length,
            })}
          </p>
        </div>
        <div className="divide-y">
          {DOCUMENTS.map((name) => (
            <Controller
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FileDropzone
                  label={
                    name === "present_offer"
                      ? t("work.optional", { label: t(`work.docs.${name}`) })
                      : t(`work.docs.${name}`)
                  }
                  description={t(`work.docHints.${name}`)}
                  rules={DOCUMENT}
                  layout="row"
                  icon={ICONS[name]}
                  value={field.value ?? null}
                  error={errors[name]?.message}
                  onSelect={(file) => {
                    field.onChange(file ?? undefined)
                    void draftFiles.save(name, file)
                    if (file) form.clearErrors(name)
                  }}
                />
              )}
            />
          ))}
        </div>
      </section>
    </FieldGroup>
  )
}

function Places({
  value,
  error,
  onChange,
}: {
  value: string[]
  error?: string
  onChange: (value: string[]) => void
}) {
  const { t } = useTranslation("candidateOnboarding")
  const id = useId()
  const [draft, setDraft] = useState("")
  const add = () => {
    const parts = draft
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
    if (parts.length === 0) return
    const next = [...value]
    for (const part of parts)
      if (!next.some((p) => p.toLowerCase() === part.toLowerCase()))
        next.push(part)
    onChange(next)
    setDraft("")
  }
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{t("work.places")}</FieldLabel>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((place) => (
            <li key={place}>
              <Badge variant="secondary" className="gap-1 pe-1">
                {place}
                <button
                  type="button"
                  aria-label={t("work.removePlace", { place })}
                  className="rounded-full p-0.5 hover:bg-background"
                  onClick={() => {
                    onChange(value.filter((p) => p !== place))
                  }}
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
      <Input
        id={id}
        value={draft}
        placeholder={t("work.placesPlaceholder")}
        aria-invalid={Boolean(error)}
        onChange={(event) => {
          setDraft(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault()
            add()
          }
        }}
        onBlur={add}
      />
      <FieldError>{error}</FieldError>
    </Field>
  )
}
