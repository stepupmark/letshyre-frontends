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
import { Plus, X } from "lucide-react"
import { useId, useState } from "react"
import { Controller, useWatch, type UseFormReturn } from "react-hook-form"

import { DateField } from "@/components/date-field"
import { TextField } from "@/components/text-field"
import { parseIsoDate, relativeDay } from "@/lib/date"
import { formatPercent } from "@/lib/format"
import { checkOnBlur } from "@/lib/forms"
import { industriesQuery } from "@/lib/industries"
import { useFieldValid } from "@/hooks/use-field-valid"

import {
  lastDayRange,
  payRaise,
  type Values,
} from "../../schemas/onboarding-form.schema"
import { ChoiceField } from "./choice-field"

export function WorkStep({ form }: { form: UseFormReturn<Values> }) {
  const { t, i18n } = useTranslation("candidateOnboarding")
  const industries = useQuery(industriesQuery())
  const isValid = useFieldValid(form)
  const { errors } = form.formState
  const [now, next, home] = useWatch({
    control: form.control,
    name: ["current_ctc", "expected_ctc", "address_city"],
  })
  const rupee =
    new Intl.NumberFormat(i18n.language, { style: "currency", currency: "INR" })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? ""
  const example = new Intl.NumberFormat(i18n.language).format(8.5)
  const raise =
    isValid("current_ctc") && isValid("expected_ctc")
      ? payRaise({ current_ctc: now, expected_ctc: next })
      : 0

  return (
    <FieldGroup>
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <TextField
          label={t("work.company")}
          autoComplete="organization"
          valid={isValid("present_or_last_working_company")}
          error={errors.present_or_last_working_company?.message}
          {...checkOnBlur(form, "present_or_last_working_company")}
        />
        <Controller
          control={form.control}
          name="last_day_of_working"
          render={({ field }) => {
            const day = parseIsoDate(field.value)
            return (
              <DateField
                label={t("work.lastDay")}
                calendar={lastDayRange()}
                note={day ? relativeDay(day, i18n.language) : undefined}
                value={field.value}
                valid={isValid("last_day_of_working")}
                error={errors.last_day_of_working?.message}
                inputRef={field.ref}
                onChange={field.onChange}
                onBlur={() => {
                  field.onBlur()
                  if (form.getValues("last_day_of_working"))
                    void form.trigger("last_day_of_working")
                }}
              />
            )
          }}
        />
        <TextField
          label={t("work.current")}
          lead={rupee}
          placeholder={example}
          inputMode="decimal"
          className="tabular-nums"
          valid={isValid("current_ctc")}
          error={errors.current_ctc?.message}
          {...checkOnBlur(form, "current_ctc")}
        />
        <TextField
          label={t("work.expected")}
          lead={rupee}
          placeholder={example}
          labelAside={
            raise > 0 && (
              <span className="pop rounded-full bg-success/12 px-2 py-0.5 text-xs font-semibold text-success tabular-nums">
                {formatPercent(raise, i18n.language, true)}
              </span>
            )
          }
          inputMode="decimal"
          className="tabular-nums"
          valid={isValid("expected_ctc")}
          error={errors.expected_ctc?.message}
          {...checkOnBlur(form, "expected_ctc")}
        />
        <TextField
          label={t("work.desired")}
          lead={rupee}
          placeholder={example}
          inputMode="decimal"
          className="tabular-nums"
          valid={isValid("desired_ctc")}
          error={errors.desired_ctc?.message}
          {...checkOnBlur(form, "desired_ctc")}
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
            suggest={home.trim()}
            error={errors.preferred_locations?.message}
            onChange={(next) => {
              field.onChange(next)
              if (errors.preferred_locations)
                void form.trigger("preferred_locations")
            }}
          />
        )}
      />
    </FieldGroup>
  )
}

function Places({
  value,
  suggest,
  error,
  onChange,
}: {
  value: string[]
  /** offered as a one-tap chip until it's added */
  suggest: string
  error?: string
  onChange: (value: string[]) => void
}) {
  const { t } = useTranslation("candidateOnboarding")
  const id = useId()
  const [draft, setDraft] = useState("")
  const addPlaces = (text: string) => {
    const parts = text
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
    if (parts.length === 0) return
    const next = [...value]
    for (const part of parts)
      if (!next.some((p) => p.toLowerCase() === part.toLowerCase()))
        next.push(part)
    onChange(next)
  }
  const add = () => {
    addPlaces(draft)
    setDraft("")
  }
  const offer =
    suggest && !value.some((p) => p.toLowerCase() === suggest.toLowerCase())
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
      {offer && (
        <div>
          <button
            type="button"
            aria-label={t("work.addPlace", { place: suggest })}
            onClick={() => {
              addPlaces(suggest)
            }}
            className="flex w-fit items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors outline-none hover:border-brand hover:text-brand-text focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none"
          >
            <Plus className="size-3" aria-hidden="true" />
            {suggest}
          </button>
        </div>
      )}
      <FieldError>{error}</FieldError>
    </Field>
  )
}
