import { useMutation } from "@tanstack/react-query"

import { authErrorKey, type AuthErrorKey } from "../lib/errors"

export const useVerifyCode = (verify: (code: string) => Promise<unknown>) =>
  useMutation({ mutationFn: verify })

export const useResendCode = ({
  resend,
  onSent,
  onFailed,
}: {
  resend: () => Promise<unknown>
  onSent: () => void
  onFailed: (key: AuthErrorKey) => void
}) =>
  useMutation({
    mutationFn: resend,
    onSuccess: onSent,
    onError: (error) => {
      onFailed(authErrorKey(error, "errors.sendFailed"))
    },
  })
