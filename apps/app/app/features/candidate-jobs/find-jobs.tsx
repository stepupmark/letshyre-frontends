import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Bookmark, BookmarkCheck, MapPin, Search, X } from "lucide-react"
import { useState } from "react"
import { href, useSearchParams } from "react-router"

import { AppLink } from "@/components/app-link"
import { DetailSheet } from "@/components/detail-sheet"
import { EmptyState, NoMatches } from "@/components/empty-state"
import { AnimatedList } from "@/components/motion/animated-list"
import { LoadError } from "@/components/query-state"
import { StatusBadge } from "@/components/status-badge"
import { useDelayed } from "@/hooks/use-delayed"
import { useDetailParam } from "@/hooks/use-detail-param"
import { industriesQuery } from "@/lib/industries"
import { relativeTime } from "@/lib/relative-time"

import { companyOf, findJobsQuery, type Job, type JobSearch } from "./api"
import { CompanyLogo, JobDetail, JobFacts, SkillList } from "./job-parts"
import { Pager } from "./pager"
import {
  EMPLOYMENT_TYPES,
  FILTERS,
  loadSaved,
  readSearch,
  searchKey,
  storeSaved,
  type Filter,
} from "./search"
import { useApply } from "./use-apply"

const ANY = "any"

export function FindJobs() {
  const { t } = useTranslation("candidateJobs")
  const [params, setParams] = useSearchParams()
  const search = readSearch(params)
  const key = searchKey(search)
  const query = useQuery(findJobsQuery(search))
  const skeleton = useDelayed(query.isPending)
  const [openId, setOpenId] = useDetailParam("job")
  const [saved, setSaved] = useState(loadSaved)
  const apply = useApply()

  const update = (change: Partial<Record<Filter, string>>, page = 1) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [name, value] of Object.entries(change)) {
          if (value.trim()) next.set(name, value.trim())
          else next.delete(name)
        }
        if (page > 1) next.set("page", String(page))
        else next.delete("page")
        return next
      },
      { preventScrollReset: true }
    )
  }

  const clear = () => {
    update(Object.fromEntries(FILTERS.map((name) => [name, ""])))
  }

  const toggleSaved = () => {
    const next = saved.includes(key)
      ? saved.filter((item) => item !== key)
      : [key, ...saved]
    setSaved(next)
    storeSaved(next)
  }

  const jobs = query.data?.jobs
  const index = jobs?.findIndex((job) => job.id === openId) ?? -1
  const open = index >= 0 ? jobs?.[index] : undefined
  // keeps the panel filled while it animates closed
  const [last, setLast] = useState(open)
  if (open && open !== last) setLast(open)
  const shown = open ?? last
  const applied = Boolean(shown?.status)

  return (
    <div className="flex flex-col gap-6">
      <SearchForm
        key={key}
        search={search}
        onSubmit={(change) => {
          update(change)
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        {saved.map((item) => (
          <SavedChip
            key={item}
            value={item}
            active={item === key}
            onPick={() => {
              setParams(new URLSearchParams(item), {
                preventScrollReset: true,
              })
            }}
            onRemove={() => {
              const next = saved.filter((other) => other !== item)
              setSaved(next)
              storeSaved(next)
            }}
          />
        ))}
        <span className="ms-auto flex gap-2">
          {key && (
            <>
              <Button variant="ghost" size="sm" onClick={clear}>
                {t("filters.clear")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-pressed={saved.includes(key)}
                onClick={toggleSaved}
              >
                {saved.includes(key) ? <BookmarkCheck /> : <Bookmark />}
                {saved.includes(key) ? t("saved.saved") : t("saved.save")}
              </Button>
            </>
          )}
        </span>
      </div>

      <section aria-labelledby="results" className="flex flex-col gap-4">
        <h2
          id="results"
          aria-live="polite"
          className="text-sm text-muted-foreground tabular-nums"
        >
          {query.data
            ? t("results", { count: query.data.total })
            : t("searching")}
        </h2>

        {query.isError && !query.data ? (
          <LoadError
            onRetry={() => void query.refetch()}
            retrying={query.isRefetching}
          />
        ) : !jobs ? (
          skeleton && <ListSkeleton />
        ) : jobs.length === 0 ? (
          key ? (
            <NoMatches onClear={clear} />
          ) : (
            <EmptyState
              title={t("empty.title")}
              description={t("empty.body")}
            />
          )
        ) : (
          <AnimatedList
            items={jobs}
            getKey={(job) => job.id}
            className={cn(
              "flex flex-col gap-3 transition-opacity",
              query.isPlaceholderData && "opacity-60"
            )}
          >
            {(job) => (
              <JobCard
                job={job}
                onOpen={() => {
                  setOpenId(job.id)
                }}
              />
            )}
          </AnimatedList>
        )}

        {query.data && (
          <Pager
            page={search.page}
            pages={query.data.pages}
            onPage={(page) => {
              update({}, page)
              window.scrollTo({ top: 0 })
            }}
          />
        )}
      </section>

      <DetailSheet
        open={Boolean(open)}
        onClose={() => {
          setOpenId(null)
        }}
        title={shown?.title ?? t("untitled")}
        description={shown ? companyOf(shown) : undefined}
        position={
          jobs && index >= 0
            ? { current: index + 1, total: jobs.length }
            : undefined
        }
        onPrevious={
          index > 0
            ? () => {
                setOpenId(jobs?.[index - 1]?.id ?? null)
              }
            : undefined
        }
        onNext={
          jobs && index >= 0 && index < jobs.length - 1
            ? () => {
                setOpenId(jobs[index + 1]?.id ?? null)
              }
            : undefined
        }
        footer={
          shown &&
          (applied ? (
            <div className="flex w-full items-center justify-between gap-3">
              <StatusBadge tone="info">{t("applied")}</StatusBadge>
              <AppLink
                to={href("/employee/applications")}
                className="text-sm underline-offset-4 hover:underline"
              >
                {t("apply.track")}
              </AppLink>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-2">
              <Button
                className="w-full"
                disabled={apply.isPending}
                onClick={() => {
                  apply.mutate(shown.id)
                }}
              >
                {apply.isPending ? t("apply.sending") : t("apply.button")}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {t("apply.note")}
              </p>
            </div>
          ))
        }
      >
        {shown && <JobDetail job={shown} />}
      </DetailSheet>
    </div>
  )
}

function SearchForm({
  search,
  onSubmit,
}: {
  search: JobSearch
  onSubmit: (change: Partial<Record<Filter, string>>) => void
}) {
  const { t } = useTranslation("candidateJobs")
  const industries = useQuery(industriesQuery())
  const typeItems = [
    { value: ANY, label: t("filters.anyType") },
    ...EMPLOYMENT_TYPES.map((value) => ({ value, label: t(`types.${value}`) })),
  ]
  const industryItems = [
    { value: ANY, label: t("filters.anyIndustry") },
    ...(industries.data ?? []),
  ]

  const submit = (form: HTMLFormElement) => {
    const data = new FormData(form)
    const read = (name: Filter) => {
      const value = data.get(name)
      return typeof value === "string" ? value : ""
    }
    onSubmit({
      q: read("q"),
      location: read("location"),
      experience: read("experience"),
      salary: read("salary"),
    })
  }

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        submit(event.currentTarget)
      }}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <InputGroup className="sm:flex-2">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            name="q"
            type="search"
            aria-label={t("filters.keyword")}
            placeholder={t("filters.keyword")}
            defaultValue={search.q}
            enterKeyHint="search"
          />
        </InputGroup>
        <InputGroup className="sm:flex-1">
          <InputGroupAddon>
            <MapPin />
          </InputGroupAddon>
          <InputGroupInput
            name="location"
            aria-label={t("filters.location")}
            placeholder={t("filters.location")}
            defaultValue={search.location}
            autoComplete="address-level2"
            enterKeyHint="search"
          />
        </InputGroup>
        <Button type="submit">{t("filters.search")}</Button>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Select
          items={typeItems}
          value={search.type || ANY}
          onValueChange={(value) => {
            onSubmit({ type: value === ANY ? "" : (value ?? "") })
          }}
        >
          <SelectTrigger aria-label={t("filters.type")} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {typeItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={industryItems}
          value={search.industry || ANY}
          onValueChange={(value) => {
            onSubmit({ industry: value === ANY ? "" : (value ?? "") })
          }}
        >
          <SelectTrigger aria-label={t("filters.industry")} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {industryItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <InputGroup>
          <InputGroupInput
            name="experience"
            inputMode="numeric"
            aria-label={t("filters.experience")}
            placeholder={t("filters.experience")}
            defaultValue={search.experience}
          />
          <InputGroupAddon align="inline-end">
            {t("filters.years")}
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput
            name="salary"
            inputMode="numeric"
            aria-label={t("filters.salary")}
            placeholder={t("filters.salary")}
            defaultValue={search.salary}
          />
          <InputGroupAddon align="inline-end">LPA</InputGroupAddon>
        </InputGroup>
      </div>
    </form>
  )
}

function SavedChip({
  value,
  active,
  onPick,
  onRemove,
}: {
  value: string
  active: boolean
  onPick: () => void
  onRemove: () => void
}) {
  const { t } = useTranslation("candidateJobs")
  const search = readSearch(new URLSearchParams(value))
  const label = [
    search.q,
    search.location,
    search.type && t(`types.${search.type}` as "types.full_time"),
    search.industry,
    search.experience && t("facts.years", { years: search.experience }),
    search.salary && `${search.salary} LPA`,
  ]
    .filter(Boolean)
    .join(" · ")
  return (
    <Badge
      variant={active ? "secondary" : "outline"}
      className="h-7 gap-0 p-0 ps-2.5"
    >
      <button
        type="button"
        onClick={onPick}
        aria-pressed={active}
        className="max-w-56 truncate rounded-s-4xl outline-none focus-visible:underline"
      >
        {label}
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t("saved.remove", { search: label })}
        className="grid size-7 place-items-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <X className="size-3" />
      </button>
    </Badge>
  )
}

function JobCard({ job, onOpen }: { job: Job; onOpen: () => void }) {
  const { t } = useTranslation("candidateJobs")
  const locale = useLocale()
  const company = companyOf(job)
  const skills = job.skills_required ?? []
  return (
    <article className="group relative flex gap-4 rounded-lg border bg-card p-4 transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-xs has-focus-visible:ring-3 has-focus-visible:ring-ring/50 sm:p-5">
      <CompanyLogo job={job} />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-medium text-pretty">
              <button
                type="button"
                onClick={onOpen}
                className="text-start outline-none after:absolute after:inset-0 after:rounded-lg"
              >
                {job.title ?? t("untitled")}
              </button>
            </h3>
            <p className="text-sm text-muted-foreground">
              {[company, job.created_at && relativeTime(job.created_at, locale)]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          {job.status && <StatusBadge tone="info">{t("applied")}</StatusBadge>}
        </div>
        <JobFacts job={job} />
        {skills.length > 0 && <SkillList skills={skills} max={4} />}
      </div>
    </article>
  )
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-32 rounded-lg" />
      ))}
    </div>
  )
}
