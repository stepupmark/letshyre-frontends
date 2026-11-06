import { useLocale, useTranslation } from "@workspace/i18n/react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { href, useSearchParams } from "react-router"
import { toast } from "sonner"
import { readTableParams, writeTableParams } from "@workspace/api/table-params"

import { AppLink } from "@/components/app-link"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { DataTable } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { StatusBadge, type Tone } from "@/components/status-badge"
import { buttonLink } from "@/lib/button-link"
import type { DataTableColumn } from "@/lib/data-table-features"
import { undoToast } from "@/lib/undo-toast"

import {
  useDeleteSharedLink,
  useSetLinkActive,
} from "../mutations/use-shared-links"
import { stateOf } from "../lib/share"
import { sharedLinksQuery } from "../queries/share.queries"
import { type LinkState } from "../types"
import { type SharedLink } from "../schemas/share.schema"
import { Actions, EditLink } from "./shared-link-actions"

const TONE: Record<LinkState, Tone> = {
  active: "success",
  revoked: "neutral",
  expired: "warning",
  used: "warning",
}

const rowId = (row: SharedLink) => row.id

export function SharedLinks() {
  const { t } = useTranslation(["candidate", "common"])
  const locale = useLocale()
  const [search, setSearch] = useSearchParams()
  const table = readTableParams(search, { sortable: [] })
  const query = useQuery({
    ...sharedLinksQuery(table.page),
    placeholderData: keepPreviousData,
  })
  const [editing, setEditing] = useState<SharedLink | null>(null)
  const [deleting, setDeleting] = useState<SharedLink | null>(null)

  const setActive = useSetLinkActive(table.page, {
    onDone: (link, active) => {
      if (active) return
      undoToast(
        t("links.revoked", { name: link.candidate_name }),
        t("common:undo"),
        () => {
          setActive.mutate({ link, active: true })
        }
      )
    },
    onFailed: () => {
      toast.error(t("links.failed"))
    },
  })

  const remove = useDeleteSharedLink({
    onDeleted: () => {
      setDeleting(null)
      toast.success(t("links.deleted"))
    },
    onFailed: () => {
      toast.error(t("links.failed"))
    },
  })

  const toggle = setActive.mutate
  const columns = useMemo<DataTableColumn<SharedLink>[]>(() => {
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" })
    return [
      {
        id: "candidate",
        header: t("links.columns.candidate"),
        enableHiding: false,
        cell: ({ row }) => <Who link={row.original} />,
      },
      {
        id: "job",
        header: t("links.columns.job"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.matched_job_title ?? "—"}
          </span>
        ),
      },
      {
        id: "views",
        header: t("links.columns.views"),
        cell: ({ row }) => (
          <span className="tabular-nums">
            {t("links.views", {
              count: row.original.view_count,
              max: row.original.max_views ?? "∞",
            })}
          </span>
        ),
      },
      {
        id: "expires",
        header: t("links.columns.expires"),
        cell: ({ row }) => {
          const when = row.original.expires_at
            ? new Date(row.original.expires_at)
            : null
          return when && !Number.isNaN(when.getTime()) ? date.format(when) : "—"
        },
      },
      {
        id: "status",
        header: t("links.columns.status"),
        cell: ({ row }) => {
          const state = stateOf(row.original)
          return (
            <StatusBadge tone={TONE[state]}>
              {t(`links.state.${state}`)}
            </StatusBadge>
          )
        },
      },
      {
        id: "actions",
        header: () => (
          <span className="sr-only">{t("links.columns.actions")}</span>
        ),
        enableHiding: false,
        cell: ({ row }) => (
          <Actions
            link={row.original}
            onEdit={setEditing}
            onDelete={setDeleting}
            onActive={(link, active) => {
              toggle({ link, active })
            }}
          />
        ),
      },
    ]
  }, [t, locale, toggle, setEditing, setDeleting])

  return (
    <>
      <DataTable
        columns={columns}
        data={query.data?.results}
        total={query.data?.count ?? query.data?.results.length ?? 0}
        pageCount={query.data?.total_pages ?? undefined}
        getRowId={rowId}
        rowLabel={(row) => row.candidate_name ?? row.id}
        label={t("links.title")}
        params={table}
        onParams={(next) => {
          setSearch((prev) => writeTableParams(prev, next), {
            preventScrollReset: true,
          })
        }}
        pending={query.isFetching}
        error={query.isError}
        onRetry={() => void query.refetch()}
        empty={
          <EmptyState
            title={t("links.emptyTitle")}
            description={t("links.emptyBody")}
            action={
              <AppLink
                to={href("/employer/candidates/unlocked")}
                className={buttonLink({ variant: "outline" })}
              >
                {t("links.toUnlocked")}
              </AppLink>
            }
          />
        }
        mobileRow={(row) => {
          const state = stateOf(row)
          return (
            <div className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <Who link={row} />
                <StatusBadge tone={TONE[state]}>
                  {t(`links.state.${state}`)}
                </StatusBadge>
              </div>
              <Actions
                link={row}
                onEdit={setEditing}
                onDelete={setDeleting}
                onActive={(link, active) => {
                  setActive.mutate({ link, active })
                }}
              />
            </div>
          )
        }}
      />

      {editing && (
        <EditLink
          link={editing}
          onClose={() => {
            setEditing(null)
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title={t("links.deleteTitle")}
        description={t("links.deleteBody", {
          name: deleting?.candidate_name,
        })}
        confirmLabel={t("links.delete")}
        destructive
        pending={remove.isPending}
        onConfirm={() => {
          if (deleting) remove.mutate(deleting)
        }}
      />
    </>
  )
}

function Who({ link }: { link: SharedLink }) {
  return (
    <span className="flex min-w-0 flex-col">
      <span className="truncate font-medium">{link.candidate_name ?? "—"}</span>
      {link.candidate_role && (
        <span className="truncate text-xs text-muted-foreground">
          {link.candidate_role}
        </span>
      )}
    </span>
  )
}
