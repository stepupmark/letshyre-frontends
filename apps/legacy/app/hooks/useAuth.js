import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { toast } from "@/lib/toast";
import authService from "@/services/auth.service";
import { ROLE_HOME, FALLBACK_HOME } from "@/constants";
import { resolveLoginErrorKey } from "@/lib/authErrorMessages";

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("auth");

  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: authService.login,
    onSuccess: (data) => {
      // The redirect already confirms it, so keep this brief.
      toast.success(t("toast.loginSuccess"), { duration: 2000 });

      // Redirect target is decided by the role the backend actually
      // returned, not the form the user happened to submit — requireAuth
      // trusts the same field, so using anything else risks landing on a
      // page the very next route guard immediately bounces from.
      let defaultRedirect = ROLE_HOME[data?.role] ?? FALLBACK_HOME;

      if (data?.role === "Employer" && data?.is_profile_completed === false) {
        defaultRedirect = "/employer/onboarding";
      }

      // Validate redirect target: must be a relative path starting with a
      // single slash. Rejects external URLs ("//evil.com") and non-string
      // values to prevent open-redirect attacks via crafted location.state.
      // ?next= is set by requireAuth when a signed-out visitor opens /employer/billing.
      const search = location.state?.from?.search;
      const query = typeof search === "string" && search.startsWith("?") ? search : "";
      const from = location.state?.from?.pathname;
      const target =
        typeof from === "string" ? from + query : new URLSearchParams(location.search).get("next");
      const isSafeRedirect =
        typeof target === "string" &&
        target.startsWith("/") &&
        !target.startsWith("//") &&
        !target.startsWith("/\\");
      const redirectTo = isSafeRedirect ? target : defaultRedirect;
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => {
      toast.error(t(resolveLoginErrorKey(error)));
    },
  });
};
