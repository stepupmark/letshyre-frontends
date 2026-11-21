import { useTranslation } from "@workspace/i18n/react"
import {
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"
import type { UseFormReturn } from "react-hook-form"

import { TextField } from "@/components/text-field"
import { checkOnBlur } from "@/lib/forms"
import { useFieldValid } from "@/hooks/use-field-valid"

import type { Values } from "../../schemas/onboarding-form.schema"

export function LegalStep({ form }: { form: UseFormReturn<Values> }) {
  const { t } = useTranslation("onboarding")
  const isValid = useFieldValid(form)
  const { errors } = form.formState

  const upperField = (
    name: "company_registration_number" | "pan_number" | "gst_number"
  ) => ({
    ...checkOnBlur(form, name),
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      form.setValue(name, event.target.value.toUpperCase(), {
        shouldValidate: Boolean(errors[name]),
      })
    },
  })

  return (
    <FieldGroup>
      <TextField
        label={t("fields.registration")}
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={21}
        className="font-mono tracking-wider uppercase"
        valid={isValid("company_registration_number")}
        error={errors.company_registration_number?.message}
        {...upperField("company_registration_number")}
      />
      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          label={t("fields.pan")}
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={10}
          className="font-mono tracking-wider uppercase"
          valid={isValid("pan_number")}
          error={errors.pan_number?.message}
          {...upperField("pan_number")}
        />
        <TextField
          label={t("fields.gst")}
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={15}
          className="font-mono tracking-wider uppercase"
          valid={isValid("gst_number")}
          error={errors.gst_number?.message}
          {...upperField("gst_number")}
        />
      </div>
      <FieldSet>
        <FieldLegend>{t("fields.address")}</FieldLegend>
        <FieldGroup className="gap-4">
          <TextField
            label={t("fields.addressLine")}
            autoComplete="address-line1"
            valid={isValid("address_line")}
            error={errors.address_line?.message}
            {...checkOnBlur(form, "address_line")}
          />
          <TextField
            label={t("fields.city")}
            autoComplete="address-level2"
            valid={isValid("address_city")}
            error={errors.address_city?.message}
            {...checkOnBlur(form, "address_city")}
          />
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
            <TextField
              label={t("fields.state")}
              autoComplete="address-level1"
              valid={isValid("address_state")}
              error={errors.address_state?.message}
              {...checkOnBlur(form, "address_state")}
            />
            <TextField
              label={t("fields.pin")}
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={6}
              className="tabular-nums"
              valid={isValid("address_pin")}
              error={errors.address_pin?.message}
              {...checkOnBlur(form, "address_pin")}
            />
          </div>
        </FieldGroup>
      </FieldSet>
    </FieldGroup>
  )
}
