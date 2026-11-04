import { AssistantLauncher } from "@/features/assistant"
import { HomeV3Page } from "@/features/home-v3"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"

import type { Route } from "./+types/_site.$lang.home-v3"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "homeV3")

export const meta = pageMeta("homeV3")

export default function HomeV3Route() {
  return (
    <>
      <HomeV3Page />
      <AssistantLauncher />
    </>
  )
}
