import type { MetaArgs } from "react-router"

import { GlossaryPage, loadBody, TermPage } from "@/features/blog"
import { glossaryData, termData } from "@/lib/page-data.server"
import { glossaryMeta, termMeta } from "@/lib/seo/blog-pages-meta"

import type { Route } from "./+types/_site.$lang.blogs.glossary.($term)"

// one route for the list and its entries keeps the route manifest, which every page loads, small
export async function loader({ params }: Route.LoaderArgs) {
  if (!params.term) return glossaryData(params.lang)
  const data = termData(params.lang, params.term)
  await loadBody("glossary", data.term.lang, data.term.id)
  return data
}

export async function clientLoader({
  params,
  serverLoader,
}: Route.ClientLoaderArgs) {
  const [data] = await Promise.all([
    serverLoader(),
    params.term && loadBody("glossary", params.lang, params.term),
  ])
  return data
}

export const meta = (args: MetaArgs) =>
  args.params.term ? termMeta(args) : glossaryMeta(args)

export default function BlogGlossary({ loaderData }: Route.ComponentProps) {
  return "term" in loaderData ? (
    <TermPage term={loaderData.term} posts={loaderData.posts} />
  ) : (
    <GlossaryPage terms={loaderData.terms} />
  )
}
