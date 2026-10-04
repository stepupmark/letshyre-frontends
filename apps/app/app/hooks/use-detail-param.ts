import { useSearchParams } from "react-router"

/** The open item lives in the URL (e.g. ?candidate=42), so it can be shared and survives refresh. */
export function useDetailParam(name: string) {
  const [params, setParams] = useSearchParams()
  const set = (next: string | null) => {
    setParams(
      (prev) => {
        const search = new URLSearchParams(prev)
        if (next) search.set(name, next)
        else search.delete(name)
        return search
      },
      { preventScrollReset: true }
    )
  }
  return [params.get(name), set] as const
}
