import { useTranslation } from "@workspace/i18n/react"
import { ChevronDownIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { TocLinks } from "@/components/guide/guide-toc"
import { useActiveSection } from "@/hooks/use-active-section"
import type { Heading } from "@/lib/blog/post"

// useActiveSection names the first heading before it's reached; the bar shouldn't
function useReachedFirst(id: string | undefined) {
  const [reached, setReached] = useState(false)

  useEffect(() => {
    const heading = id && document.getElementById(id)
    if (!heading) return
    // a scroll check, since a fast fling can carry the heading past an observer's line unseen
    const update = () => {
      setReached(heading.getBoundingClientRect().top < window.innerHeight / 3)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => {
      window.removeEventListener("scroll", update)
    }
  }, [id])

  return reached
}

export function PostToc({ headings }: { headings: readonly Heading[] }) {
  const { t } = useTranslation("blog")
  const active = useActiveSection(headings.map((heading) => heading.id))
  const details = useRef<HTMLDetailsElement>(null)
  const started = useReachedFirst(headings[0]?.id)
  const current = started
    ? headings.find((heading) => heading.id === active)
    : undefined

  // a jump closes the list so the section isn't hidden under it
  useEffect(() => {
    const close = () => details.current?.removeAttribute("open")
    window.addEventListener("hashchange", close)
    return () => {
      window.removeEventListener("hashchange", close)
    }
  }, [])
  const groups = [
    {
      items: headings.map((heading) => ({
        anchor: heading.id,
        label: heading.text,
      })),
    },
  ]

  return (
    <>
      <nav
        aria-label={t("post.toc")}
        className="sticky top-16 z-30 -mx-4 border-b bg-background px-4 py-2 sm:-mx-6 sm:px-6 lg:hidden"
      >
        <details ref={details} className="group">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md py-1.5 text-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
            <span className="shrink-0 font-medium">{t("post.toc")}</span>
            {current && (
              <span className="min-w-0 truncate text-muted-foreground">
                {current.text}
              </span>
            )}
            <ChevronDownIcon
              aria-hidden
              className="ms-auto size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none"
            />
          </summary>
          <div className="mt-2 max-h-80 overflow-y-auto border-t pt-2">
            <TocLinks groups={groups} active={active} />
          </div>
        </details>
      </nav>
      <nav
        aria-label={t("post.toc")}
        className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
      >
        <p className="px-2 text-sm font-medium">{t("post.toc")}</p>
        <div className="mt-3">
          <TocLinks groups={groups} active={active} />
        </div>
      </nav>
    </>
  )
}
