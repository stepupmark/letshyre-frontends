import { useEffect } from "react"

// route meta can't see query data, so detail pages set the title once it loads
export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    if (title) document.title = `${title} · LetsHyre Admin`
  }, [title])
}
