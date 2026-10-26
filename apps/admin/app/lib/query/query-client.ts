import {
  MutationCache,
  QueryCache,
  QueryClient,
  type QueryExecuteOptions,
  type QueryKey,
} from "@tanstack/react-query"
import { HttpError } from "@workspace/api"
import { toast } from "sonner"

import { getErrorMessage } from "@/lib/errors"

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: {
      /** Show a toast when the query fails. */
      errorMessage?: string
    }
    mutationMeta: {
      successMessage?: string
      /** Fallback text for the error toast, or false to handle errors in the component. */
      errorMessage?: string | false
      /** Query keys to invalidate once the mutation settles. */
      invalidates?: QueryKey[]
    }
  }
}

// a 401 has already sent the user back to the login page
const isUnauthorized = (error: unknown) =>
  error instanceof HttpError && error.status === 401

export const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.errorMessage && !isUnauthorized(error)) {
        toast.error(getErrorMessage(error, query.meta.errorMessage))
      }
    },
  }),
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _result, mutation) => {
      if (mutation.meta?.successMessage)
        toast.success(mutation.meta.successMessage)
    },
    onError: (error, _variables, _result, mutation) => {
      if (mutation.meta?.errorMessage === false || isUnauthorized(error)) return
      toast.error(getErrorMessage(error, mutation.meta?.errorMessage))
    },
    onSettled: async (_data, _error, _variables, _result, mutation) => {
      const keys = mutation.meta?.invalidates ?? []
      await Promise.all(
        keys.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
      )
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      // the api client already retries failed GETs
      retry: false,
    },
  },
})

/** Starts a fetch for a loader without waiting; errors surface in the component. */
export function prefetch<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends QueryKey,
>(
  options: QueryExecuteOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryFnData,
    TQueryKey
  >
) {
  queryClient.query(options).catch(() => undefined)
}
