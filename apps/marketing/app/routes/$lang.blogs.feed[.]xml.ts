import { feedXml } from "@/lib/page-data.server"

import type { Route } from "./+types/$lang.blogs.feed[.]xml"

export const loader = ({ params }: Route.LoaderArgs) =>
  new Response(feedXml(params.lang), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  })
