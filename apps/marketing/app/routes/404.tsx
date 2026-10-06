import { I18nProvider } from "@workspace/i18n/react"

import { RouteError } from "@/components/route-error"
import common from "@/locales/en/common.json"
import seo from "@/locales/en/seo.json"

// prerendered to /404/index.html, which the server serves for every unknown URL
export const meta = () => [
  { title: seo.notFound.title },
  { name: "description", content: seo.notFound.description },
  { name: "robots", content: "noindex, follow" },
]

const notFound = {
  status: 404,
  statusText: "Not Found",
  internal: false,
  data: null,
}

export default function NotFound() {
  return (
    <I18nProvider lang="en" messages={{ en: { common } }}>
      <main id="main">
        <RouteError error={notFound} />
      </main>
    </I18nProvider>
  )
}
