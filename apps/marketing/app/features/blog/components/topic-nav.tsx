import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { useEffect, useRef } from "react"
import { Link } from "react-router"

import { Container } from "@/components/section"
import { topicPath } from "@/lib/blog/paths"
import type { Topic } from "@/lib/blog/post"
import { PAGES } from "@/lib/pages"

/** Shown once posts cover two topics; with one, "All" and that topic list the same posts. */
export function TopicNav({
  topics,
  current,
}: {
  topics: readonly { topic: Topic; count: number }[]
  current?: Topic
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const list = useRef<HTMLUListElement>(null)

  // on a phone the tabs scroll; keep the current one in view
  useEffect(() => {
    const active = list.current?.querySelector<HTMLElement>("[aria-current]")
    const box = list.current
    if (!active || !box || box.scrollWidth <= box.clientWidth) return
    box.scrollLeft +=
      active.getBoundingClientRect().left -
      box.getBoundingClientRect().left -
      (box.clientWidth - active.offsetWidth) / 2
  }, [current])

  if (topics.length < 2) return null

  const links = [
    {
      key: "all",
      label: t("index.all"),
      count: topics.reduce((sum, { count }) => sum + count, 0),
      to: PAGES.blog.path,
      on: !current,
    },
    ...topics.map(({ topic, count }) => ({
      key: topic,
      label: t(`topics.${topic}`),
      count,
      to: topicPath(topic),
      on: topic === current,
    })),
  ]

  return (
    <nav
      aria-label={t("index.topics")}
      className="relative -mt-px border-b bg-brand-muted print:hidden"
    >
      <Container>
        <ul
          ref={list}
          className="-mx-4 -mb-px flex scrollbar-none gap-1 overflow-x-auto px-4 sm:mx-auto sm:w-fit sm:max-w-full sm:px-0"
        >
          {links.map((link) => (
            <li key={link.key} className="shrink-0">
              <Link
                to={localePath(lang, link.to)}
                aria-current={link.on ? "page" : undefined}
                className="flex items-center gap-2 rounded-t-lg border border-b-0 border-transparent px-4 pt-2.5 pb-3 text-sm font-medium text-foreground/75 transition-colors duration-200 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset aria-[current=page]:border-border aria-[current=page]:bg-background aria-[current=page]:text-brand-text motion-reduce:transition-none"
              >
                {link.label}
                <span className="text-xs text-foreground/75 tabular-nums">
                  {link.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  )
}
