import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { useQuery } from "@tanstack/react-query"
import { Info, UserPlus } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useId, useState } from "react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"
import { GuideLink } from "@/components/guide-link"
import { PageHeader } from "@/components/page-header"
import { LoadError, RefreshNote } from "@/components/query-state"
import { useDelayed } from "@/hooks/use-delayed"
import { duration, ease } from "@/lib/motion"

import { isActive, nameOf } from "../../lib/team"
import { useRemoveMember } from "../../mutations/use-remove-member"
import { useSetStatus } from "../../mutations/use-set-status"
import { membersQuery } from "../../queries/team.queries"
import type { Member } from "../../schemas/team.schema"
import { MemberDialog } from "./member-dialog"
import { MemberRow } from "./member-row"
import { TeamSkeleton } from "./team-skeleton"

export function Team() {
  const { t } = useTranslation(["team", "common"])
  const members = useQuery(membersQuery())
  const skeleton = useDelayed(members.isPending)
  // rows rise in when they first arrive, not when cached data comes back
  const [enter] = useState(members.isPending)
  const [editing, setEditing] = useState<Member | "new" | null>(null)
  const [removing, setRemoving] = useState<Member | null>(null)
  const [added, setAdded] = useState<string | null>(null)
  const listId = useId()
  const setStatus = useSetStatus()
  const remove = useRemoveMember({
    onRemoved: () => {
      setRemoving(null)
    },
  })

  const list = members.data
  const held = list?.filter((member) => !isActive(member)).length ?? 0
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
        description={t("lead")}
        actions={list && list.length > 0 ? add : undefined}
      />

      {members.isError && !list ? (
        <LoadError
          title={t("errorTitle")}
          body={t("errorBody")}
          onRetry={() => void members.refetch()}
          retrying={members.isFetching}
        />
      ) : !list ? (
        skeleton && <TeamSkeleton />
      ) : list.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyBody")}
          action={
            <div className="flex flex-col items-center gap-3">
              {add}
              <GuideLink chapter="team" />
            </div>
          }
        />
      ) : (
        <section aria-labelledby={listId} className="flex flex-col gap-3">
          {members.isError && (
            <RefreshNote
              onRetry={() => void members.refetch()}
              retrying={members.isFetching}
            />
          )}
          <h2
            id={listId}
            className="flex flex-wrap items-center gap-x-2 text-sm font-normal text-muted-foreground tabular-nums"
          >
            <Count value={t("summary", { count: list.length })} />
            {held > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <Count value={t("onHoldCount", { count: held })} />
              </>
            )}
          </h2>
          <ul className="divide-y overflow-hidden rounded-lg border bg-card">
            <AnimatePresence initial={false}>
              {list.map((member, i) => (
                <m.li
                  key={member.id}
                  layout
                  initial={enter ? { opacity: 0, y: 6 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{
                    duration: duration.base,
                    ease,
                    delay: enter ? Math.min(i, 6) * 0.03 : 0,
                  }}
                  className="overflow-hidden"
                >
                  <MemberRow
                    member={member}
                    added={added !== null && member.email === added}
                    onEdit={() => {
                      setEditing(member)
                    }}
                    onStatus={(active) => {
                      setStatus(member, active)
                    }}
                    onRemove={() => {
                      setRemoving(member)
                    }}
                  />
                </m.li>
              ))}
            </AnimatePresence>
          </ul>
          {held > 0 && (
            <p className="flex items-start gap-2 text-sm text-pretty text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {t("holdNote")}
            </p>
          )}
        </section>
      )}

      {editing && (
        <MemberDialog
          member={editing === "new" ? null : editing}
          onClose={() => {
            setEditing(null)
          }}
          onSaved={(values) => {
            if (editing === "new") setAdded(values.email)
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => {
          if (!open) setRemoving(null)
        }}
        title={t("confirmTitle", {
          name: removing ? (nameOf(removing) ?? t("unnamed")) : "",
        })}
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

function Count({ value }: { value: string }) {
  return (
    <span className="relative inline-grid overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout">
        <m.span
          key={value}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: duration.base, ease }}
        >
          {value}
        </m.span>
      </AnimatePresence>
    </span>
  )
}
