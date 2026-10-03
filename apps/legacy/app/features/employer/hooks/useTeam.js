import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamService } from "@/features/employer/services/team.service";
import { queryKeys } from "@/lib/queryKeys";

export const useTeamMembers = () => {
  return useQuery({
    queryKey: queryKeys.employer.teamList(),
    queryFn: teamService.getMembers,
    select: (data) => data?.data?.results || [],
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teamService.addMember,
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.employer.teamList() });
      }
    },
  });
};

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teamService.updateMember,
    onSuccess: (res) => {
      if (res.success || res.message === "Status Update Successfully") {
        queryClient.invalidateQueries({ queryKey: queryKeys.employer.teamList() });
      }
    },
  });
};

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teamService.deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employer.teamList() });
    },
  });
};
