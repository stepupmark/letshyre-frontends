import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { Input } from "@workspace/ui/components/input"
import { Kbd } from "@workspace/ui/components/kbd"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  LockOpen,
  MoreHorizontal,
  Search,
} from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useEffect, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { StatusBadge, type Tone } from "@/components/status-badge"
import { useDelayed } from "@/hooks/use-delayed"
import { duration, ease, spring } from "@/lib/motion"
import { relativeTime } from "@/lib/relative-time"

import { MatchScore } from "./match-score"
import { LoadError } from "./load-error"
import {
  applicants as initial,
  UNLOCK_COST,
  type Applicant,
  type ApplicantStatus,
} from "./fixtures"
import { useLab } from "./use-lab"

export function meta() {
  return [{ title: "Applicants · Senior React Developer · LetsHyre" }]
}

const statusTone: Record<ApplicantStatus, Tone> = {
  new: "info",
  shortlisted: "success",
  rejected: "neutral",
}
const statusLabel: Record<ApplicantStatus, string> = {
  new: "New",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
}
const tabs = ["all", "new", "shortlisted", "rejected"] as const

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")

const years = (n: number) => `${n} ${n === 1 ? "yr" : "yrs"}`

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

export default function Applicants() {
  const { t, lang, view, setView } = useLab()
  const [params, setParams] = useSearchParams()
  const [rows, setRows] = useState(initial)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [cursor, setCursor] = useState(-1)
  const rowRefs = useRef(new Map<number, HTMLElement>())
  const skeleton = useDelayed(view === "loading")

  const tab = tabs.find((x) => x === params.get("status")) ?? "all"
  const query = params.get("q") ?? ""
  const openId = Number(params.get("candidate")) || null

  const setParam = (key: string, value: string | null) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: key !== "candidate", preventScrollReset: true }
    )
  }

  const source = view === "empty" ? [] : rows
  const visible = source
    .filter((r) => tab === "all" || r.status === tab)
    .filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.ai_match.ai_matching_score - a.ai_match.ai_matching_score)
  const open = rows.find((r) => r.id === openId) ?? null
  const openIndex = visible.findIndex((r) => r.id === openId)
  const prev = openIndex > 0 ? visible[openIndex - 1] : undefined
  const next = openIndex >= 0 ? visible[openIndex + 1] : undefined

  const setStatus = (ids: number[], status: ApplicantStatus) => {
    const before = new Map(rows.map((r) => [r.id, r.status]))
    setRows((all) =>
      all.map((r) => (ids.includes(r.id) ? { ...r, status } : r))
    )
    setSelected(new Set())
    const noun = ids.length === 1 ? "candidate" : "candidates"
    toast(
      `${ids.length} ${noun} ${status === "rejected" ? "rejected" : "shortlisted"}`,
      {
        action: {
          label: "Undo",
          onClick: () => {
            setRows((all) =>
              all.map((r) => ({ ...r, status: before.get(r.id) ?? r.status }))
            )
          },
        },
      }
    )
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (typing(event.target) || event.metaKey || event.ctrlKey) return
      if (event.key !== "j" && event.key !== "k") return
      const step = event.key === "j" ? 1 : -1
      if (open) {
        const next = visible[openIndex + step]
        if (next) setParam("candidate", String(next.id))
        return
      }
      const index = Math.min(Math.max(cursor + step, 0), visible.length - 1)
      setCursor(index)
      const row = visible[index]
      if (row) rowRefs.current.get(row.id)?.focus()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
    }
  })

  const counts = Object.fromEntries(
    tabs.map((x) => [
      x,
      source.filter((r) => x === "all" || r.status === x).length,
    ])
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          to="/_lab/dashboard"
          viewTransition
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 rtl:-scale-x-100" />
          Senior React Developer
        </Link>
        <PageHeader
          title={t("applicants.title")}
          description={
            view === "empty"
              ? "No one has applied yet."
              : `${source.length} applied · ${counts.new} waiting for review · sorted by match`
          }
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setParam("status", value === "all" ? null : String(value))
          }}
        >
          <TabsList>
            {tabs.map((x) => (
              <TabsTrigger key={x} value={x}>
                {x === "all" ? "All" : statusLabel[x]}
                <span className="text-muted-foreground tabular-nums">
                  {counts[x]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute inset-s-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              setParam("q", e.target.value || null)
            }}
            placeholder="Search by name"
            aria-label="Search applicants by name"
            className="ps-8"
          />
        </div>
      </div>

      {view === "error" ? (
        <LoadError
          what="applicants"
          onRetry={() => {
            setView("ready")
          }}
        />
      ) : view === "loading" ? (
        skeleton && <TableSkeleton />
      ) : visible.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>
              {source.length === 0 ? "No applicants yet" : "No one matches"}
            </EmptyTitle>
            <EmptyDescription>
              {source.length === 0
                ? "Applicants show up here as soon as they finish the AI interview. Sharing the job link brings them in faster."
                : "Try another tab or clear the search."}
            </EmptyDescription>
          </EmptyHeader>
          {source.length === 0 ? (
            <Button variant="outline" onClick={() => toast("Link copied")}>
              Copy job link
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setParams({}, { replace: true })
              }}
            >
              Clear filters
            </Button>
          )}
        </Empty>
      ) : (
        <>
          <div className="hidden rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      aria-label="Select all"
                      checked={
                        visible.length > 0 &&
                        visible.every((r) => selected.has(r.id))
                      }
                      indeterminate={
                        visible.some((r) => selected.has(r.id)) &&
                        !visible.every((r) => selected.has(r.id))
                      }
                      onCheckedChange={(checked) => {
                        setSelected(
                          checked
                            ? new Set(visible.map((r) => r.id))
                            : new Set()
                        )
                      }}
                    />
                  </TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead className="text-end">Experience</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence initial={false} mode="popLayout">
                  {visible.map((row) => (
                    <m.tr
                      key={row.id}
                      layout="position"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{
                        opacity: 0,
                        transition: { duration: duration.fast },
                      }}
                      transition={spring}
                      data-state={selected.has(row.id) ? "selected" : undefined}
                      className="border-b transition-colors hover:bg-muted/50 has-focus-visible:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <TableCell>
                        <Checkbox
                          aria-label={`Select ${row.name}`}
                          checked={selected.has(row.id)}
                          onCheckedChange={(checked) => {
                            setSelected((prev) => {
                              const next = new Set(prev)
                              if (checked) next.add(row.id)
                              else next.delete(row.id)
                              return next
                            })
                          }}
                        />
                      </TableCell>
                      <TableCell className="max-w-72">
                        <button
                          type="button"
                          ref={(el) => {
                            if (el) rowRefs.current.set(row.id, el)
                            else rowRefs.current.delete(row.id)
                          }}
                          onClick={() => {
                            setParam("candidate", String(row.id))
                          }}
                          className="flex w-full items-center gap-3 rounded-sm text-start outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {initials(row.name)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium">
                              {row.name}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {row.role_applied}
                            </span>
                          </span>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          <MatchScore score={row.ai_match.ai_matching_score} />
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {row.ai_match.matched_skills.length} of{" "}
                            {row.ai_match.matched_skills.length +
                              row.ai_match.missing_skills.length}{" "}
                            skills
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-end tabular-nums">
                        {years(row.ai_match.years_experience)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {relativeTime(row.created_at, lang)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge tone={statusTone[row.status]}>
                          {statusLabel[row.status]}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <RowMenu
                          row={row}
                          onStatus={setStatus}
                          onOpen={() => {
                            setParam("candidate", String(row.id))
                          }}
                        />
                      </TableCell>
                    </m.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

          <ul className="flex flex-col gap-2 md:hidden">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((row) => (
                <m.li
                  key={row.id}
                  layout="position"
                  exit={{ opacity: 0, transition: { duration: duration.fast } }}
                  transition={spring}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setParam("candidate", String(row.id))
                    }}
                    className="flex w-full flex-col gap-2 rounded-lg border p-4 text-start transition-colors active:bg-muted"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {row.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {row.role_applied}
                        </span>
                      </span>
                      <StatusBadge tone={statusTone[row.status]}>
                        {statusLabel[row.status]}
                      </StatusBadge>
                    </span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MatchScore score={row.ai_match.ai_matching_score} />
                      <span className="tabular-nums">
                        {years(row.ai_match.years_experience)}
                      </span>
                      <span>·</span>
                      <span>{relativeTime(row.created_at, lang)}</span>
                    </span>
                  </button>
                </m.li>
              ))}
            </AnimatePresence>
          </ul>

          <p className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
            <Kbd className="text-foreground">J</Kbd>
            <Kbd className="text-foreground">K</Kbd>
            to move,
            <Kbd className="text-foreground">Enter</Kbd>
            to open
          </p>
        </>
      )}

      <AnimatePresence>
        {selected.size > 0 && (
          <m.div
            role="toolbar"
            aria-label="Bulk actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: duration.base, ease }}
            className="fixed inset-x-4 bottom-4 z-20 mx-auto flex max-w-md items-center gap-2 rounded-xl border bg-popover p-2 ps-4 text-sm shadow-lg"
          >
            <span className="me-auto tabular-nums">
              {t("applicants.selected", { count: selected.size })}
            </span>
            <Button
              size="sm"
              onClick={() => {
                setStatus([...selected], "shortlisted")
              }}
            >
              {t("applicants.shortlist")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setStatus([...selected], "rejected")
              }}
            >
              {t("applicants.reject")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelected(new Set())
              }}
            >
              Clear
            </Button>
          </m.div>
        )}
      </AnimatePresence>

      <Peek
        row={open}
        side={lang === "ar" ? "left" : "right"}
        position={openIndex >= 0 ? `${openIndex + 1} of ${visible.length}` : ""}
        onClose={() => {
          setParam("candidate", null)
        }}
        onPrev={
          prev
            ? () => {
                setParam("candidate", String(prev.id))
              }
            : undefined
        }
        onNext={
          next
            ? () => {
                setParam("candidate", String(next.id))
              }
            : undefined
        }
        onStatus={setStatus}
        onUnlocked={(id) => {
          setRows((all) =>
            all.map((r) => (r.id === id ? { ...r, unlocked: true } : r))
          )
        }}
      />
    </div>
  )
}

