import { AboutPage } from "@/features/about"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"

import type { Route } from "./+types/about"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "about")

export const meta = pageMeta("about")

export default AboutPage
