import { LEGAL_DOCS, LegalPage } from "@/features/legal"
import { pageData } from "@/lib/page-data.server"
import { readingFontPreload } from "@/lib/reading-font"
import { pageMeta } from "@/lib/seo/page-meta"
import { webPageSchema } from "@/lib/seo/schema"

import type { Route } from "./+types/_site.$lang.terms"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "terms")

export const links: Route.LinksFunction = () => [readingFontPreload]

export const meta = pageMeta("terms", ({ lang, t, path }) => [
  webPageSchema({
    lang,
    path,
    name: t("meta.name"),
    description: t("meta.schemaDescription"),
    dateModified: LEGAL_DOCS.legalTerms.updated,
  }),
])

export default function TermsRoute() {
  return <LegalPage ns="legalTerms" />
}
