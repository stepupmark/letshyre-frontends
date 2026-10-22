import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { useQueries, useQuery } from "@tanstack/react-query"
import { Search, X } from "lucide-react"
import { useReducedMotion } from "motion/react"
import { useId, useRef, useState } from "react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { EmptyState } from "@/components/empty-state"
import { LoadError, RefreshNote } from "@/components/query-state"
import { useDelayed } from "@/hooks/use-delayed"
import { useDetailParam } from "@/hooks/use-detail-param"
import { buttonLink } from "@/lib/button-link"

import { useApplicationsView } from "../hooks/use-applications-view"
import { matchesApplication, STAGES, type Stage } from "../lib/applications"
import {
  applicationCountQuery,
  applicationsQuery,
} from "../queries/candidate-jobs.queries"
import { ApplicationList, ApplicationsSkeleton } from "./application-list"
import { ApplicationSheet } from "./application-sheet"
import { Pager } from "./pager"
import { StageNav } from "./stage-nav"

export function Applications() {
  const { t } = useTranslation(["candidateJobs", "common"])
  const { stage, page, q, update } = useApplicationsView()
  const counts = useQueries({
    queries: STAGES.map((item) => applicationCountQuery(item)),
  })
  const query = useQuery(applicationsQuery(stage, page))
  const skeleton = useDelayed(query.isPending)
  const [openId, setOpenId] = useDetailParam("job")
  const reduceMotion = useReducedMotion()
  const heading = useRef<HTMLHeadingElement>(null)
  const headingId = useId()

  const total = query.data?.total ?? null
  const shown = query.data?.jobs.filter((job) => matchesApplication(job, q))
  const stale = query.isFetching && query.isPlaceholderData
  const stageLabel = t(`status.${stage}`)

  return (
    <div className="flex flex-col gap-6">
      <title>{`${stageLabel} · ${t("applications.title")} · ${t("common:appName")}`}</title>
      <StageNav stage={stage} counts={counts} />

      <section aria-labelledby={headingId} className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            ref={heading}
            id={headingId}
            tabIndex={-1}
            className="scroll-mt-20 text-base font-semibold tracking-tight outline-none"
          >
            {stageLabel}
            {total !== null && (
              <span className="font-normal text-muted-foreground tabular-nums">
                {" · "}
                {t("applications.count", { count: total })}
              </span>
            )}
          </h2>
          {(total ?? 0) > 0 && (
            <PageFind
              key={`${stage}-${String(page)}`}
              value={q}
              onChange={(next) => {
                update({ q: next }, true)
              }}
            />
          )}
        </div>
        <p aria-live="polite" className="sr-only">
          {total === null
            ? t("common:state.loading")
            : t("applications.count", { count: shown?.length ?? total })}
        </p>

        {query.isRefetchError && (
          <RefreshNote
            onRetry={() => void query.refetch()}
            retrying={query.isRefetching}
          />
        )}

        {query.isError && !query.data ? (
          <LoadError
            onRetry={() => void query.refetch()}
            retrying={query.isRefetching}
          />
        ) : !shown ? (
          skeleton && <ApplicationsSkeleton />
        ) : query.data?.jobs.length === 0 ? (
          <StageEmpty stage={stage} />
        ) : shown.length === 0 ? (
          <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            <bdi>{t("applications.noMatch", { q })}</bdi>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                update({ q: "" }, true)
              }}
            >
              {t("applications.clearFind")}
            </Button>
          </div>
        ) : (
          <ApplicationList
            jobs={shown}
            stage={stage}
            query={q}
            stale={stale}
            onOpen={setOpenId}
          />
        )}

        {query.data && (
          <Pager
            page={page}
            pages={query.data.pages}
            onPage={(next) => {
              update({ page: next, q: "" })
              heading.current?.focus({ preventScroll: true })
              heading.current?.scrollIntoView({
                block: "start",
                behavior: reduceMotion ? "auto" : "smooth",
              })
            }}
          />
        )}
      </section>

      <ApplicationSheet
        jobs={shown}
        stage={stage}
        openId={openId}
        query={q}
        onOpen={setOpenId}
      />
    </div>
  )
}

function PageFind({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const { t } = useTranslation("candidateJobs")
  const [text, setText] = useState(value)
  const set = (next: string) => {
    setText(next)
    onChange(next)
  }
  return (
    <InputGroup className="max-w-xs max-sm:h-11 max-sm:max-w-none">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        aria-label={t("applications.find")}
        placeholder={t("applications.find")}
        value={text}
        onChange={(event) => {
          set(event.target.value)
        }}
      />
      {text && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={t("applications.clearFind")}
            onClick={() => {
              set("")
            }}
          >
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}

function StageEmpty({ stage }: { stage: Stage }) {
  const { t } = useTranslation("candidateJobs")
  const action =
    stage === "Shortlisted" || stage === "Selected"
      ? { to: href("/employee/interview-guide"), label: t("next.guide") }
      : { to: href("/employee/jobs"), label: t("next.findJobs") }
  return (
    <EmptyState
      title={t(`empty.${stage}.title`)}
      description={t(`empty.${stage}.body`)}
      action={
        <AppLink
          to={action.to}
          className={buttonLink({
            variant: stage === "Applied" ? "default" : "outline",
          })}
        >
          {action.label}
        </AppLink>
      }
    />
  )
}
