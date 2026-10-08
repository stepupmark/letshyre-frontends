import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useSearchParams } from "react-router"
import { tokenStore } from "~/lib/auth/token-store"
import { safeRedirect } from "~/lib/safe-url"
import { authKeys } from "../queries/auth.queries"
import { authService } from "../services/auth.service"

export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()

  return useMutation({
    mutationFn: authService.login,
    meta: { errorMessage: false },
    onSuccess: (result) => {
      tokenStore.setTokens({
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
      })
      queryClient.removeQueries({ queryKey: authKeys.all })
      navigate(safeRedirect(searchParams.get("redirectTo")), { replace: true })
    },
  })
}
