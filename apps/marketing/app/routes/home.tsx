import { AssistantLauncher } from "@/features/assistant"
import { HomePage, homeJsonLd } from "@/features/home"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"

import type { Route } from "./+types/home"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "home")

export const meta = pageMeta("home", homeJsonLd)

export default function HomeRoute() {
  return (
    <>
      <HomePage />
      <AssistantLauncher />
    </>
  )
}
