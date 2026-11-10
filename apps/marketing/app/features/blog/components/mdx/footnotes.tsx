import { useTranslation } from "@workspace/i18n/react"
import { ArrowUpIcon } from "lucide-react"
import {
  Children,
  type ComponentProps,
  isValidElement,
  type ReactNode,
  useId,
} from "react"

/**
 * remark-gfm's `[^1]`, as a number that opens the note beside the text. The note itself stays in
 * the list at the end, so this copies it in when opened.
 */
export function FootnoteRef({
  href = "",
  id: refId,
  children,
}: ComponentProps<"a">) {
  const { t } = useTranslation("blog")
  const id = useId()
  const noteId = decodeURIComponent(href.slice(1))

  return (
    <>
      <button
        id={refId}
        type="button"
        popoverTarget={id}
        aria-label={t("post.footnote", { n: children as ReactNode })}
        style={{ anchorName: `--fn${id.replace(/\W/g, "")}` }}
        className="mx-0.5 rounded-sm px-0.5 font-medium text-brand-text outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {children}
      </button>
      <span
        id={id}
        popover="auto"
        role="note"
        onToggle={(event) => {
          const note = document.getElementById(noteId)
          if (event.newState !== "open" || !note) return
          const copy = note.cloneNode(true) as HTMLElement
          copy.querySelectorAll("[data-footnote-backref]").forEach((el) => {
            el.remove()
          })
          event.currentTarget.replaceChildren(...copy.childNodes)
        }}
        style={{ positionAnchor: `--fn${id.replace(/\W/g, "")}` }}
        className="max-w-xs rounded-lg border bg-popover p-3 text-sm text-pretty text-popover-foreground [position-area:bottom] [position-try-fallbacks:flip-block] *:inline supports-[position-area:bottom]:inset-auto supports-[position-area:bottom]:m-0 supports-[position-area:bottom]:mt-2 supports-[position-area:bottom]:[justify-self:anchor-center]"
      />
    </>
  )
}

export function FootnoteBack({ href }: { href: string }) {
  const { t } = useTranslation("blog")
  return (
    <a
      href={href}
      data-footnote-backref
      aria-label={t("post.backToText")}
      className="text-link ms-1"
    >
      <ArrowUpIcon aria-hidden className="inline size-3.5" />
    </a>
  )
}

/** The notes at the end of a post, under a heading in the post's language. */
export function Footnotes({ children, ...props }: ComponentProps<"section">) {
  const { t } = useTranslation("blog")
  const list = Children.toArray(children).filter(
    (child) =>
      !(
        isValidElement<{ id?: string }>(child) &&
        child.props.id === "footnote-label"
      )
  )

  return (
    <section
      {...props}
      className="mt-6 flex flex-col gap-3 border-t pt-6 text-sm text-muted-foreground [&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-2 [&_ol]:ps-5"
    >
      <h2
        id="footnote-label"
        className="text-base font-semibold text-foreground"
      >
        {t("post.footnotes")}
      </h2>
      {list}
    </section>
  )
}
