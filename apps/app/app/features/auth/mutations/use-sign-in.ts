import { login, type Role } from "@workspace/auth"
import { useMutation } from "@tanstack/react-query"

import { api } from "@/lib/api"

export const useSignIn = ({
  role,
  onSignedIn,
  onFailed,
}: {
  role?: Role
  onSignedIn: () => void
  onFailed: () => void
}) =>
  useMutation({
    mutationFn: (values: { email: string; password: string }) =>
      login(api, values, role ? { roles: [role] } : {}),
    onSuccess: onSignedIn,
    onError: onFailed,
  })
