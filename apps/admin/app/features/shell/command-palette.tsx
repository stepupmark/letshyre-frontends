import { lazy, Suspense, useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import type { SearchSource } from "@/lib/search"

// the dialog pulls in cmdk and the search queries, so it loads on first open
const CommandPaletteDialog = lazy(() =>
  import("./command-palette-dialog").then((module) => ({
    default: module.CommandPaletteDialog,
  }))
)

const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform)

export function CommandPalette({ sources }: { sources: SearchSource[] }) {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [shortcut] = useState(() => (isMac() ? "⌘K" : "Ctrl K"))

  const show = (next: boolean) => {
    if (next) setLoaded(true)
    setOpen(next)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k") return
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return
      event.preventDefault()
      setLoaded(true)
      setOpen((value) => !value)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className="hidden h-8 w-56 justify-start gap-2 px-2.5 font-normal text-muted-foreground md:flex"
        onClick={() => {
          show(true)
        }}
      >
        <Search />
        <span className="flex-1 text-start">Search…</span>
        <kbd className="rounded-sm border bg-muted px-1.5 font-sans text-[11px] font-medium">
          {shortcut}
        </kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search"
        className="md:hidden"
        onClick={() => {
          show(true)
        }}
      >
        <Search />
      </Button>
      {loaded && (
        <Suspense fallback={null}>
          <CommandPaletteDialog
            open={open}
            onOpenChange={show}
            sources={sources}
          />
        </Suspense>
      )}
    </>
  )
}
