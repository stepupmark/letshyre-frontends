import { useQuery } from "@tanstack/react-query";
import {
  fetchUnlocksDashboardCards,
  fetchUnlockedProfilesTable,
  FetchUnlockedProfilesParams,
} from "../api/unlocks.api";

export const useUnlocksDashboard = () => {
  return useQuery({
    queryKey: ["unlocks", "dashboard"],
    queryFn: fetchUnlocksDashboardCards,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUnlockedProfiles = (params: FetchUnlockedProfilesParams) => {
  return useQuery({
    queryKey: ["unlocks", "table", params],
    queryFn: () => fetchUnlockedProfilesTable(params),
    staleTime: 5 * 60 * 1000,
  });
};
