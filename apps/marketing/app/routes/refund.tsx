import { LEGAL_DOCS, LegalPage } from "@/features/legal"
import { pageData } from "@/lib/page-data.server"
import { PAGES } from "@/lib/pages"
import { pageMeta } from "@/lib/seo/page-meta"
import { webPageSchema } from "@/lib/seo/schema"

import type { Route } from "./+types/refund"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "refund")

export const meta = pageMeta("refund", ({ lang, t, path }) => [
  webPageSchema({
    lang,
    path,
    name: t("meta.name"),
    description: t("meta.schemaDescription"),
    dateModified: LEGAL_DOCS.legalRefund.updated,
  }),
])

export default function RefundRoute() {
  return <LegalPage ns="legalRefund" path={PAGES.refund.path} />
}
