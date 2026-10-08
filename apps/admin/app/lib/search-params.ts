import { readTableParams, writeTableParams } from "@workspace/api/table-params"
import { useSearchParams, type ShouldRevalidateFunction } from "react-router"

type Change = Record<string, string | number | null>

export const searchOf = (request: Request) => new URL(request.url).searchParams

export const pageOf = (params: URLSearchParams) =>
  readTableParams(params, { sortable: [] }).page

export const textOf = (params: URLSearchParams, key: string) =>
  params.get(key) ?? ""

/** The value if it's one of `options`, so a hand-edited URL can't send junk to the API. */
export function oneOf<T extends string>(
  value: string | null,
  options: readonly T[]
): T | null {
  return options.find((option) => option === value) ?? null
}

/** URL-backed page state; any change but `page` starts again at page 1. */
export function useSearchState<T>(read: (params: URLSearchParams) => T) {
  const [searchParams, setSearchParams] = useSearchParams()

  const update = (change: Change | null) => {
    setSearchParams(
      (current) => {
        if (!change) return new URLSearchParams()
        const { page, ...rest } = change
        return writeTableParams(current, {
          ...(typeof page === "number" && { page }),
          filters: Object.fromEntries(
            Object.entries(rest).map(([key, value]) => [
              key,
              value === null || value === "" ? null : String(value),
            ])
          ),
        })
      },
      { replace: true, preventScrollReset: true }
    )
  }

  return [read(searchParams), update] as const
}

// the page's own queries refetch on filter changes, so loaders only run on arrival
export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}) => currentUrl.pathname !== nextUrl.pathname && defaultShouldRevalidate

/** Drops empty values so they aren't sent as `?search=`. */
export function compactParams<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined
    )
  ) as { [K in keyof T]?: Exclude<T[K], null> }
}
