import { STALE_TIME } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/features/employee/services/profile.service";
import { queryKeys } from "@/lib/queryKeys";


export const useUploadResume = () => {
  return useMutation({
    mutationFn: profileService.uploadResume,
  });
};

export const useCheckResumeStatus = () => {
  return useMutation({
    mutationFn: profileService.checkResumeStatus,
  });
};

export const useGetParsedResumeData = () => {
  return useMutation({
    mutationFn: profileService.getParsedResumeData,
  });
};

export const useGetSkillsForRole = () => {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async (role) => {
      return queryClient.fetchQuery({
        queryKey: queryKeys.employee.skillsForRole(role),
        queryFn: () => profileService.getSkillsForRole(role),
        staleTime: STALE_TIME.LONG,
      });
    },
  };
};

export const useSubmitProfile = () => {
  return useMutation({
    mutationFn: profileService.submitProfile,
  });
};
