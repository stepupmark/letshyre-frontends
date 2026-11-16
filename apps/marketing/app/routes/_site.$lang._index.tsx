import { AssistantLauncher } from "@/features/assistant"
import { homeJsonLd } from "@/features/home"
import { HomeV3Page } from "@/features/home-v3"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"

import type { Route } from "./+types/_site.$lang._index"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "home")

export const meta = pageMeta("home", homeJsonLd)

export default function HomeRoute() {
  return (
    <>
      <HomeV3Page />
      <AssistantLauncher />
    </>
  )
}
