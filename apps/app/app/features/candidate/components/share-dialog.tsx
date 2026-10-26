import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { Share2 } from "lucide-react"
import * as m from "motion/react-m"
import { useState } from "react"

import { duration, ease } from "@/lib/motion"

import { type ShareLink } from "../schemas/share.schema"
import { Created } from "./share-created"
import { ShareForm, type JobOption } from "./share-form"

export function ShareDialog({
  unlockId,
  name,
  jobs,
  size = "default",
  className,
}: {
  unlockId: string
  name: string
  jobs: JobOption[] | undefined
  size?: "default" | "sm" | "icon-sm"
  className?: string
}) {
  const { t } = useTranslation("candidate")
  const [open, setOpen] = useState(false)
  const [link, setLink] = useState<ShareLink | null>(null)
  const start = () => {
    setLink(null)
    setOpen(true)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setLink(null)
      }}
    >
      {size === "icon-sm" ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon-sm"
                className={className}
                aria-label={t("share.title", { name })}
                onClick={start}
              />
            }
          >
            <Share2 />
          </TooltipTrigger>
          <TooltipContent>{t("share.button")}</TooltipContent>
        </Tooltip>
      ) : (
        <Button
          variant="outline"
          size={size}
          className={className}
          onClick={start}
        >
          <Share2 />
          {t("share.button")}
        </Button>
      )}
      <DialogContent className="gap-6 sm:max-w-lg sm:p-6">
        {link ? (
          <m.div
            key="created"
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: duration.base, ease }}
          >
            <Created link={link} name={name} />
          </m.div>
        ) : (
          <ShareForm
            unlockId={unlockId}
            name={name}
            jobs={jobs}
            onCreated={setLink}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
