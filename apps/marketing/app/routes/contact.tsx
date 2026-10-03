import { ContactPage } from "@/features/contact"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"
import { webPageSchema } from "@/lib/seo/schema"

import type { Route } from "./+types/contact"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "contact")

export const meta = pageMeta("contact", ({ lang, t, path }) => [
  webPageSchema({
    type: "ContactPage",
    lang,
    path,
    name: t("meta.name"),
    description: t("meta.schemaDescription"),
  }),
])

export default ContactPage
