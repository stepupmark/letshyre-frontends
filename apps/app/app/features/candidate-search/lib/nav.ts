export interface Neighbours {
  index: number
  previous: string | null
  next: string | null
}

export function neighbours(
  keys: readonly string[],
  selected: string | null
): Neighbours | null {
  const index = selected === null ? -1 : keys.indexOf(selected)
  if (index < 0) return null
  return {
    index,
    previous: keys[index - 1] ?? null,
    next: keys[index + 1] ?? null,
  }
}
