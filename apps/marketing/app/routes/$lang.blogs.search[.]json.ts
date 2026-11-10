import { searchIndexData } from "@/lib/page-data.server"

import type { Route } from "./+types/$lang.blogs.search[.]json"

export const loader = ({ params }: Route.LoaderArgs) =>
  Response.json(searchIndexData(params.lang))
