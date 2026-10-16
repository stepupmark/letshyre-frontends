import type { ReactNode } from "react"

export function TextLink({
  href,
  children,
}: {
  href: string
  children?: ReactNode
}) {
  return (
    <a href={href} className="text-link">
      {children}
    </a>
  )
}