function RowMenu({
  row,
  onStatus,
  onOpen,
}: {
  row: Applicant
  onStatus: (ids: number[], status: ApplicantStatus) => void
  onOpen: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${row.name}`}
          />
        }
      >
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onOpen}>View details</DropdownMenuItem>
        {row.status !== "shortlisted" && (
          <DropdownMenuItem
            onClick={() => {
              onStatus([row.id], "shortlisted")
            }}
          >
            Shortlist
          </DropdownMenuItem>
        )}
        {row.status !== "rejected" && (
          <DropdownMenuItem
            onClick={() => {
              onStatus([row.id], "rejected")
            }}
          >
            Reject
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Peek({
  row,
  side,
  position,
  onClose,
  onPrev,
  onNext,
  onStatus,
  onUnlocked,
}: {
  row: Applicant | null
  side: "left" | "right"
  position: string
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  onStatus: (ids: number[], status: ApplicantStatus) => void
  onUnlocked: (id: number) => void
}) {
  const { credits, spend } = useLab()
  const [confirming, setConfirming] = useState(false)
  const [last, setLast] = useState(row)
  if (row && row !== last) setLast(row)
  const shown = row ?? last

  const unlock = () => {
    if (!shown) return
    spend(UNLOCK_COST)
    onUnlocked(shown.id)
    setConfirming(false)
    toast(`${shown.name} unlocked`, {
      description: `${UNLOCK_COST} credits used. ${credits - UNLOCK_COST} left.`,
    })
  }

  return (
    <Sheet
      open={row !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <SheetContent side={side} className="w-full gap-0 sm:max-w-md">
        {shown && (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-center gap-1 pe-8 text-xs text-muted-foreground">
                <span className="me-auto tabular-nums">{position}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onPrev}
                  disabled={!onPrev}
                  aria-label="Previous candidate (K)"
                >
                  <ChevronUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onNext}
                  disabled={!onNext}
                  aria-label="Next candidate (J)"
                >
                  <ChevronDown />
                </Button>
              </div>
              <SheetTitle className="text-lg">{shown.name}</SheetTitle>
              <SheetDescription>{shown.role_applied}</SheetDescription>
            </SheetHeader>

            <m.div
              key={shown.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: duration.fast }}
              className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <MatchScore score={shown.ai_match.ai_matching_score} />
                <StatusBadge tone={statusTone[shown.status]}>
                  {statusLabel[shown.status]}
                </StatusBadge>
                <span className="text-muted-foreground tabular-nums">
                  {shown.ai_match.years_experience} years experience
                </span>
              </div>

              <section>
                <h3 className="mb-1 font-medium">Why this match</h3>
                <p className="text-muted-foreground">
                  {shown.ai_match.rationale}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  From the AI interview and resume. Check the scorecard before
                  deciding.
                </p>
              </section>

              <section className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="mb-2 font-medium">Has</h3>
                  <ul className="flex flex-wrap gap-1.5">
                    {shown.ai_match.matched_skills.map((s) => (
                      <li key={s}>
                        <StatusBadge tone="success">{s}</StatusBadge>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 font-medium">Missing</h3>
                  {shown.ai_match.missing_skills.length > 0 ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {shown.ai_match.missing_skills.map((s) => (
                        <li key={s}>
                          <StatusBadge tone="neutral">{s}</StatusBadge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      Nothing from the job's list.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border p-4">
                <AnimatePresence mode="wait" initial={false}>
                  {shown.unlocked ? (
                    <m.div
                      key="unlocked"
                      initial={{ opacity: 0, filter: "blur(4px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      transition={{ duration: duration.slow, ease }}
                      className="flex flex-col gap-3"
                    >
                      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                        <dt className="text-muted-foreground">Email</dt>
                        <dd className="truncate">
                          {shown.name.split(" ")[0]?.toLowerCase()}@example.com
                        </dd>
                        <dt className="text-muted-foreground">Phone</dt>
                        <dd className="tabular-nums" dir="ltr">
                          +91 98450 12345
                        </dd>
                      </dl>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-fit"
                        nativeButton={false}
                        render={<Link to="/_lab/scorecard" viewTransition />}
                      >
                        Open scorecard
                      </Button>
                    </m.div>
                  ) : (
                    <m.div
                      key="locked"
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-3"
                    >
                      <p className="text-muted-foreground">
                        Unlock to see contact details, the full scorecard, the
                        interview recording and the resume.
                      </p>
                      <Button
                        className="w-fit"
                        onClick={() => {
                          setConfirming(true)
                        }}
                        disabled={credits < UNLOCK_COST}
                      >
                        <LockOpen />
                        Unlock · {UNLOCK_COST} credits
                      </Button>
                      {credits < UNLOCK_COST && (
                        <p className="text-xs text-muted-foreground">
                          You have {credits} credits.{" "}
                          <Link to="#" className="underline underline-offset-4">
                            Add credits
                          </Link>{" "}
                          and come back here.
                        </p>
                      )}
                    </m.div>
                  )}
                </AnimatePresence>
              </section>
            </m.div>

            <SheetFooter className="flex-row border-t">
              {shown.status !== "shortlisted" && (
                <Button
                  className="flex-1"
                  onClick={() => {
                    onStatus([shown.id], "shortlisted")
                  }}
                >
                  Shortlist
                </Button>
              )}
              {shown.status !== "rejected" && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    onStatus([shown.id], "rejected")
                  }}
                >
                  Reject
                </Button>
              )}
            </SheetFooter>

            <Dialog open={confirming} onOpenChange={setConfirming}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Unlock {shown.name}?</DialogTitle>
                  <DialogDescription>
                    This uses {UNLOCK_COST} credits and can't be undone. You'll
                    have{" "}
                    <span className="font-medium text-foreground tabular-nums">
                      {credits - UNLOCK_COST} credits
                    </span>{" "}
                    left.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Cancel
                  </DialogClose>
                  <Button onClick={unlock}>
                    Unlock · {UNLOCK_COST} credits
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function TableSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      className="flex flex-col divide-y rounded-lg border"
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="size-4" />
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="hidden h-5 w-24 md:block" />
          <Skeleton className="hidden h-5 w-20 md:block" />
        </div>
      ))}
    </div>
  )
}
