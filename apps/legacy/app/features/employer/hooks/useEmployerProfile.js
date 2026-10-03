import {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";
import {
  getEmployerProfile,
  updateEmployerKyc,
} from "@/features/employer/services/employerProfile.service";
import { useTranslation } from "react-i18next";
import { toast } from "@/lib/toast";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME } from "@/lib/queryClient";

// Employer profile (KYC), shared with the route prefetch so the keys match.
export const employerProfileQuery = () =>
  queryOptions({
    queryKey: queryKeys.employer.profile(),
    queryFn: getEmployerProfile,
    staleTime: STALE_TIME.SHORT,
  });

// Retained for mutation invalidation; sourced from the key factory so it stays
// in lockstep with the query above.
export const PROFILE_QUERY_KEY = queryKeys.employer.profile();

export const useGetEmployerProfile = () => {
  return useQuery(employerProfileQuery());
};

export const useUpdateKyc = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("employer");

  return useMutation({
    mutationFn: updateEmployerKyc,
    onSuccess: () => {
      toast.success(t("profile.toasts.updated"));
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
    onError: () => {
      toast.error(t("profile.toasts.updateFailed"));
    },
  });
};
