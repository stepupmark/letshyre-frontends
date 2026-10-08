import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { createColumnHelper } from "@tanstack/react-table"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useSearchParams } from "react-router"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { CopyButton } from "@/components/copy-button"
import { DataTable } from "@/components/data-table"
import { DetailSheet } from "@/components/detail-sheet"
import { EmptyState } from "@/components/empty-state"
import { FileDropzone } from "@/components/file-dropzone"
import { AnimatedList } from "@/components/motion/animated-list"
import { Shake } from "@/components/motion/shake"
import { PageHeader } from "@/components/page-header"
import { QueryState } from "@/components/query-state"
import { ScoreBand } from "@/components/score-band"
import { StatusBadge } from "@/components/status-badge"
import { Wizard } from "@/components/wizard"
import { useDetailParam } from "@/hooks/use-detail-param"
import type {
  DataTableColumn,
  dataTableFeatures,
} from "@/lib/data-table-features"
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft"
import { relativeTime } from "@/lib/relative-time"
import {
  ordering,
  PAGE_SIZE,
  readTableParams,
  writeTableParams,
} from "@workspace/api/table-params"
import { undoToast } from "@/lib/undo-toast"

import { applicants, type Applicant } from "./fixtures"
import { useLab } from "./use-lab"

export function meta() {
  return [{ title: "Building blocks · LetsHyre" }]
}

const help = createColumnHelper<typeof dataTableFeatures, Applicant>()

export default function Blocks() {
  const { view, setView } = useLab()
  const [search, setSearch] = useSearchParams()
  const params = readTableParams(search, { sortable: ["name", "score"] })
  const [open, setOpen] = useDetailParam("candidate")
  const [rows, setRows] = useState(applicants)
  const [confirming, setConfirming] = useState(false)

  const sorted = useMemo(() => {
    const list = rows.filter((r) =>
      r.name.toLowerCase().includes(params.q.toLowerCase())
    )
    if (params.sort) {
      const key = params.sort.id
      list.sort((a, b) =>
        key === "score"
          ? a.ai_match.ai_matching_score - b.ai_match.ai_matching_score
          : a.name.localeCompare(b.name)
      )
      if (params.sort.desc) list.reverse()
    }
    return list
  }, [rows, params.q, params.sort])
  const page = sorted.slice(
    (params.page - 1) * PAGE_SIZE,
    params.page * PAGE_SIZE
  )

  const columns = useMemo<DataTableColumn<Applicant>[]>(
    () => [
      help.accessor("name", {
        header: "Candidate",
        cell: ({ row }) => (
          <button
            type="button"
            data-row-open
            className="rounded-sm text-start font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onClick={() => {
              setOpen(String(row.original.id))
            }}
          >
            {row.original.name}
          </button>
        ),
      }) as DataTableColumn<Applicant>,
      help.accessor((r) => r.ai_match.ai_matching_score, {
        id: "score",
        header: "Match",
        cell: ({ getValue }) => <ScoreBand score={getValue()} />,
      }) as DataTableColumn<Applicant>,
      help.accessor("created_at", {
        header: "Applied",
        enableSorting: false,
        cell: ({ getValue }) => relativeTime(getValue()),
      }) as DataTableColumn<Applicant>,
    ],
    [setOpen]
  )

  const current = sorted.findIndex((r) => String(r.id) === open)
  const detail = sorted[current]

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Building blocks"
        description="Step 5.6 components with fixture data. Use the prototype bar for loading, empty and error."
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-medium">DataTable + DetailSheet</h2>
        <Input
          type="search"
          aria-label="Search by name"
          placeholder="Search by name"
          className="max-w-64"
          value={params.q}
          onChange={(e) => {
            setSearch(writeTableParams(search, { q: e.target.value }), {
              replace: true,
            })
          }}
        />
        <DataTable
          columns={columns}
          data={
            view === "loading" || view === "error"
              ? undefined
              : view === "empty"
                ? []
                : page
          }
          total={view === "empty" ? 0 : sorted.length}
          getRowId={(r) => String(r.id)}
          rowLabel={(r) => r.name}
          params={params}
          onParams={(change) => {
            setSearch(writeTableParams(search, change))
          }}
          pending={view === "loading"}
          error={view === "error"}
          onRetry={() => {
            setView("ready")
          }}
          empty={
            <EmptyState
              title="No applicants yet"
              description="They show up here as soon as they finish the AI interview."
            />
          }
          filtered={params.q !== ""}
          onClearFilters={() => {
            setSearch({}, { replace: true })
          }}
          onOpen={(r) => {
            setOpen(String(r.id))
          }}
          bulkActions={(ids, clear) => (
            <Button
              size="sm"
              onClick={() => {
                const before = rows
                setRows((all) =>
                  all.map((r) =>
                    ids.includes(String(r.id))
                      ? { ...r, status: "shortlisted" }
                      : r
                  )
                )
                clear()
                undoToast(`${ids.length} shortlisted`, "Undo", () => {
                  setRows(before)
                })
              }}
            >
              Shortlist
            </Button>
          )}
          mobileRow={(r) => (
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg border p-4 text-start"
              onClick={() => {
                setOpen(String(r.id))
              }}
            >
              <span className="font-medium">{r.name}</span>
              <ScoreBand score={r.ai_match.ai_matching_score} />
            </button>
          )}
        />
        <DetailSheet
          open={detail !== undefined}
          onClose={() => {
            setOpen(null)
          }}
          title={detail?.name}
          description={detail?.role_applied}
          position={
            detail ? { current: current + 1, total: sorted.length } : undefined
          }
          onPrevious={
            current > 0
              ? () => {
                  setOpen(String(sorted[current - 1]?.id))
                }
              : undefined
          }
          onNext={
            current >= 0 && current < sorted.length - 1
              ? () => {
                  setOpen(String(sorted[current + 1]?.id))
                }
              : undefined
          }
          footer={
            <Button
              className="flex-1"
              onClick={() => {
                setConfirming(true)
              }}
            >
              Unlock · 2 credits
            </Button>
          }
        >
          <p className="text-muted-foreground">{detail?.ai_match.rationale}</p>
          <StatusBadge tone="info">{detail?.status}</StatusBadge>
        </DetailSheet>
        <ConfirmDialog
          open={confirming}
          onOpenChange={setConfirming}
          title={`Unlock ${detail?.name ?? ""}?`}
          description="This uses 2 credits and can't be undone. You'll have 4 credits left."
          confirmLabel="Unlock · 2 credits"
          onConfirm={() => {
            setConfirming(false)
          }}
        />
      </section>

      <section className="flex max-w-xl flex-col gap-3">
        <h2 className="text-base font-medium">FileDropzone</h2>
        <FileDropzone
          label="Job description"
          rules={{ accept: [".pdf", ".docx"], maxBytes: 5 * 1024 * 1024 }}
          upload={(_file, { onProgress, signal }) =>
            new Promise((resolve, reject) => {
              let done = 0
              const id = setInterval(() => {
                done += 0.2
                onProgress(Math.min(done, 1))
                if (done >= 1) {
                  clearInterval(id)
                  // every other upload fails, to show the retry
                  if (Math.random() < 0.5) reject(new Error("demo failure"))
                  else resolve({ ok: true })
                }
              }, 300)
              signal.addEventListener("abort", () => {
                clearInterval(id)
              })
            })
          }
        />
      </section>

      <WizardDemo />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-medium">Smaller pieces</h2>
        <div className="flex flex-wrap items-center gap-3">
          <CopyButton
            value="https://letshyre.ai/shared-scorecard/abc123"
            label="Copy link"
          />
          <ScoreBand score={82} />
          <ScoreBand score={55} />
          <ScoreBand score={20} />
        </div>
        <AnimatedList
          items={rows.slice(0, 3)}
          getKey={(r) => r.id}
          className="flex flex-col divide-y rounded-lg border"
          itemClassName="p-3 text-sm"
        >
          {(r) => r.name}
        </AnimatedList>
        <QueryDemo />
        <p className="text-sm text-muted-foreground">
          API ordering for the table: {ordering(params.sort) ?? "none"}
        </p>
      </section>
    </div>
  )
}

