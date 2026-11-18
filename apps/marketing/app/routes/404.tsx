import { NotFoundPage } from "@/layouts/not-found-page"
import { publishedByLocale } from "@/lib/page-data.server"
import seo from "@/locales/en/seo.json"

export const loader = () => ({ publishedByLocale: publishedByLocale() })

// prerendered to /404/index.html, which the server serves for every unknown URL
export const meta = () => [
  { title: seo.notFound.title },
  { name: "description", content: seo.notFound.description },
  { name: "robots", content: "noindex, follow" },
]

export default function NotFound() {
  return <NotFoundPage />
}
