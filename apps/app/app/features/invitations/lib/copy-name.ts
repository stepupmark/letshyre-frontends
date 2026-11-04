export function copyName(
  base: string,
  taken: readonly string[],
  suffix: string
) {
  const names = new Set(taken.map((name) => name.trim().toLowerCase()))
  const first = `${base} ${suffix}`
  if (!names.has(first.toLowerCase())) return first
  for (let n = 2; ; n++) {
    const next = `${first} ${n}`
    if (!names.has(next.toLowerCase())) return next
  }
}
