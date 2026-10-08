interface Page<T> {
  results: T[]
  total_pages: number
}

export const EXPORT_PAGE_LIMIT = 50

export async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<Page<T>>
) {
  const first = await fetchPage(1)
  const pages = Math.min(first.total_pages, EXPORT_PAGE_LIMIT)
  const rows = [...first.results]
  for (let page = 2; page <= pages; page++) {
    rows.push(...(await fetchPage(page)).results)
  }
  return { rows, truncated: first.total_pages > EXPORT_PAGE_LIMIT }
}
