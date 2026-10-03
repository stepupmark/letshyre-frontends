import { LegalPage } from "@/features/legal"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"

import type { Route } from "./+types/privacy"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "privacy")

export const meta = pageMeta("privacy")

export default function PrivacyRoute() {
  return <LegalPage ns="legalPolicy" />
}
