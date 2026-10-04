import { useNavigate } from "react-router"

import { isLive } from "./live-routes"

/** Navigate in the app when the page is live here, otherwise load it from the server. */
export function useGo() {
  const navigate = useNavigate()
  return (to: string, { replace = false } = {}) => {
    if (isLive(to)) void navigate(to, { replace, viewTransition: true })
    else if (replace) window.location.replace(to)
    else window.location.assign(to)
  }
}
