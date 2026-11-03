import { AssistantLauncher } from "@/features/assistant"
import { HomeV2Page } from "@/features/home"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"

import type { Route } from "./+types/_site.$lang.home-v2"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "homeV2")

export const meta = pageMeta("homeV2")

export default function HomeV2Route() {
  return (
    <>
      <HomeV2Page />
      <AssistantLauncher />
    </>
  )
}
