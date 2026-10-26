import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item"
import { Progress } from "@workspace/ui/components/progress"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  CalendarClock,
  Check,
  CircleDashed,
  Coins,
  Plus,
  UserRoundSearch,
  Video,
} from "lucide-react"
import { Link } from "react-router"

import { AnimatedNumber } from "@/components/animated-number"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { useDelayed } from "@/hooks/use-delayed"

import { LoadError } from "./load-error"
import { dashboard, jobs, UNLOCK_COST } from "./fixtures"
import { useLab } from "./use-lab"

export function meta() {
  return [{ title: "Dashboard · LetsHyre" }]
}

export default function Dashboard() {
  const { t, view, setView } = useLab()
  const skeleton = useDelayed(view === "loading")
  const fresh = view === "empty"

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("dashboard.title")}
        description={
          fresh
            ? "Three steps and you can start screening candidates."
            : t("dashboard.summary", { count: 4 })
        }
        actions={
          <Button nativeButton={false} render={<Link to="#" />}>
            <Plus />
            {t("dashboard.postJob")}
          </Button>
        }
      />

      {view === "error" ? (
        <LoadError
          what="your dashboard"
          onRetry={() => {
            setView("ready")
          }}
        />
      ) : view === "loading" ? (
        skeleton && <DashboardSkeleton />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex min-w-0 flex-col gap-6">
            {fresh ? <SetupChecklist /> : <Attention />}
            {!fresh && <OpenJobs />}
          </div>
          <CreditsCard />
        </div>
      )}
    </div>
  )
}

function Attention() {
  const { t } = useLab()
  const items = [
    {
      icon: UserRoundSearch,
      title: "12 new applicants for Senior React Developer",
      detail: "3 are strong matches. Oldest waiting 2 days.",
      action: "Review",
      to: "/_lab/applicants",
    },
    {
      icon: Video,
      title: "4 interviews finished",
      detail: "Scorecards are ready for a decision.",
      action: "Open",
      to: "/_lab/scorecard",
    },
    {
      icon: CalendarClock,
      title: "Product Designer closes in 2 days",
      detail: "31 applicants so far. Extend it to keep receiving more.",
      action: "Extend",
      to: "#",
    },
    {
      icon: Coins,
      title: "Credits are running low",
      detail: `Enough for ${Math.floor(dashboard.credits.available / UNLOCK_COST)} more unlocks.`,
      action: t("credits.add"),
      to: "#",
    },
  ]

  return (
    <section aria-labelledby="attention">
      <h2 id="attention" className="mb-3 text-base font-medium">
        {t("attention.title")}
      </h2>
      <ItemGroup className="gap-0 divide-y rounded-lg border">
        {items.map((item) => (
          <Item key={item.title} role="listitem">
            <ItemMedia variant="icon">
              <item.icon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{item.title}</ItemTitle>
              <ItemDescription>{item.detail}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link to={item.to} viewTransition />}
              >
                {item.action}
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </section>
  )
}

function OpenJobs() {
  const { t } = useLab()

  return (
    <section aria-labelledby="open-jobs">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="open-jobs" className="text-base font-medium">
          {t("jobs.title")}
        </h2>
        <Link
          to="/_lab/applicants"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          All jobs
        </Link>
      </div>
      <ul className="divide-y rounded-lg border">
        {jobs.map((job) => (
          <li key={job.id}>
            <Link
              to="/_lab/applicants"
              viewTransition
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none sm:grid-cols-[minmax(0,1fr)_7rem_7rem]"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {job.title}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {job.location}
                </span>
              </span>
              <span className="flex items-center gap-2 justify-self-end text-sm tabular-nums sm:justify-self-start">
                {job.applicants}
                {job.newApplicants > 0 && (
                  <StatusBadge tone="info">{job.newApplicants} new</StatusBadge>
                )}
              </span>
              <span className="col-span-2 text-xs text-muted-foreground tabular-nums sm:col-span-1 sm:text-end">
                {job.closesInDays <= 3 ? (
                  <StatusBadge tone="warning">
                    Closes in {job.closesInDays} days
                  </StatusBadge>
                ) : (
                  `Closes in ${job.closesInDays} days`
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function CreditsCard() {
  const { t, credits, view } = useLab()
  const { used_this_month, monthly } = dashboard.credits
  const low = credits <= 3 * UNLOCK_COST

  return (
    <Card>
      <CardHeader>
        <CardDescription>{t("credits.title")}</CardDescription>
        <CardTitle className="flex items-baseline gap-2 text-3xl font-semibold">
          <AnimatedNumber value={view === "empty" ? 10 : credits} />
          {low && view !== "empty" && (
            <StatusBadge tone="warning">Low</StatusBadge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <p className="text-muted-foreground">
          {t("credits.unlocks", {
            count: Math.floor((view === "empty" ? 10 : credits) / UNLOCK_COST),
          })}
          . An unlock costs {UNLOCK_COST} credits and includes the scorecard,
          recording and resume.
        </p>
        {view !== "empty" && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Used this month</span>
              <span className="tabular-nums">
                {used_this_month} of {monthly}
              </span>
            </div>
            <Progress
              value={(used_this_month / monthly) * 100}
              aria-label="Credits used this month"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button className="flex-1">{t("credits.add")}</Button>
        <Button variant="ghost" nativeButton={false} render={<Link to="#" />}>
          Invoices
        </Button>
      </CardFooter>
    </Card>
  )
}

function SetupChecklist() {
  const { t } = useLab()
  const steps = [
    { title: "Create your account", detail: "Done", done: true },
    {
      title: "Add company details",
      detail: "Name, size and logo. About 2 minutes.",
      done: false,
    },
    {
      title: "Verify your company",
      detail: "Upload a GST or registration document. Reviewed within a day.",
      done: false,
    },
    {
      title: "Post your first job",
      detail: "Upload a job description and we fill in the form.",
      done: false,
    },
  ]
  const done = steps.filter((s) => s.done).length
  const next = steps.find((s) => !s.done)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("setup.title")}</CardTitle>
        <CardDescription className="tabular-nums">
          {done} of {steps.length} done
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress
          value={(done / steps.length) * 100}
          aria-label="Setup progress"
          className="mb-4"
        />
        <ol className="flex flex-col">
          {steps.map((step) => (
            <li
              key={step.title}
              className="flex items-start gap-3 border-t py-3 first:border-t-0"
            >
              {step.done ? (
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
              ) : (
                <CircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={
                    step.done
                      ? "text-sm text-muted-foreground line-through"
                      : "text-sm font-medium"
                  }
                >
                  {step.title}
                </p>
                {!step.done && (
                  <p className="text-sm text-muted-foreground">{step.detail}</p>
                )}
              </div>
              {step === next && <Button size="sm">Start</Button>}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-48" />
        <div className="flex flex-col divide-y rounded-lg border">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <Skeleton className="size-8 rounded-md" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-7 w-16" />
            </div>
          ))}
        </div>
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}
