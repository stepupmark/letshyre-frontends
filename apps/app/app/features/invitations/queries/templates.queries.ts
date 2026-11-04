import { queryOptions } from "@tanstack/react-query"

import { listTemplates, previewTemplate } from "../services/templates.service"

const TEMPLATES_KEY = ["employer", "email-templates"] as const

export const templatesQuery = () =>
  queryOptions({
    queryKey: [...TEMPLATES_KEY, "list"],
    queryFn: listTemplates,
  })

export const previewKey = (id: string) =>
  [...TEMPLATES_KEY, "preview", id] as const

export const previewQuery = (id: string) =>
  queryOptions({
    queryKey: previewKey(id),
    queryFn: () => previewTemplate(id),
    staleTime: 5 * 60_000,
  })
