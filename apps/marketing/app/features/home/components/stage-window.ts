const FADE = 0.05

/**
 * Scroll input and opacity output for stage `index` of `total` sharing one scene:
 * each owns an equal slice and cross-fades into the next at the boundary. The first
 * starts visible and the last stays visible.
 */
export function stageWindow(index: number, total: number) {
  const start = index / total
  const end = (index + 1) / total
  const first = index === 0
  const last = index === total - 1

  return {
    input: [
      ...(first ? [0] : [start - FADE, start + FADE]),
      ...(last ? [1] : [end - FADE, end + FADE]),
    ],
    output: [...(first ? [1] : [0, 1]), ...(last ? [1] : [1, 0])],
  }
}
