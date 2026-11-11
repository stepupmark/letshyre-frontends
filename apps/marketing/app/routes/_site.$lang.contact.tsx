import { ContactPage } from "@/features/contact"
import { pageData } from "@/lib/page-data.server"
import { readingFontPreload } from "@/lib/reading-font"
import { pageMeta } from "@/lib/seo/page-meta"
import { webPageSchema } from "@/lib/seo/schema"
import { SITE } from "@/lib/seo/site"

import type { Route } from "./+types/_site.$lang.contact"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "contact")

export const links: Route.LinksFunction = () => [readingFontPreload]

export const meta = pageMeta("contact", ({ lang, t, path }) => [
  {
    ...webPageSchema({
      type: "ContactPage",
      lang,
      path,
      name: t("meta.name"),
      description: t("meta.schemaDescription"),
    }),
    mainEntity: { "@id": `${SITE.url}/#organization` },
  },
])

export default ContactPage
