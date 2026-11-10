import type { MDXComponents } from "mdx/types"
import type { ComponentProps } from "react"
import { Link } from "react-router"

/**
 * For guides and glossary entries: text and links only. The post kit would pull its buttons and
 * tools into the topic and term pages, and every page's shared chunk with them.
 */
export const plainComponents: MDXComponents = {
  p: (props: ComponentProps<"p">) => <p className="text-pretty" {...props} />,
  strong: (props: ComponentProps<"strong">) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="flex list-disc flex-col gap-2 ps-6" {...props} />
  ),
  li: (props: ComponentProps<"li">) => <li className="ps-1" {...props} />,
  a: ({ href = "", children, ...props }: ComponentProps<"a">) =>
    href.startsWith("/") ? (
      <Link to={href} className="text-link" {...props}>
        {children}
      </Link>
    ) : (
      <a href={href} rel="noopener" className="text-link" {...props}>
        {children}
      </a>
    ),
}
