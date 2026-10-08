import { queryOptions } from "@tanstack/react-query"
import { creditsService } from "../services/credits.service"

export const creditsKeys = {
  all: ["credits"] as const,
}

export const creditsQueries = {
  detail: () =>
    queryOptions({
      queryKey: creditsKeys.all,
      queryFn: ({ signal }) => creditsService.get(signal),
    }),
}
