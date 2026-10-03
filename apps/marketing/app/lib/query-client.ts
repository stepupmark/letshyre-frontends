import { QueryClient } from "@tanstack/react-query"

// @workspace/api already retries GETs
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: 5 * 60_000, retry: false },
    },
  })
