import { useTranslation } from "@workspace/i18n/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { templatesQuery } from "../queries/templates.queries"
import type { Template } from "../schemas/template.schema"
import { copyTemplate } from "../services/templates.service"

export function useCopyTemplate({
  onCopied,
}: {
  onCopied: (template: Template) => void
}) {
  const { t } = useTranslation("invitations")
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ source, name }: { source: Template; name: string }) =>
      copyTemplate(source.id, name),
    onSuccess: (template) => {
      client.setQueryData(templatesQuery().queryKey, (list) =>
        list ? [template, ...list] : list
      )
      void client.invalidateQueries({ queryKey: templatesQuery().queryKey })
      toast.success(t("toast.copied", { name: template.name }))
      onCopied(template)
    },
    onError: () => {
      toast.error(t("toast.copyFailed"))
    },
  })
}
