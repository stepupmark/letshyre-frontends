import { queryOptions } from "@tanstack/react-query"

import { authService } from "../services/auth.service"

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
}

export const authQueries = {
  me: () =>
    queryOptions({
      queryKey: authKeys.me(),
      queryFn: ({ signal }) => authService.getProfile(signal),
      staleTime: 5 * 60_000,
    }),
}
