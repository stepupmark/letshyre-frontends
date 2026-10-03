import { LegalPage } from "@/features/legal"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"

import type { Route } from "./+types/refund"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "refund")

export const meta = pageMeta("refund")

export default function RefundRoute() {
  return <LegalPage ns="legalRefund" />
}
