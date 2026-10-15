import { Popover } from "@base-ui/react/popover"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Kbd, KbdGroup } from "@workspace/ui/components/kbd"
import { Lightbulb } from "lucide-react"
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
  keys,
  onDismiss,
}: {
  anchor: RefObject<Element | null>
  open: boolean
  title: string
  body: string
  /** The shortcut that does the same thing, shown as keycaps. */
  keys?: string[]
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
            className="flex w-80 origin-(--transform-origin) gap-3 rounded-xl border bg-popover p-4 text-sm text-popover-foreground shadow-lg outline-hidden duration-200 motion-reduce:animate-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0"
          >
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary [&_svg]:size-4"
            >
              <Lightbulb />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Popover.Title className="font-semibold">{title}</Popover.Title>
              <Popover.Description className="text-pretty text-muted-foreground">
                {body}
              </Popover.Description>
              <div className="mt-2 flex items-center gap-2">
                {keys && (
                  <KbdGroup>
                    {keys.map((key) => (
                      <Kbd
                        key={key}
                        className="h-6 min-w-6 border bg-background px-1.5 text-foreground"
                      >
                        {key}
                      </Kbd>
                    ))}
                  </KbdGroup>
                )}
                <Button size="sm" className="ms-auto" onClick={onDismiss}>
                  {t("tip.gotIt")}
                </Button>
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
