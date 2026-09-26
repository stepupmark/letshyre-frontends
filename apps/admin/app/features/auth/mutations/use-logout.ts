import { useMutation } from "@tanstack/react-query";
import { endSession } from "~/lib/auth/session";
import { tokenStore } from "~/lib/auth/token-store";
import { authService } from "../services/auth.service";

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const refreshToken = tokenStore.getRefreshToken();
      try {
        if (refreshToken) await authService.logout(refreshToken);
      } finally {
        // sign out locally even if the server couldn't revoke the token
        endSession("logout");
      }
    },
    meta: { errorMessage: false },
  });
}
