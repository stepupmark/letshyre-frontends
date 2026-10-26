import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { useHotkey } from "@/hooks/use-hotkey"

const SHORTCUTS: { keys: string[]; action: string }[] = [
  { keys: ["Ctrl / ⌘", "K"], action: "Open the command palette" },
  { keys: ["/"], action: "Search this page" },
  { keys: ["J"], action: "Next row" },
  { keys: ["K"], action: "Previous row" },
  { keys: ["Enter"], action: "Open the selected row" },
  { keys: ["Ctrl", "B"], action: "Toggle the sidebar" },
  { keys: ["Esc"], action: "Close a dialog or menu" },
  { keys: ["?"], action: "Show keyboard shortcuts" },
]

interface KeyboardShortcutsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcuts({
  open,
  onOpenChange,
}: KeyboardShortcutsProps) {
  useHotkey(["?"], () => {
    onOpenChange(true)
  })
  useHotkey(["/"], (event) => {
    const search =
      document.querySelector<HTMLInputElement>("[data-page-search]")
    if (!search) return
    event.preventDefault()
    search.focus()
    search.select()
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Shortcuts work anywhere except while typing in a field.
          </DialogDescription>
        </DialogHeader>
        <dl className="divide-y text-sm">
          {SHORTCUTS.map(({ keys, action }) => (
            <div
              key={action}
              className="flex items-center justify-between gap-4 py-2.5"
            >
              <dt className="text-muted-foreground">{action}</dt>
              <dd className="flex gap-1">
                {keys.map((key) => (
                  <kbd
                    key={key}
                    className="min-w-6 rounded-sm border bg-muted px-1.5 py-0.5 text-center font-sans text-xs font-medium"
                  >
                    {key}
                  </kbd>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  )
}
