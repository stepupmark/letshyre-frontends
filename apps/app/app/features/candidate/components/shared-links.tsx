import { useLocale, useTranslation } from "@workspace/i18n/react"
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
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  Ban,
  Ellipsis,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
} from "lucide-react"
import { useMemo, useState } from "react"
import { href, useSearchParams } from "react-router"
import { toast } from "sonner"

import { AppLink } from "@/components/app-link"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { CopyButton } from "@/components/copy-button"
import { DataTable } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { StatusBadge, type Tone } from "@/components/status-badge"
import { TextField } from "@/components/text-field"
import { buttonLink } from "@/lib/button-link"
import type { DataTableColumn } from "@/lib/data-table-features"
import { readTableParams, writeTableParams } from "@workspace/api/table-params"
import { undoToast } from "@/lib/undo-toast"

import { deleteSharedLink, updateSharedLink } from "../services/share.service"
import { MAX_SHARE_DAYS, shareUrl, stateOf } from "../lib/share"
import { SHARED_LINKS_KEY, sharedLinksQuery } from "../queries/share.queries"
import { type LinkState } from "../types"
import { type SharedLink } from "../schemas/share.schema"

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
  const queryClient = useQueryClient()
  const [search, setSearch] = useSearchParams()
  const table = readTableParams(search, { sortable: [] })
  const query = useQuery({
    ...sharedLinksQuery(table.page),
    placeholderData: keepPreviousData,
  })
  const [editing, setEditing] = useState<SharedLink | null>(null)
  const [deleting, setDeleting] = useState<SharedLink | null>(null)
  const key = sharedLinksQuery(table.page).queryKey

  const setActive = useMutation({
    mutationFn: ({ link, active }: { link: SharedLink; active: boolean }) =>
      updateSharedLink(link.id, { is_active: active }),
    onMutate: ({ link, active }) => {
      queryClient.setQueryData(key, (page) =>
        page
          ? {
              ...page,
              results: page.results.map((row) =>
                row.id === link.id ? { ...row, is_active: active } : row
              ),
            }
          : page
      )
    },
    onSuccess: (_, { link, active }) => {
      if (active) return
      undoToast(
        t("links.revoked", { name: link.candidate_name }),
        t("common:undo"),
        () => {
          setActive.mutate({ link, active: true })
        }
      )
    },
    onError: () => {
      toast.error(t("links.failed"))
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: SHARED_LINKS_KEY }),
  })

  const remove = useMutation({
    mutationFn: (link: SharedLink) => deleteSharedLink(link.id),
    onSuccess: () => {
      setDeleting(null)
      toast.success(t("links.deleted"))
    },
    onError: () => {
      toast.error(t("links.failed"))
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: SHARED_LINKS_KEY }),
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
        header: "",
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

function Actions({
  link,
  onEdit,
  onDelete,
  onActive,
}: {
  link: SharedLink
  onEdit: (link: SharedLink) => void
  onDelete: (link: SharedLink) => void
  onActive: (link: SharedLink, active: boolean) => void
}) {
  const { t } = useTranslation("candidate")
  const url = shareUrl(link)
  const state = stateOf(link)
  return (
    <span className="flex items-center gap-2">
      {url && state === "active" && (
        <CopyButton value={url} label={t("share.copy")} />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("links.actions", { name: link.candidate_name })}
            />
          }
        >
          <Ellipsis />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              onEdit(link)
            }}
          >
            <SlidersHorizontal />
            {t("links.edit")}
          </DropdownMenuItem>
          {link.is_active ? (
            <DropdownMenuItem
              onClick={() => {
                onActive(link, false)
              }}
            >
              <Ban />
              {t("links.revoke")}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => {
                onActive(link, true)
              }}
            >
              <RotateCcw />
              {t("links.restore")}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              onDelete(link)
            }}
          >
            <Trash2 />
            {t("links.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  )
}

function EditLink({
  link,
  onClose,
}: {
  link: SharedLink
  onClose: () => void
}) {
  const { t } = useTranslation(["candidate", "common"])
  const queryClient = useQueryClient()
  const [days, setDays] = useState("0")
  const [views, setViews] = useState(String(link.max_views ?? 20))
  const [errors, setErrors] = useState<{ days?: string; views?: string }>({})

  const save = useMutation({
    mutationFn: () =>
      updateSharedLink(link.id, {
        extend_expiry_days: Number(days),
        max_views: Number(views),
      }),
    onSuccess: () => {
      toast.success(t("links.saved"))
      onClose()
    },
    onError: () => {
      toast.error(t("links.failed"))
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: SHARED_LINKS_KEY }),
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
            event.preventDefault()
            const next = {
              days:
                /^\d+$/.test(days.trim()) && Number(days) <= MAX_SHARE_DAYS
                  ? undefined
                  : t("links.errors.days", { max: MAX_SHARE_DAYS }),
              views:
                /^\d+$/.test(views.trim()) &&
                Number(views) >= Math.max(1, link.view_count)
                  ? undefined
                  : t("links.errors.views", {
                      min: Math.max(1, link.view_count),
                    }),
            }
            setErrors(next)
            if (!next.days && !next.views) save.mutate()
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {t("links.editTitle", { name: link.candidate_name })}
            </DialogTitle>
            <DialogDescription>{t("links.editLead")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label={t("links.extend")}
              hint={t("links.extendHint", { max: MAX_SHARE_DAYS })}
              inputMode="numeric"
              value={days}
              error={errors.days}
              onChange={(event) => {
                setDays(event.target.value)
              }}
            />
            <TextField
              label={t("share.views")}
              hint={t("links.viewsHint", { count: link.view_count })}
              inputMode="numeric"
              value={views}
              error={errors.views}
              onChange={(event) => {
                setViews(event.target.value)
              }}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t("common:confirm.cancel")}
            </DialogClose>
            <Button type="submit" disabled={save.isPending}>
              {t("links.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
