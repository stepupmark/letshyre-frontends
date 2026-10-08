/** Table state lives in the URL, so back, refresh and shared links restore it. */
export interface TableParams {
  page: number
  sort: { id: string; desc: boolean } | null
  q: string
}

export const PAGE_SIZE = 20

export function readTableParams(
  params: URLSearchParams,
  {
    sortable,
    defaultSort = null,
  }: { sortable: readonly string[]; defaultSort?: TableParams["sort"] }
): TableParams {
  const page = Number.parseInt(params.get("page") ?? "", 10)
  const rawSort = params.get("sort") ?? ""
  const id = rawSort.replace(/^-/, "")

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    // only columns the API can sort by; anything else in a hand-edited URL is ignored
    sort: sortable.includes(id)
      ? { id, desc: rawSort.startsWith("-") }
      : defaultSort,
    q: params.get("q")?.trim() ?? "",
  }
}

/** Applies a change; anything but a page change starts again at page 1. */
export function writeTableParams(
  params: URLSearchParams,
  change: Partial<Omit<TableParams, "sort">> & {
    sort?: TableParams["sort"]
    filters?: Record<string, string | null>
  }
): URLSearchParams {
  const next = new URLSearchParams(params)
  const set = (key: string, value: string | null | undefined) => {
    if (value) next.set(key, value)
    else next.delete(key)
  }

  if ("sort" in change)
    set(
      "sort",
      change.sort ? `${change.sort.desc ? "-" : ""}${change.sort.id}` : null
    )
  if (change.q !== undefined) set("q", change.q.trim())
  for (const [key, value] of Object.entries(change.filters ?? {}))
    set(key, value)

  if (change.page !== undefined)
    set("page", change.page > 1 ? String(change.page) : null)
  else next.delete("page")

  return next
}

/** DRF ordering parameter, e.g. "-created_at". */
export const ordering = (sort: TableParams["sort"]) =>
  sort ? `${sort.desc ? "-" : ""}${sort.id}` : undefined
