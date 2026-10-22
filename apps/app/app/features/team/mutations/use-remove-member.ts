import { useTranslation } from "@workspace/i18n/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { nameOf } from "../lib/team"
import { TEAM_KEY } from "../queries/team.queries"
import type { Member } from "../schemas/team.schema"
import { removeMember } from "../services/team.service"

export function useRemoveMember({ onRemoved }: { onRemoved: () => void }) {
  const { t } = useTranslation("team")
  const client = useQueryClient()
  return useMutation({
    mutationFn: (member: Member) => removeMember(member.id),
    onSuccess: (_, member) => {
      onRemoved()
      toast.success(
        t("toast.removed", { name: nameOf(member) ?? t("unnamed") })
      )
    },
    onError: () => {
      toast.error(t("toast.removeFailed"))
    },
    onSettled: () => client.invalidateQueries({ queryKey: TEAM_KEY }),
  })
}
