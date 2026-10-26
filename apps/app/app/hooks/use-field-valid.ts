import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form"

/** True once a filled field has been left and passed its check. */
export function useFieldValid<T extends FieldValues>(form: UseFormReturn<T>) {
  const { formState } = form
  return (name: FieldPath<T>) => {
    const state = form.getFieldState(name, formState)
    return (
      state.isTouched &&
      !state.invalid &&
      !state.isValidating &&
      Boolean(form.getValues(name))
    )
  }
}
