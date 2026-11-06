import { useMutation } from "@tanstack/react-query"

import {
  authErrorKey,
  isVerificationLost,
  type AuthErrorKey,
} from "../lib/errors"

/** The last step of register and reset; a lost verification restarts the flow. */
export function usePasswordSubmit<R>({
  submit,
  onDone,
  onLost,
  fallback,
}: {
  submit: (password: string) => Promise<R>
  onDone: (result: R) => void
  onLost: (key: AuthErrorKey) => void
  fallback: AuthErrorKey
}) {
  const mutation = useMutation({
    mutationFn: submit,
    onSuccess: onDone,
    onError: (error) => {
      const key = authErrorKey(error, fallback)
      if (isVerificationLost(key)) onLost(key)
    },
  })
  return {
    ...mutation,
    errorKey: mutation.isError ? authErrorKey(mutation.error, fallback) : null,
  }
}
