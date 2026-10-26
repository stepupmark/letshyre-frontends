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
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Ban,
  Ellipsis,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { CopyButton } from "@/components/copy-button"
import { TextField } from "@/components/text-field"

import { updateSharedLink } from "../services/share.service"
import { MAX_SHARE_DAYS, shareUrl, stateOf } from "../lib/share"
import { SHARED_LINKS_KEY } from "../queries/share.queries"
import { type SharedLink } from "../schemas/share.schema"

export function Actions({
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

export function EditLink({
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
