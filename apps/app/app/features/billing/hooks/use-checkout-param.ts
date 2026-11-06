import { useLocation, useNavigate, useSearchParams } from "react-router"

import { CHECKOUT, NEXT, employerNext } from "../lib/checkout"

export function useCheckoutParam() {
  const [search, setSearch] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const open = (checkout: string) => {
    setSearch(
      (prev) => {
        const params = new URLSearchParams(prev)
        params.set(CHECKOUT, checkout)
        return params
      },
      { preventScrollReset: true, state: { checkout: true } }
    )
  }

  // back closes a checkout opened here; a link from elsewhere just drops the param
  const close = () => {
    if ((location.state as { checkout?: boolean } | null)?.checkout) {
      void navigate(-1)
      return
    }
    setSearch(
      (prev) => {
        const params = new URLSearchParams(prev)
        params.delete(CHECKOUT)
        return params
      },
      { replace: true, preventScrollReset: true }
    )
  }

  return {
    key: search.get(CHECKOUT),
    next: employerNext(search.get(NEXT)),
    open,
    close,
  }
}
