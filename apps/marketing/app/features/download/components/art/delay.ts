import type { CSSProperties } from "react"

export const wait = (ms = 0): CSSProperties => ({ animationDelay: `${ms}ms` })
