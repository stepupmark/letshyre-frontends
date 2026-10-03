import type { ReactNode } from "react"

/** Render first in <body>. The target needs `tabIndex={-1}` to take focus. */
export function SkipLink({
  children,
  targetId = "main",
}: {
  children: ReactNode
  targetId?: string
}) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only rounded-md bg-background px-3 py-2 text-sm font-medium text-foreground shadow-md ring-2 ring-ring focus:not-sr-only focus:fixed focus:inset-s-4 focus:top-4 focus:z-50"
    >
      {children}
    </a>
  )
}
