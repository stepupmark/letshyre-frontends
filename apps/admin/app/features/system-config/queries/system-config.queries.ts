import { queryOptions } from "@tanstack/react-query"
import { systemConfigService } from "../services/system-config.service"

export const systemConfigKeys = {
  all: ["system-config"] as const,
}

export const systemConfigQueries = {
  detail: () =>
    queryOptions({
      queryKey: systemConfigKeys.all,
      queryFn: ({ signal }) => systemConfigService.get(signal),
      staleTime: 5 * 60_000,
    }),
}
