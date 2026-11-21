// a scene's stage is its section's sticky first child; it holds at its computed `top` for as
// long as the section is taller than the stage
function geometry(section: HTMLElement) {
  const stage = section.firstElementChild
  if (!(stage instanceof HTMLElement)) return { stick: 0, travel: 0 }
  return {
    stick: parseFloat(getComputedStyle(stage).top) || 0,
    travel: section.offsetHeight - stage.offsetHeight,
  }
}

/** How far the stage is through its pin: 0 as it sticks, 1 as it lets go. */
export function pinProgress(section: HTMLElement) {
  const { stick, travel } = geometry(section)
  if (travel <= 0) return 0
  const p = (stick - section.getBoundingClientRect().top) / travel
  return Math.min(1, Math.max(0, p))
}

/** The page scroll position at which the stage is `progress` through its pin. */
export function pinScrollTop(section: HTMLElement, progress: number) {
  const { stick, travel } = geometry(section)
  const top = section.getBoundingClientRect().top + window.scrollY
  return top - stick + travel * progress
}
