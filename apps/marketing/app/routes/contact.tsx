import { ContactPage } from "@/features/contact"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"

import type { Route } from "./+types/contact"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "contact")

export const meta = pageMeta("contact")

export default ContactPage
