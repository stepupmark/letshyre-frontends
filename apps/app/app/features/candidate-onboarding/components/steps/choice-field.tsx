import { useTranslation } from "@workspace/i18n/react"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useId } from "react"
import { Controller, type UseFormReturn } from "react-hook-form"

import type { Values } from "../../schemas/onboarding-form.schema"

type ChoiceName = "gender" | "preferred_industry" | "notice_period_proof_type"

export function ChoiceField({
  form,
  name,
  label,
  items,
  disabled = false,
}: {
  form: UseFormReturn<Values>
  name: ChoiceName
  label: string
  items: { value: string; label: string }[]
  disabled?: boolean
}) {
  const { t } = useTranslation("candidateOnboarding")
  const id = useId()
  const error = form.formState.errors[name]?.message

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Select
            items={items}
            value={field.value || null}
            disabled={disabled}
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
            >
              <SelectValue placeholder={t("you.choose")} />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{error}</FieldError>
        </Field>
      )}
    />
  )
}
