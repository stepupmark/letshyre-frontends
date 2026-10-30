import { safeUrl } from "@workspace/api"
import { useTranslation } from "@workspace/i18n/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import type { ReactNode } from "react"

import { initials } from "../lib/result"
import type { SearchResult } from "../schemas/candidate-search.schema"

export function UnlockDialog({
  row,
  open,
  onClose,
  children,
}: {
  row: SearchResult | undefined
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  const { t } = useTranslation("candidateSearch")
  const name = row?.candidate_name?.trim()
    ? row.candidate_name.trim()
    : t("card.unnamed")
  const photo = safeUrl(row?.candidate_profile_photo)
  const role = row?.interviewed_role ?? row?.current_role

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="flex max-h-[min(85dvh,44rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="flex-row items-center gap-3 border-b bg-brand-muted/40 p-4 pe-12 text-start">
          <Avatar className="size-11 ring-2 ring-background">
            {photo && <AvatarImage src={photo} alt="" />}
            <AvatarFallback className="bg-brand-muted text-sm font-semibold text-brand-text">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <DialogTitle className="truncate text-lg font-semibold text-brand-text">
              {name}
            </DialogTitle>
            {role && (
              <DialogDescription className="truncate">
                {t("dialog.interviewedFor", { role })}
              </DialogDescription>
            )}
          </div>
        </DialogHeader>
        <div className="overflow-y-auto p-4">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
