import { LEGAL_DOCS, LegalPage } from "@/features/legal"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"
import { webPageSchema } from "@/lib/seo/schema"

import type { Route } from "./+types/_site.$lang.privacy-policy"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "privacy")

export const meta = pageMeta("privacy", ({ lang, t, path }) => [
  webPageSchema({
    lang,
    path,
    name: t("meta.name"),
    description: t("meta.schemaDescription"),
    dateModified: LEGAL_DOCS.legalPolicy.updated,
  }),
])

export default function PrivacyRoute() {
  return <LegalPage ns="legalPolicy" />
}
