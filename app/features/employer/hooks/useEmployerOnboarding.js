import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitEmployerOnboarding } from "@/features/employer/services/onboarding.service";
import { queryKeys } from "@/lib/queryKeys";

export const useSubmitOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitEmployerOnboarding,
    onSuccess: () => {
      // Invalidate dashboard or employer profile queries if necessary
      queryClient.invalidateQueries({ queryKey: queryKeys.employer.profile() });
    },
  });
};

