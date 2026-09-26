import { useMutation, useQueryClient } from "@tanstack/react-query";
import { channelsKeys } from "../queries/channels.queries";
import type { ChannelKey } from "../schemas/channels.schema";
import { channelsService } from "../services/channels.service";

export function useUpdateChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, enabled }: { key: ChannelKey; enabled: boolean }) =>
      channelsService.update({ [key]: enabled }),
    onSuccess: (settings) =>
      queryClient.setQueryData(channelsKeys.settings(), settings),
    meta: { successMessage: "Channel updated" },
  });
}
