import { useTranslation } from "@workspace/i18n/react"
import { useMutation } from "@tanstack/react-query"
import type { FieldValues, Path, UseFormReturn } from "react-hook-form"

import { authErrorKey, FIELD_OF } from "./errors"

/**
 * Sends a code for a form. Errors about the field land on the field, the rest
 * come back as `formError` for an alert above the form.
 */
export function useSendCode<T extends FieldValues, R>({
  form,
  field,
  send,
  onSent,
}: {
  form: UseFormReturn<T>
  field: Path<T> & ("email" | "phone")
  send: (values: T) => Promise<R>
  onSent: (result: R) => void
}) {
  const { t } = useTranslation("auth")
  const mutation = useMutation({
    mutationFn: send,
    onSuccess: onSent,
    onError: (error) => {
      const key = authErrorKey(error, "errors.sendFailed")
      if (FIELD_OF[key] === field)
        form.setError(field, { message: t(key) }, { shouldFocus: true })
    },
  })
  const key = mutation.isError
    ? authErrorKey(mutation.error, "errors.sendFailed")
    : null

  return {
    send: mutation.mutate,
    sending: mutation.isPending,
    formError: key && FIELD_OF[key] !== field ? t(key) : null,
  }
}
