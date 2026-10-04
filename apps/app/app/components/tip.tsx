import { Popover } from "@base-ui/react/popover"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import type { RefObject } from "react"

/**
 * A one-time hint pointing at a control. It doesn't trap focus or block the
 * page; Escape, an outside click or "Got it" dismisses it for good.
 */
export function Tip({
  anchor,
  open,
  title,
  body,
  onDismiss,
}: {
  anchor: RefObject<Element | null>
  open: boolean
  title: string
  body: string
  onDismiss: () => void
}) {
  const { t } = useTranslation("common")
  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onDismiss()
      }}
    >
      <Popover.Portal>
        <Popover.Positioner
          anchor={anchor}
          side="inline-start"
          align="start"
          sideOffset={8}
          className="isolate z-50"
        >
          <Popover.Popup
            initialFocus={false}
            className="flex w-72 origin-(--transform-origin) flex-col gap-2 rounded-lg bg-popover p-3 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0"
          >
            <Popover.Title className="font-medium">{title}</Popover.Title>
            <Popover.Description className="text-muted-foreground">
              {body}
            </Popover.Description>
            <Button size="sm" className="self-end" onClick={onDismiss}>
              {t("tip.gotIt")}
            </Button>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
