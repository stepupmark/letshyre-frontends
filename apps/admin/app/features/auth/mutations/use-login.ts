import { ROLE_HOME, ROLES, safeNext } from "@workspace/auth"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useSearchParams } from "react-router"

import { authKeys } from "../queries/auth.queries"
import { authService } from "../services/auth.service"
import type { LoginInput } from "../types"

export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    meta: { errorMessage: false },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.all })
      const next = safeNext(searchParams.get("next"))
      void navigate(next ?? ROLE_HOME[ROLES.admin], { replace: true })
    },
  })
}
