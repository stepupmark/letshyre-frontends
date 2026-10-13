import { useTranslation } from "@workspace/i18n/react"
import { FieldGroup } from "@workspace/ui/components/field"
import type { UseFormReturn } from "react-hook-form"

import { TextField } from "@/components/text-field"
import { checkOnBlur } from "@/lib/forms"

import { useFieldValid } from "../../hooks/use-field-valid"
import type { Values } from "../../schemas/onboarding-form.schema"

export function LegalStep({ form }: { form: UseFormReturn<Values> }) {
  const { t } = useTranslation("onboarding")
  const isValid = useFieldValid(form)
  const { errors } = form.formState

  const upperField = (name: "pan_number" | "gst_number") => ({
    ...checkOnBlur(form, name),
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      form.setValue(name, event.target.value.toUpperCase(), {
        shouldValidate: Boolean(errors[name]),
      })
    },
  })

  return (
    <FieldGroup>
      <p className="text-sm text-muted-foreground">{t("legal.lead")}</p>
      <TextField
        label={t("fields.registration")}
        hint={t("fields.registrationHint")}
        autoCapitalize="characters"
        spellCheck={false}
        valid={isValid("company_registration_number")}
        error={errors.company_registration_number?.message}
        {...checkOnBlur(form, "company_registration_number")}
      />
      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          label={t("fields.pan")}
          hint={t("fields.panHint")}
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
          hint={t("fields.gstHint")}
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={15}
          className="font-mono tracking-wider uppercase"
          valid={isValid("gst_number")}
          error={errors.gst_number?.message}
          {...upperField("gst_number")}
        />
      </div>
      <TextField
        label={t("fields.address")}
        autoComplete="street-address"
        valid={isValid("company_address")}
        error={errors.company_address?.message}
        {...checkOnBlur(form, "company_address")}
      />
    </FieldGroup>
  )
}
