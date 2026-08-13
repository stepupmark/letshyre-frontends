import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchSystemConfig,
  patchSystemConfig,
  type SystemConfigPatchPayload,
} from "../api/systemConfig.api";

export const SYSTEM_CONFIG_QUERY_KEY = ["system-config"] as const;

export function useSystemConfig() {
  return useQuery({
    queryKey: SYSTEM_CONFIG_QUERY_KEY,
    queryFn: fetchSystemConfig,
    staleTime: 1000 * 60 * 5, // 5 minutes — config rarely changes
  });
}

export function useUpdateSystemConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SystemConfigPatchPayload) =>
      patchSystemConfig(payload),
    onSuccess: (updatedData) => {
      // Directly write the fresh server data into the cache
      queryClient.setQueryData(SYSTEM_CONFIG_QUERY_KEY, updatedData);
    },
  });
}
