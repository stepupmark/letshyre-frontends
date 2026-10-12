import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"

import { sharedLinksPageSchema } from "../schemas/share.schema"

export const sharedLinksQuery = (page: number) =>
  queryOptions({
    queryKey: ["employer", "shared-links", page],
    queryFn: async () =>
      sharedLinksPageSchema.parse(
        await api.get("user/v1/employer_shared_links/", { query: { page } })
      ),
    staleTime: 30_000,
  })

export const SHARED_LINKS_KEY = ["employer", "shared-links"] as const
