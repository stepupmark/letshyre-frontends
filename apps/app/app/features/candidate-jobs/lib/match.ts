export const termsOf = (query: string) =>
  query
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((term) => term.length > 1)

export const matches = (text: string, query: string) => {
  const lower = text.toLowerCase()
  return termsOf(query).some((term) => lower.includes(term))
}
