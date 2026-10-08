import { useMutation } from "@tanstack/react-query"

import { endSession } from "@/lib/session"

import { authService } from "../services/auth.service"

export function useLogout() {
  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      endSession()
    },
    meta: { errorMessage: false },
  })
}
