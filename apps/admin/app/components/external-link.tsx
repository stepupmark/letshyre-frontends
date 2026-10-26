import { safeUrl } from "@workspace/api"
import type { AnchorHTMLAttributes, ReactNode } from "react"

type ExternalLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "target" | "rel"
> & {
  href: string | null | undefined
  fallback?: ReactNode
}

export function ExternalLink({
  href,
  fallback = null,
  children,
  ...props
}: ExternalLinkProps) {
  const url = safeUrl(href, { bareDomains: true })
  if (!url) return <>{fallback}</>
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  )
}
