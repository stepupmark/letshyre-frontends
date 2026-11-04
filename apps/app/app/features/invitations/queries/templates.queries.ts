import { queryOptions } from "@tanstack/react-query"

import {
  listTemplates,
  previewTemplate,
  type PreviewContext,
} from "../services/templates.service"

export const TEMPLATES_KEY = ["employer", "email-templates"] as const

export const templatesQuery = () =>
  queryOptions({
    queryKey: [...TEMPLATES_KEY, "list"],
    queryFn: listTemplates,
  })

export const previewKey = (id: string) =>
  [...TEMPLATES_KEY, "preview", id] as const

export const previewQuery = (id: string, context: PreviewContext) =>
  queryOptions({
    queryKey: [...previewKey(id), context],
    queryFn: () => previewTemplate(id, context),
    staleTime: 5 * 60_000,
  })
