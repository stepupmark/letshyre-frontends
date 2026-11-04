import { HttpError } from "@workspace/api"
import { useTranslation } from "@workspace/i18n/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

import { previewKey, templatesQuery } from "../queries/templates.queries"
import type { TemplateValues } from "../schemas/template-form.schema"
import type { Template } from "../schemas/template.schema"
import {
  updateTemplate,
  type TemplateChanges,
} from "../services/templates.service"

const FORM_FIELD = {
  name: "name",
  subject_template: "subject",
  body_html_template: "body",
} as const

export function useUpdateTemplate({
  form,
  onSaved,
}: {
  form: UseFormReturn<TemplateValues>
  onSaved: (template: Template) => void
}) {
  const { t } = useTranslation("invitations")
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: TemplateChanges }) =>
      updateTemplate(id, changes),
    onSuccess: (template) => {
      client.setQueryData(templatesQuery().queryKey, (list) =>
        list?.map((item) => (item.id === template.id ? template : item))
      )
      client.removeQueries({ queryKey: previewKey(template.id) })
      toast.success(t("toast.saved"))
      onSaved(template)
    },
    onError: (error) => {
      const fields = error instanceof HttpError ? error.fieldErrors : undefined
      let shown = false
      for (const [field, message] of Object.entries(fields ?? {})) {
        if (field in FORM_FIELD) {
          form.setError(FORM_FIELD[field as keyof typeof FORM_FIELD], {
            message,
          })
          shown = true
        }
      }
      if (!shown) toast.error(t("toast.saveFailed"))
    },
  })
}
