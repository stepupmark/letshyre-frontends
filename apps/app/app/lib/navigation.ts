import { useNavigate } from "react-router"

import { isAppPath } from "./app-paths"

/** Navigate in the app for its own pages, otherwise load the page from the server. */
export function useGo() {
  const navigate = useNavigate()
  return (to: string, { replace = false } = {}) => {
    if (isAppPath(to)) void navigate(to, { replace, viewTransition: true })
    else if (replace) window.location.replace(to)
    else window.location.assign(to)
  }
}
