import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
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
  topics: readonly Topic[]
  current?: Topic
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  if (topics.length < 2) return null

  const links = [
    { key: "all", label: t("index.all"), to: PAGES.blog.path, on: !current },
    ...topics.map((topic) => ({
      key: topic,
      label: t(`topics.${topic}`),
      to: topicPath(topic),
      on: topic === current,
    })),
  ]

  return (
    <nav aria-label={t("index.topics")} className="border-b">
      <Container>
        <ul className="mx-auto -mb-px flex w-fit max-w-full gap-6 overflow-x-auto">
          {links.map((link) => (
            <li key={link.key} className="shrink-0">
              <Link
                to={localePath(lang, link.to)}
                aria-current={link.on ? "page" : undefined}
                className="block rounded-sm border-b-2 border-transparent py-3 text-sm font-medium text-muted-foreground transition-colors duration-200 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:border-brand aria-[current=page]:text-brand-text motion-reduce:transition-none"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  )
}
