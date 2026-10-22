import { useTranslation } from "@workspace/i18n/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { undoToast } from "@/lib/undo-toast"

import { nameOf } from "../lib/team"
import { membersQuery } from "../queries/team.queries"
import type { Member } from "../schemas/team.schema"
import { updateMember } from "../services/team.service"

const statusOf = (active: boolean) => (active ? "Active" : "Hold")

export function useSetStatus() {
  const { t } = useTranslation(["team", "common"])
  const client = useQueryClient()
  const { queryKey } = membersQuery()
  const mutation = useMutation({
    mutationFn: ({ member, active }: { member: Member; active: boolean }) =>
      updateMember(member.id, { status: statusOf(active) }),
    onMutate: async ({ member, active }) => {
      await client.cancelQueries({ queryKey })
      const before = client.getQueryData(queryKey)
      client.setQueryData(queryKey, (list) =>
        list?.map((row) =>
          row.id === member.id ? { ...row, status: statusOf(active) } : row
        )
      )
      return { before }
    },
    onError: (_error, _change, context) => {
      if (context?.before) client.setQueryData(queryKey, context.before)
      toast.error(t("toast.statusFailed"))
    },
    onSettled: () => client.invalidateQueries({ queryKey }),
  })

  const setStatus = (member: Member, active: boolean, undoable = true) => {
    mutation.mutate(
      { member, active },
      {
        onSuccess: () => {
          if (!undoable) return
          const name = nameOf(member) ?? t("unnamed")
          undoToast(
            active ? t("toast.activated", { name }) : t("toast.held", { name }),
            t("common:undo"),
            () => {
              setStatus(member, !active, false)
            }
          )
        },
      }
    )
  }
  return setStatus
}
