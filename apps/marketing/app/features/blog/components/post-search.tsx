import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { SearchIcon, XIcon } from "lucide-react"

// a plain input, not the ui InputGroup: Base UI's Input put every blog page over the JS budget
export function PostSearch({
  query,
  onQueryChange,
}: {
  query: string
  onQueryChange: (query: string) => void
}) {
  const { t } = useTranslation("blog")

  return (
    <search className="relative w-full max-w-md">
      <SearchIcon
        aria-hidden
        className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        value={query}
        onChange={(event) => {
          onQueryChange(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") onQueryChange("")
        }}
        aria-label={t("index.search")}
        placeholder={t("index.search")}
        className="h-11 w-full rounded-lg border border-input bg-background ps-9 pe-11 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("index.clear")}
          onClick={() => {
            onQueryChange("")
          }}
          className="absolute inset-e-1.5 top-1/2 -translate-y-1/2"
        >
          <XIcon aria-hidden />
        </Button>
      )}
    </search>
  )
}
