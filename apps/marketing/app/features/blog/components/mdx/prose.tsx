import { cn } from "@workspace/ui/lib/utils"
import type { ComponentProps } from "react"
import { Link } from "react-router"

import { SourceMark } from "../post-sources"
import { FootnoteBack, FootnoteRef, Footnotes } from "./footnotes"
import { SectionHeading } from "./heading"

export const prose = {
  h2: SectionHeading,
  h3: ({ children, ...props }: ComponentProps<"h3">) => (
    <h3
      className="mt-4 text-xl font-semibold tracking-tight text-balance text-foreground lg:text-2xl"
      {...props}
    >
      {children}
    </h3>
  ),
  p: (props: ComponentProps<"p">) => <p className="text-pretty" {...props} />,
  ul: (props: ComponentProps<"ul">) => (
    <ul className="flex list-disc flex-col gap-2 ps-6" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="flex list-decimal flex-col gap-2 ps-6" {...props} />
  ),
  li: (props: ComponentProps<"li">) => <li className="ps-1" {...props} />,
  strong: (props: ComponentProps<"strong">) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  a: ({ href = "", className, children, ...props }: ComponentProps<"a">) => {
    if ("data-footnote-ref" in props)
      return (
        <FootnoteRef href={href} id={props.id}>
          {children}
        </FootnoteRef>
      )
    if ("data-footnote-backref" in props) return <FootnoteBack href={href} />
    const classes = cn("text-link", className)
    if (href.startsWith("/"))
      return (
        <Link to={href} className={classes} {...props}>
          {children}
        </Link>
      )
    if (!href.startsWith("https://"))
      return (
        <a href={href} className={classes} {...props}>
          {children}
        </a>
      )
    return (
      <>
        <a href={href} rel="noopener" className={classes} {...props}>
          {children}
        </a>
        <SourceMark url={href} />
      </>
    )
  },
  section: (props: ComponentProps<"section">) =>
    "data-footnotes" in props ? (
      <Footnotes {...props} />
    ) : (
      <section {...props} />
    ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="rounded-xl border bg-muted/40 px-5 py-4 text-lg text-pretty text-foreground"
      {...props}
    />
  ),
  pre: ({ className, ...props }: ComponentProps<"pre">) => (
    <pre
      className={cn(
        "overflow-x-auto rounded-xl border bg-muted/40 p-4 text-sm",
        className
      )}
      {...props}
    />
  ),
  code: (props: ComponentProps<"code">) => (
    <code
      className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground in-[pre]:bg-transparent in-[pre]:p-0 in-[pre]:text-inherit"
      {...props}
    />
  ),
  hr: () => <hr className="my-4 border-border" />,
  table: (props: ComponentProps<"table">) => (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-start text-sm" {...props} />
    </div>
  ),
  thead: (props: ComponentProps<"thead">) => (
    <thead className="bg-muted/50" {...props} />
  ),
  th: (props: ComponentProps<"th">) => (
    <th
      className="px-4 py-3 text-start font-semibold text-foreground"
      {...props}
    />
  ),
  td: (props: ComponentProps<"td">) => (
    <td className="border-t px-4 py-3 align-top" {...props} />
  ),
}
