import serifLatin from "@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2?url"
import scriptLatin from "@fontsource/ms-madi/files/ms-madi-latin-400-normal.woff2?url"

import { AssistantLauncher } from "@/features/assistant"
import { HomePage, homeJsonLd } from "@/features/home"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"

import type { Route } from "./+types/_site.$lang._index"

export const links: Route.LinksFunction = () =>
  [serifLatin, scriptLatin].map((href) => ({
    rel: "preload",
    href,
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous" as const,
  }))

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
