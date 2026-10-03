import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logoutMe } from "@/services/auth.service";

// Single logout path for every role. queryClient is a module singleton that
// outlives logout, so its cache must be cleared or user B briefly sees user A's
// data. Cleared on both success and failure — logoutMe ends the local session
// either way.
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const finish = () => {
    navigate("/", { replace: true });
    // Clear after navigation commits so unmounting components don't render
    // against an emptied cache.
    setTimeout(() => queryClient.clear(), 0);
  };

  return useMutation({
    mutationFn: logoutMe,
    onSuccess: finish,
    onError: (error) => {
      if (import.meta.env.DEV) console.error("Logout failed:", error);
      finish();
    },
  });
};