interface Draft {
  company: string
  size: string
}

function WizardDemo() {
  const [draft, setDraft] = useState<Partial<Draft>>(
    () => loadDraft<Draft>("lab-wizard") ?? {}
  )
  const [error, setError] = useState<string>()

  const update = (change: Partial<Draft>) => {
    const next = { ...draft, ...change }
    setDraft(next)
    saveDraft("lab-wizard", next)
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-medium">Wizard</h2>
      <Wizard
        steps={[
          {
            id: "company",
            title: "Company details",
            validate: () => {
              const missing = !draft.company?.trim()
              setError(missing ? "Enter your company name." : undefined)
              return !missing
            },
            content: (
              <div className="flex flex-col gap-2">
                <Label htmlFor="company">Company name</Label>
                <Shake error={error}>
                  <Input
                    id="company"
                    value={draft.company ?? ""}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "company-error" : undefined}
                    onChange={(e) => {
                      update({ company: e.target.value })
                    }}
                  />
                </Shake>
                {error && (
                  <p id="company-error" className="text-sm text-danger">
                    {error}
                  </p>
                )}
              </div>
            ),
          },
          {
            id: "size",
            title: "Team size",
            content: (
              <div className="flex flex-col gap-2">
                <Label htmlFor="size">People hiring with you</Label>
                <Input
                  id="size"
                  inputMode="numeric"
                  value={draft.size ?? ""}
                  onChange={(e) => {
                    update({ size: e.target.value })
                  }}
                />
              </div>
            ),
          },
        ]}
        onFinish={() => {
          clearDraft("lab-wizard")
          setDraft({})
        }}
      />
    </section>
  )
}

function QueryDemo() {
  const { view } = useLab()
  const query = useQuery({
    queryKey: ["lab", "query-demo", view],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800))
      if (view === "error") throw new Error("demo failure")
      return "Loaded after 800 ms; the skeleton waited 300 ms before showing."
    },
    retry: false,
  })
  return (
    <QueryState
      query={query}
      skeleton={<p className="text-sm text-muted-foreground">Loading…</p>}
    >
      {(text) => <p className="text-sm">{text}</p>}
    </QueryState>
  )
}
