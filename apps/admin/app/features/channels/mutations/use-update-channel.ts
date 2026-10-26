import { useMutation, useQueryClient } from "@tanstack/react-query"

import { patchQueries } from "@/lib/query/optimistic"

import { channelsKeys } from "../queries/channels.queries"
import type { ChannelKey, ChannelSettings } from "../schemas/channels.schema"
import { channelsService } from "../services/channels.service"

export function useUpdateChannel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ key, enabled }: { key: ChannelKey; enabled: boolean }) =>
      channelsService.update({ [key]: enabled }),
    onMutate: async ({ key, enabled }) => ({
      rollback: await patchQueries<ChannelSettings>(
        channelsKeys.settings(),
        (settings) => ({ ...settings, [key]: enabled })
      ),
    }),
    onError: (_error, _variables, context) => context?.rollback(),
    onSuccess: (settings) =>
      queryClient.setQueryData(channelsKeys.settings(), settings),
    meta: { successMessage: "Channel updated" },
  })
}
