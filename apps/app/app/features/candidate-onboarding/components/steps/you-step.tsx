import { useTranslation } from "@workspace/i18n/react"
import {
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"
import type { UseFormReturn } from "react-hook-form"

import { TextField } from "@/components/text-field"
import { checkOnBlur } from "@/lib/forms"
import { useFieldValid } from "@/lib/use-field-valid"

import { GENDERS, type Values } from "../../schemas/onboarding-form.schema"
import { ChoiceField } from "./choice-field"

const formatAadhaar = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 12)
    .replace(/(\d{4})(?=\d)/g, "$1 ")

export function YouStep({ form }: { form: UseFormReturn<Values> }) {
  const { t } = useTranslation("candidateOnboarding")
  const isValid = useFieldValid(form)
  const { errors } = form.formState

  return (
    <FieldGroup>
      <p className="text-sm text-muted-foreground">{t("you.lead")}</p>
      <div className="grid gap-6 sm:grid-cols-2">
        <ChoiceField
          form={form}
          name="gender"
          label={t("you.gender")}
          items={GENDERS.map((g) => ({
            value: g,
            label: t(`you.genders.${g}`),
          }))}
        />
        <TextField
          label={t("you.dob")}
          type="date"
          autoComplete="bday"
          max={new Date().toISOString().slice(0, 10)}
          valid={isValid("dob")}
          error={errors.dob?.message}
          {...checkOnBlur(form, "dob")}
        />
      </div>
      <TextField
        label={t("you.aadhaar")}
        hint={t("you.aadhaarHint")}
        inputMode="numeric"
        autoComplete="off"
        maxLength={14}
        dir="ltr"
        className="tabular-nums"
        valid={isValid("aadhar_number")}
        error={errors.aadhar_number?.message}
        {...checkOnBlur(form, "aadhar_number")}
        onChange={(event) => {
          form.setValue("aadhar_number", formatAadhaar(event.target.value), {
            shouldValidate: Boolean(errors.aadhar_number),
          })
        }}
      />
      <FieldSet>
        <FieldLegend>{t("you.address")}</FieldLegend>
        <FieldGroup className="gap-4">
          <TextField
            label={t("you.addressLine")}
            autoComplete="address-line1"
            valid={isValid("address_line")}
            error={errors.address_line?.message}
            {...checkOnBlur(form, "address_line")}
          />
          <TextField
            label={t("you.city")}
            autoComplete="address-level2"
            valid={isValid("address_city")}
            error={errors.address_city?.message}
            {...checkOnBlur(form, "address_city")}
          />
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
            <TextField
              label={t("you.state")}
              autoComplete="address-level1"
              valid={isValid("address_state")}
              error={errors.address_state?.message}
              {...checkOnBlur(form, "address_state")}
            />
            <TextField
              label={t("you.pin")}
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
