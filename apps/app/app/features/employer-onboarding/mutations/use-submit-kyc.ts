import { updateUser } from "@workspace/auth"
import { useMutation } from "@tanstack/react-query"

import type { Values } from "../schemas/onboarding-form.schema"
import { submitKyc } from "../services/employer-onboarding.service"

export const useSubmitKyc = ({
  onProgress,
  onSubmitted,
  onFailed,
}: {
  onProgress: (fraction: number) => void
  onSubmitted: () => void
  onFailed: (error: Error) => void
}) =>
  useMutation({
    mutationFn: (values: Values) => submitKyc(values, onProgress),
    onSuccess: () => {
      updateUser({ is_profile_completed: true })
      onSubmitted()
    },
    onError: onFailed,
  })
