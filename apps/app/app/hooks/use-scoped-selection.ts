import {
  functionalUpdate,
  type RowSelectionState,
  type Updater,
} from "@tanstack/react-table"
import { useState } from "react"

// a selection belongs to one set of rows; a new page, sort or filter starts empty
export function useScopedSelection(scope: string) {
  const [selection, setSelection] = useState<{
    scope: string
    rows: RowSelectionState
  }>({ scope, rows: {} })
  const rows = selection.scope === scope ? selection.rows : {}
  const setRows = (updater: Updater<RowSelectionState>) => {
    setSelection({ scope, rows: functionalUpdate(updater, rows) })
  }
  return [rows, setRows] as const
}
