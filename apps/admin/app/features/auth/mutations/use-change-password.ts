import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(currentPassword, newPassword),
    meta: { successMessage: "Password updated", errorMessage: false },
  });
}
