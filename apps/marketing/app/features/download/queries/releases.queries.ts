import { HttpError } from "@workspace/api"
import { type DesktopOs, getLatestRelease } from "@workspace/api/public"
import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"

export const releaseQuery = (os: DesktopOs) =>
  queryOptions({
    queryKey: ["desktop-release", os],
    queryFn: async ({ signal }) => {
      try {
        return await getLatestRelease(api, os, { signal })
      } catch (error) {
        // the API answers 404 for a platform that has never had a build
        if (error instanceof HttpError && error.status === 404) return null
        throw error
      }
    },
  })
