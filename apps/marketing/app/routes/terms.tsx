import { LegalPage } from "@/features/legal"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"

import type { Route } from "./+types/terms"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "terms")

export const meta = pageMeta("terms")

export default function TermsRoute() {
  return <LegalPage ns="legalTerms" />
}
