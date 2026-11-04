import { useTranslation } from "@workspace/i18n/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { previewKey, templatesQuery } from "../queries/templates.queries"
import type { Template } from "../schemas/template.schema"
import { deleteTemplate } from "../services/templates.service"

export function useDeleteTemplate({ onDeleted }: { onDeleted: () => void }) {
  const { t } = useTranslation("invitations")
  const client = useQueryClient()
  return useMutation({
    mutationFn: (template: Template) => deleteTemplate(template.id),
    onSuccess: (_, template) => {
      client.setQueryData(templatesQuery().queryKey, (list) =>
        list?.filter((item) => item.id !== template.id)
      )
      client.removeQueries({ queryKey: previewKey(template.id) })
      toast.success(t("toast.deleted", { name: template.name }))
      onDeleted()
    },
    onError: () => {
      toast.error(t("toast.deleteFailed"))
    },
    onSettled: () =>
      client.invalidateQueries({ queryKey: templatesQuery().queryKey }),
  })
}
