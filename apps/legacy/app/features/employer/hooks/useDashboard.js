import {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";
import { dashboardService } from "@/features/employer/services/dashboard.service";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME } from "@/lib/queryClient";

export const dashboardStatsQuery = () =>
  queryOptions({
    queryKey: queryKeys.employer.dashboardStats(),
    queryFn: dashboardService.fetchDashboardStats,
    staleTime: STALE_TIME.SHORT,
  });


// Employer credits, shared with the layout's shell-prefetch so the keys match.
export const employerCreditsQuery = () =>
  queryOptions({
    queryKey: queryKeys.employer.credits(),
    queryFn: dashboardService.getEmployerCredits,
    staleTime: STALE_TIME.SHORT,
  });

// Team members, shared with the employer layout's shell-prefetch.
export const teamMembersQuery = () =>
  queryOptions({
    queryKey: queryKeys.employer.teamMembers(),
    queryFn: dashboardService.getTeamMembers,
    staleTime: STALE_TIME.MEDIUM,
  });

export { useGetEmployerProfile as useEmployerProfile } from "@/features/employer/hooks/useEmployerProfile";

export const useEmployerCredits = () => {
  return useQuery(employerCreditsQuery());
};

export const useTeamMembers = () => {
  return useQuery(teamMembersQuery());
};

export const useInviteTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dashboardService.inviteTeamMember,
    onSuccess: () => {
      // Invalidate the team members query so it refetches and updates the count
      queryClient.invalidateQueries({ queryKey: queryKeys.employer.teamMembers() });
    },
  });
};

export const useEmployerDashboardStats = () => {
  return useQuery(dashboardStatsQuery());
};
