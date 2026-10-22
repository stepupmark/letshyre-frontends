import { useSearchParams } from "react-router"

import { readView, writeView, type ApplicationsView } from "../lib/applications"

/** Stage, page and search live in the URL; a new stage starts at page 1 with no search. */
export function useApplicationsView() {
  const [params, setParams] = useSearchParams()
  const view = readView(params)

  const update = (change: Partial<ApplicationsView>, replace = false) => {
    setParams(
      (prev) => {
        const current = readView(prev)
        const reset =
          change.stage !== undefined && change.stage !== current.stage
            ? { page: 1, q: "" }
            : {}
        return writeView({ ...current, ...reset, ...change }, prev)
      },
      { preventScrollReset: true, replace }
    )
  }

  return { ...view, update }
}
