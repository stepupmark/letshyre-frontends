import { queryOptions } from "@tanstack/react-query"
import { channelsService } from "../services/channels.service"

export const channelsKeys = {
  all: ["channels"] as const,
  settings: () => [...channelsKeys.all, "settings"] as const,
}

export const channelsQueries = {
  settings: () =>
    queryOptions({
      queryKey: channelsKeys.settings(),
      queryFn: ({ signal }) => channelsService.get(signal),
      staleTime: 5 * 60_000,
    }),
}
