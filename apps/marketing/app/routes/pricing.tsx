import { PricingPage, pricingJsonLd } from "@/features/pricing"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"

import type { Route } from "./+types/pricing"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "pricing")

export const meta = pageMeta("pricing", pricingJsonLd)

export default PricingPage
