import { toast } from "sonner"

/** For reversible actions: do it now and offer Undo instead of asking first. */
export function undoToast(
  message: string,
  undoLabel: string,
  onUndo: () => void
) {
  toast(message, {
    action: { label: undoLabel, onClick: onUndo },
    duration: 6000,
  })
}
