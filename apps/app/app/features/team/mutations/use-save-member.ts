import { HttpError } from "@workspace/api"
import { useTranslation } from "@workspace/i18n/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { FieldPath, UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

import { TEAM_KEY } from "../queries/team.queries"
import type { MemberValues } from "../schemas/member-form.schema"
import type { Member } from "../schemas/team.schema"
import { addMember, updateMember } from "../services/team.service"

const SERVER_FIELDS: FieldPath<MemberValues>[] = [
  "full_name",
  "email",
  "password",
]

export function useSaveMember({
  member,
  form,
  onSaved,
}: {
  member: Member | null
  form: UseFormReturn<MemberValues>
  onSaved: (values: MemberValues) => void
}) {
  const { t } = useTranslation("team")
  const client = useQueryClient()
  return useMutation({
    mutationFn: (values: MemberValues) =>
      member
        ? updateMember(member.id, {
            full_name: values.full_name,
            email: values.email,
          })
        : addMember(values),
    onSuccess: (_, values) => {
      toast.success(
        member
          ? t("toast.updated", { name: values.full_name })
          : t("toast.added", { name: values.full_name })
      )
      onSaved(values)
    },
    onError: (error) => {
      const fields = error instanceof HttpError ? error.fieldErrors : undefined
      let placed = false
      for (const name of SERVER_FIELDS) {
        const message = fields?.[name]
        if (!message) continue
        form.setError(name, { message }, { shouldFocus: !placed })
        placed = true
      }
      if (!placed)
        toast.error(
          error instanceof HttpError && error.backendMessage
            ? error.backendMessage
            : t("toast.saveFailed")
        )
    },
    onSettled: () => client.invalidateQueries({ queryKey: TEAM_KEY }),
  })
}
