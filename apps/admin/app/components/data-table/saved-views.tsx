import { useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { Bookmark, Check, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useStoredState } from "@/hooks/use-stored-state"

interface SavedView {
  name: string
  search: string
}

// the page number isn't part of a view
function viewSearch(search: string) {
  const params = new URLSearchParams(search)
  params.delete("page")
  params.sort()
  const query = params.toString()
  return query ? `?${query}` : ""
}

export function SavedViews() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const [views, setViews] = useStoredState<SavedView[]>(
    `saved-views:${pathname}`,
    []
  )
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const current = viewSearch(search)

  const save = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setViews([
      ...views.filter((view) => view.name !== trimmed),
      { name: trimmed, search: current },
    ])
    setSaving(false)
    setName("")
    toast.success(`Saved "${trimmed}"`)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Bookmark /> Views
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {views.length > 0 && (
            <>
              <DropdownMenuLabel>Saved views</DropdownMenuLabel>
              {views.map((view) => (
                <DropdownMenuItem
                  key={view.name}
                  onSelect={() => void navigate(`${pathname}${view.search}`)}
                  className="group/view"
                >
                  <Check
                    className={
                      view.search === current ? "opacity-100" : "opacity-0"
                    }
                  />
                  <span className="flex-1 truncate">{view.name}</span>
                  <button
                    type="button"
                    aria-label={`Delete ${view.name}`}
                    className="rounded-sm p-0.5 text-muted-foreground opacity-0 group-hover/view:opacity-100 group-focus/view:opacity-100 hover:text-foreground"
                    onClick={(event) => {
                      event.stopPropagation()
                      setViews(views.filter((item) => item !== view))
                    }}
                    onPointerDown={(event) => {
                      event.stopPropagation()
                    }}
                  >
                    <X className="size-3.5" />
                  </button>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            disabled={!current}
            onSelect={() => {
              setSaving(true)
            }}
          >
            <Plus /> Save current filters
          </DropdownMenuItem>
          {!current && (
            <p className="px-2 pb-1.5 text-xs text-muted-foreground">
              Apply a filter or search first.
            </p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={saving} onOpenChange={setSaving}>
        <DialogContent className="sm:max-w-sm">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              save()
            }}
          >
            <DialogHeader>
              <DialogTitle>Save view</DialogTitle>
              <DialogDescription>
                Saves the current filters and search on this device.
              </DialogDescription>
            </DialogHeader>
            <Input
              aria-label="View name"
              placeholder="e.g. Pending this week"
              value={name}
              maxLength={40}
              onChange={(event) => {
                setName(event.target.value)
              }}
              className="my-4"
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSaving(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim()}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
