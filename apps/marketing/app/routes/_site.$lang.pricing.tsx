import { PricingPage, pricingJsonLd } from "@/features/pricing"
import { pageData } from "@/lib/page-data.server"
import { readingFontPreload } from "@/lib/reading-font"
import { pageMeta } from "@/lib/seo/page-meta"

import type { Route } from "./+types/_site.$lang.pricing"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "pricing")

export const links: Route.LinksFunction = () => [readingFontPreload]

export const meta = pageMeta("pricing", pricingJsonLd)

export default PricingPage
