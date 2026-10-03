import { AboutPage } from "@/features/about"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"
import { webPageSchema } from "@/lib/seo/schema"

import type { Route } from "./+types/about"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "about")

export const meta = pageMeta("about", ({ lang, t, path }) => [
  webPageSchema({
    type: "AboutPage",
    lang,
    path,
    name: t("meta.name"),
    description: t("meta.schemaDescription"),
  }),
])

export default AboutPage
