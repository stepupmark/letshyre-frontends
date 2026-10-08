import type { QueryKey } from "@tanstack/react-query"
import { queryClient } from "./query-client"

// patches every cached query under `queryKey` and returns a function that undoes it
export async function patchQueries<T>(
  queryKey: QueryKey,
  update: (data: T) => T
) {
  await queryClient.cancelQueries({ queryKey })
  const snapshot = queryClient.getQueriesData<T>({ queryKey })
  queryClient.setQueriesData<T>({ queryKey }, (data) =>
    data === undefined ? data : update(data)
  )
  return () => {
    for (const [key, data] of snapshot) queryClient.setQueryData(key, data)
  }
}
