import type { FieldPath, UseFormReturn } from "react-hook-form"

import type { Values } from "../schemas/onboarding-form.schema"

/** True once a filled field has been left and passed its check. */
export function useFieldValid(form: UseFormReturn<Values>) {
  const { formState } = form
  return (name: FieldPath<Values>) => {
    const state = form.getFieldState(name, formState)
    return (
      state.isTouched &&
      !state.invalid &&
      !state.isValidating &&
      Boolean(form.getValues(name))
    )
  }
}
