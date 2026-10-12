import { zodResolver } from "@hookform/resolvers/zod"
import { HttpError } from "@workspace/api"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Ellipsis,
  Pause,
  Pencil,
  Play,
  Trash2,
  UserPlus,
  Wand2,
} from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useMemo, useState } from "react"
import { useForm, type FieldPath } from "react-hook-form"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { LoadError } from "@/components/query-state"
import { StatusBadge } from "@/components/status-badge"
import { PasswordField, TextField } from "@/components/text-field"
import { useDelayed } from "@/hooks/use-delayed"
import { checkOnBlur } from "@/lib/forms"
import { duration, ease } from "@/lib/motion"
import { undoToast } from "@/lib/undo-toast"

import { addMember, removeMember, updateMember } from "../services/team.service"
import { isActive } from "../lib/team"
import { membersQuery, TEAM_KEY } from "../queries/team.queries"
import { type Member } from "../schemas/team.schema"
import {
  generatePassword,
  makeMemberSchema,
  type MemberValues,
} from "../schemas/member-form.schema"

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

export function Team() {
  const { t } = useTranslation(["team", "common"])
  const queryClient = useQueryClient()
  const members = useQuery(membersQuery())
  const skeleton = useDelayed(members.isPending)
  const [editing, setEditing] = useState<Member | "new" | null>(null)
  const [removing, setRemoving] = useState<Member | null>(null)

  const setStatus = useMutation({
    mutationFn: ({ member, active }: { member: Member; active: boolean }) =>
      updateMember(member.id, { status: active ? "Active" : "Hold" }),
    onMutate: ({ member, active }) => {
      queryClient.setQueryData(membersQuery().queryKey, (list) =>
        list?.map((row) =>
          row.id === member.id
            ? { ...row, status: active ? "Active" : "Hold" }
            : row
        )
      )
    },
    onSuccess: (_, { member, active }) => {
      undoToast(
        active
          ? t("toast.activated", { name: member.full_name })
          : t("toast.held", { name: member.full_name }),
        t("common:undo"),
        () => {
          setStatus.mutate({ member, active: !active })
        }
      )
    },
    onError: () => {
      toast.error(t("toast.statusFailed"))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: TEAM_KEY }),
  })

  const remove = useMutation({
    mutationFn: (member: Member) => removeMember(member.id),
    onSuccess: (_, member) => {
      setRemoving(null)
      toast.success(t("toast.removed", { name: member.full_name }))
    },
    onError: () => {
      toast.error(t("toast.removeFailed"))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: TEAM_KEY }),
  })

  const list = members.data
  const add = (
    <Button
      onClick={() => {
        setEditing("new")
      }}
    >
      <UserPlus />
      {t("add")}
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("title")}
        description={list ? t("count", { count: list.length }) : t("lead")}
        actions={list && list.length > 0 ? add : undefined}
      />

      {members.isError && !list ? (
        <LoadError
          onRetry={() => void members.refetch()}
          retrying={members.isRefetching}
        />
      ) : !list ? (
        skeleton && (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        )
      ) : list.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyBody")}
          action={add}
        />
      ) : (
        <ul className="divide-y rounded-lg border">
          <AnimatePresence initial={false}>
            {list.map((member) => (
              <m.li
                key={member.id}
                layout
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: duration.base, ease }}
                className="flex items-center gap-3 overflow-hidden p-4"
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium"
                >
                  {initials(member.full_name ?? member.email ?? "?")}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">
                    {member.full_name ?? "—"}
                  </span>
                  <span className="truncate text-sm text-muted-foreground">
                    {[member.email, member.title].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <StatusBadge tone={isActive(member) ? "success" : "warning"}>
                  {isActive(member) ? t("active") : t("onHold")}
                </StatusBadge>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t("actions", { name: member.full_name })}
                      />
                    }
                  >
                    <Ellipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditing(member)
                      }}
                    >
                      <Pencil />
                      {t("edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setStatus.mutate({ member, active: !isActive(member) })
                      }}
                    >
                      {isActive(member) ? <Pause /> : <Play />}
                      {isActive(member) ? t("hold") : t("activate")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => {
                        setRemoving(member)
                      }}
                    >
                      <Trash2 />
                      {t("remove")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <p className="text-sm text-muted-foreground">{t("holdNote")}</p>

      {editing && (
        <MemberDialog
          member={editing === "new" ? null : editing}
          onClose={() => {
            setEditing(null)
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => {
          if (!open) setRemoving(null)
        }}
        title={t("confirmTitle", { name: removing?.full_name })}
        description={t("confirmBody")}
        confirmLabel={t("remove")}
        destructive
        pending={remove.isPending}
        onConfirm={() => {
          if (removing) remove.mutate(removing)
        }}
      />
    </div>
  )
}

const SERVER_FIELDS: FieldPath<MemberValues>[] = [
  "full_name",
  "email",
  "password",
]

function MemberDialog({
  member,
  onClose,
}: {
  member: Member | null
  onClose: () => void
}) {
  const { t } = useTranslation(["team", "common"])
  const queryClient = useQueryClient()
  const isNew = member === null
  const schema = useMemo(
    () =>
      makeMemberSchema(
        {
          name: t("errors.name"),
          email: t("errors.email"),
          password: t("errors.password"),
        },
        { isNew }
      ),
    [t, isNew]
  )
  const form = useForm<MemberValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: member?.full_name ?? "",
      email: member?.email ?? "",
      password: "",
    },
    mode: "onSubmit",
  })
  const errors = form.formState.errors

  const save = useMutation({
    mutationFn: (values: MemberValues) =>
      member
        ? updateMember(member.id, {
            full_name: values.full_name,
            email: values.email,
          })
        : addMember(values),
    onSuccess: (_, values) => {
      toast.success(
        isNew
          ? t("toast.added", { name: values.full_name })
          : t("toast.updated", { name: values.full_name })
      )
      onClose()
    },
    onError: (error) => {
      const fields = error instanceof HttpError ? error.fieldErrors : undefined
      let placed = false
      for (const name of SERVER_FIELDS) {
        const message = fields?.[name]
        if (!message) continue
        form.setError(name, { message })
        placed = true
      }
      if (!placed)
        toast.error(
          error instanceof HttpError && error.backendMessage
            ? error.backendMessage
            : t("toast.saveFailed")
        )
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: TEAM_KEY }),
  })

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent>
        <form
          noValidate
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            void form.handleSubmit((values) => {
              save.mutate(values)
            })(event)
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {isNew ? t("dialog.addTitle") : t("dialog.editTitle")}
            </DialogTitle>
            <DialogDescription>
              {isNew ? t("dialog.addLead") : t("dialog.editLead")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-5">
            <TextField
              label={t("dialog.name")}
              autoComplete="off"
              error={errors.full_name?.message}
              {...checkOnBlur(form, "full_name")}
            />
            <TextField
              label={t("dialog.email")}
              type="email"
              inputMode="email"
              autoComplete="off"
              error={errors.email?.message}
              {...checkOnBlur(form, "email")}
            />
            {isNew && (
              <PasswordField
                label={t("dialog.password")}
                autoComplete="new-password"
                hint={t("dialog.passwordHint")}
                error={errors.password?.message}
                labelAside={
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto px-0"
                    onClick={() => {
                      form.setValue("password", generatePassword(), {
                        shouldValidate: true,
                      })
                    }}
                  >
                    <Wand2 />
                    {t("dialog.generate")}
                  </Button>
                }
                {...checkOnBlur(form, "password")}
              />
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t("common:confirm.cancel")}
            </DialogClose>
            <Button type="submit" disabled={save.isPending}>
              {isNew ? t("dialog.add") : t("dialog.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
