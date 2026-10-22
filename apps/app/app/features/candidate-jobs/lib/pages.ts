/** First, last and the pages around the current one, with null for each gap. */
export function pageWindow(page: number, pages: number, around = 1) {
  const list: (number | null)[] = []
  for (let n = 1; n <= pages; n++) {
    const near = Math.abs(n - page) <= around
    if (n === 1 || n === pages || near) list.push(n)
    else if (list.at(-1) !== null) list.push(null)
  }
  // a gap that hides a single page costs as much space as the page itself
  return list.map((item, i) =>
    item === null && list[i - 1] === (list[i + 1] ?? 0) - 2
      ? (list[i - 1] ?? 0) + 1
      : item
  )
}
