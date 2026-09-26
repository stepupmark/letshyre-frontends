import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchChannelSettings,
  patchChannelSettings,
  type ChannelSettingsPatchPayload,
} from "../api/channels.api";

export const CHANNELS_QUERY_KEY = ["channel-settings"] as const;

export function useChannelSettings() {
  return useQuery({
    queryKey: CHANNELS_QUERY_KEY,
    queryFn: fetchChannelSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes — config rarely changes
  });
}

export function useUpdateChannelSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChannelSettingsPatchPayload) =>
      patchChannelSettings(payload),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(CHANNELS_QUERY_KEY, updatedData);
    },
  });
}
