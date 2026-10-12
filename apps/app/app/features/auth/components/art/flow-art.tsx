import { cn } from "@workspace/ui/lib/utils"
import {
  Check,
  KeyRound,
  Mail,
  Rocket,
  Smartphone,
  UserRound,
  type LucideIcon,
} from "lucide-react"

export interface Row {
  key: string
  done: boolean
  label: string
}

export function ProfileCard({
  initials,
  title,
  named,
  subtitle,
  rows,
  welcome,
}: {
  initials: string
  title: string
  named: boolean
  subtitle: string
  rows: Row[]
  welcome: string | null
}) {
  const progress = rows.filter((row) => row.done).length / rows.length

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="settle relative rounded-3xl border bg-card p-6 shadow-[0_10px_30px_rgb(15_23_42/0.07)]">
        <div className="flex items-center gap-4">
          <span className="relative grid size-16 shrink-0 place-items-center">
            <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
              <circle
                cx={32}
                cy={32}
                r={30}
                strokeWidth={3}
                className="fill-none stroke-muted"
              />
              <circle
                cx={32}
                cy={32}
                r={30}
                strokeWidth={3}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={`${progress} 1`}
                className={cn(
                  "fill-none stroke-brand transition-[stroke-dasharray] duration-700 ease-out motion-reduce:transition-none",
                  progress === 0 && "opacity-0"
                )}
              />
            </svg>
            <span className="grid size-12 place-items-center rounded-full bg-brand-muted text-lg font-semibold text-brand-text">
              {initials || <UserRound className="size-6" />}
            </span>
          </span>
          <span className="flex min-w-0 flex-col">
            <span
              className={cn(
                "truncate text-lg font-semibold tracking-tight",
                !named && "text-muted-foreground"
              )}
            >
              {title}
            </span>
            <span className="truncate text-sm text-muted-foreground">
              {subtitle}
            </span>
          </span>
        </div>
        <Rows rows={rows} />
        {welcome && (
          <span className="pop absolute inset-e-6 -top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            {welcome}
          </span>
        )}
      </div>
      <Badge
        icon={Mail}
        done={rows[0]?.done}
        className="-inset-s-6 -top-7 delay-200"
      />
      <Badge
        icon={Smartphone}
        done={rows[1]?.done}
        className="-inset-e-8 top-1/3 delay-300"
      />
      <Badge
        icon={Rocket}
        done={rows[2]?.done}
        className="inset-s-10 -bottom-7 delay-500"
      />
    </div>
  )
}

function Badge({
  icon: Icon,
  done = false,
  className,
}: {
  icon: LucideIcon
  done?: boolean
  className: string
}) {
  return (
    <span
      className={cn(
        "settle absolute grid size-12 place-items-center rounded-2xl border shadow-sm transition-colors duration-500",
        done
          ? "border-transparent bg-primary text-primary-foreground"
          : "float bg-card text-brand-text",
        className
      )}
    >
      {done ? (
        <Check key="done" className="pop size-5" strokeWidth={3} />
      ) : (
        <Icon className="size-5" />
      )}
    </span>
  )
}

export function Rows({ rows }: { rows: Row[] }) {
  return (
    <ul className="mt-5 flex flex-col gap-3 border-t pt-5">
      {rows.map((row) => (
        <li key={row.key} className="flex items-center gap-3 text-sm">
          <span
            className={cn(
              "grid size-6 shrink-0 place-items-center rounded-full border transition-colors duration-300",
              row.done &&
                "border-transparent bg-primary text-primary-foreground"
            )}
          >
            {row.done && <Check className="pop size-3.5" strokeWidth={3} />}
          </span>
          <span
            className={cn(
              "truncate",
              row.done ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {row.label}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function Lock({ open, sent }: { open: boolean; sent: boolean }) {
  return (
    <svg viewBox="0 0 160 170" className="settle w-36 overflow-visible">
      <circle cx={80} cy={96} r={74} className="fill-brand/5" />
      <path
        d="M50 82 V58 a30 30 0 0 1 60 0 V82"
        strokeWidth={11}
        strokeLinecap="round"
        className={cn(
          "fill-none stroke-foreground/60 transition-[translate] duration-500 ease-out motion-reduce:transition-none",
          open && "-translate-y-4"
        )}
      />
      <rect
        x={34}
        y={78}
        width={92}
        height={74}
        rx={18}
        className="fill-primary"
      />
      <circle cx={80} cy={108} r={9} className="fill-primary-foreground" />
      <rect
        x={76}
        y={110}
        width={8}
        height={20}
        rx={4}
        className="fill-primary-foreground"
      />
      {sent && (
        <g className="pop">
          <circle cx={130} cy={70} r={18} className="fill-card stroke-border" />
          <KeyRound
            x={120}
            y={60}
            width={20}
            height={20}
            strokeWidth={2}
            className="text-brand-text"
          />
        </g>
      )}
    </svg>
  )
}
