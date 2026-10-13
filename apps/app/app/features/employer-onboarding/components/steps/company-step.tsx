import { useTranslation } from "@workspace/i18n/react"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { useQuery } from "@tanstack/react-query"
import { useId } from "react"
import { Controller, useWatch, type UseFormReturn } from "react-hook-form"

import { TextField } from "@/components/text-field"
import { checkOnBlur } from "@/lib/forms"
import { industriesQuery } from "@/lib/industries"

import { useFieldValid } from "../../hooks/use-field-valid"
import { withScheme } from "../../lib/url"
import type { Values } from "../../schemas/onboarding-form.schema"

export function CompanyStep({ form }: { form: UseFormReturn<Values> }) {
  const { t } = useTranslation("onboarding")
  const id = useId()
  const industries = useQuery(industriesQuery())
  const isValid = useFieldValid(form)
  const { errors } = form.formState
  const description = useWatch({
    control: form.control,
    name: "company_description",
  })

  const urlField = (name: "company_website" | "linkedin_url") => {
    const field = checkOnBlur(form, name)
    return {
      ...field,
      onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
        form.setValue(name, withScheme(event.target.value))
        return field.onBlur(event)
      },
    }
  }

  return (
    <FieldGroup className="gap-8">
      <FieldSet>
        <FieldLegend>{t("groups.about")}</FieldLegend>
        <FieldGroup>
          <TextField
            label={t("fields.companyName")}
            autoComplete="organization"
            valid={isValid("company_name")}
            error={errors.company_name?.message}
            {...checkOnBlur(form, "company_name")}
          />
          <Controller
            control={form.control}
            name="company_industry"
            render={({ field }) => (
              <Field data-invalid={Boolean(errors.company_industry)}>
                <FieldLabel htmlFor={`${id}-industry`}>
                  {t("fields.industry")}
                </FieldLabel>
                <Select
                  items={industries.data ?? []}
                  value={field.value || null}
                  onValueChange={(value) => {
                    field.onChange(value ?? "")
                  }}
                  disabled={!industries.data}
                >
                  <SelectTrigger
                    id={`${id}-industry`}
                    ref={field.ref}
                    className="w-full"
                    aria-invalid={Boolean(errors.company_industry)}
                    aria-describedby={
                      errors.company_industry
                        ? `${id}-industry-error`
                        : undefined
                    }
                    onBlur={field.onBlur}
                  >
                    <SelectValue
                      placeholder={
                        industries.isError
                          ? t("fields.industryFailed")
                          : t("fields.industryPlaceholder")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(industries.data ?? []).map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError id={`${id}-industry-error`}>
                  {errors.company_industry?.message}
                </FieldError>
              </Field>
            )}
          />
          <Field data-invalid={Boolean(errors.company_description)}>
            <FieldLabel htmlFor={`${id}-description`}>
              {t("fields.description")}
            </FieldLabel>
            <Textarea
              id={`${id}-description`}
              rows={3}
              maxLength={500}
              className="field-sizing-content min-h-24"
              aria-invalid={Boolean(errors.company_description)}
              aria-describedby={[
                `${id}-description-count`,
                errors.company_description && `${id}-description-error`,
              ]
                .filter(Boolean)
                .join(" ")}
              {...checkOnBlur(form, "company_description")}
            />
            <FieldDescription
              id={`${id}-description-count`}
              className="flex justify-between gap-3"
            >
              <span>{t("fields.descriptionHint")}</span>
              <span className="shrink-0 tabular-nums">
                {t("fields.descriptionCount", { count: description.length })}
              </span>
            </FieldDescription>
            <FieldError id={`${id}-description-error`}>
              {errors.company_description?.message}
            </FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>{t("groups.presence")}</FieldLegend>
        <FieldGroup>
          <TextField
            label={t("fields.website")}
            type="url"
            autoComplete="url"
            inputMode="url"
            valid={isValid("company_website")}
            error={errors.company_website?.message}
            {...urlField("company_website")}
          />
          <TextField
            label={t("fields.linkedin")}
            type="url"
            inputMode="url"
            valid={isValid("linkedin_url")}
            error={errors.linkedin_url?.message}
            {...urlField("linkedin_url")}
          />
          <TextField
            label={t("fields.officialEmail")}
            type="email"
            autoComplete="email"
            hint={t("fields.officialEmailHint")}
            valid={isValid("official_email")}
            error={errors.official_email?.message}
            {...checkOnBlur(form, "official_email")}
          />
        </FieldGroup>
      </FieldSet>
    </FieldGroup>
  )
}
