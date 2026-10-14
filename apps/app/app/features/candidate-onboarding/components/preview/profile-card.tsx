import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { BadgeCheck, Camera, FileText, ShieldCheck } from "lucide-react"
import type { ReactNode } from "react"
import { useWatch, type Control } from "react-hook-form"

import { FileImage } from "@/components/file-image"
import { formatPercent, initialsOf } from "@/lib/format"

import type { ResumeState } from "../../lib/resume-state"
import {
  payRaise,
  REQUIRED_DOCUMENTS,
  type StepId,
  type Values,
} from "../../schemas/onboarding-form.schema"

// stops on the route, in a 320 x 96 box, clear of the avatar; the curve passes through each one
const STOPS = [
  { x: 132, y: 42 },
  { x: 184, y: 22 },
  { x: 236, y: 46 },
  { x: 288, y: 26 },
]
const ROUTE = `M-20 80 Q64 62 ${STOPS.map((s) => `${s.x} ${s.y}`).join(" T ")} T 360 40`

/** The candidate as employers will see them, filling in while the form is typed. */
export function ProfileCard({
  control,
  resume,
  name,
  step,
}: {
  control: Control<Values>
  resume: ResumeState
  name: string
  step: StepId
}) {
  const { t, i18n } = useTranslation("candidateOnboarding")
  const [photo, aadhaar, city, state, now, next, industry, places, ...docs] =
    useWatch({
      control,
      name: [
        "profile_photo",
        "aadhar_number",
        "address_city",
        "address_state",
        "current_ctc",
        "expected_ctc",
        "preferred_industry",
        "preferred_locations",
        ...REQUIRED_DOCUMENTS,
      ],
    })
  const skills = resume.review?.skills.slice(0, 6) ?? []
  const docCount = docs.filter((file) => file instanceof File).length
  const place = [city, state].map((part) => part.trim()).filter(Boolean)
  const hasAadhaar = aadhaar.replace(/\D/g, "").length === 12
  const hasPhoto = photo instanceof File
  const hasDocs = docCount === REQUIRED_DOCUMENTS.length

  const parts = [
    hasAadhaar && place.length > 0,
    hasPhoto,
    Boolean(now.trim() && industry),
    hasDocs,
    skills.length > 0,
  ]
  const done = parts.filter(Boolean).length / parts.length
  const raise = payRaise({ current_ctc: now, expected_ctc: next })

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {t("preview.caption")}
      </p>
      {/* the cards behind hint at the shortlist this one lands on */}
      <div className="relative isolate">
        <div className="absolute inset-x-6 -bottom-3 -z-10 h-full rounded-2xl border bg-card/70" />
        <div className="absolute inset-x-3 -bottom-1.5 -z-10 h-full rounded-2xl border bg-card/90" />

        <div className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-[0_12px_32px_-12px_rgb(15_23_42/0.18)]">
          <Route
            home={city.trim()}
            places={places}
            active={step === "you" || step === "work"}
          />

          <Section active={step === "you" || step === "photo"}>
            <div className="-mt-12 flex items-end gap-3">
              <Avatar
                done={done}
                label={formatPercent(done, i18n.language)}
                highlight={step === "photo"}
              >
                {hasPhoto ? (
                  <FileImage file={photo} className="size-full object-cover" />
                ) : (
                  initialsOf(name) || (
                    <span className="size-6 rounded-full bg-brand/25" />
                  )
                )}
              </Avatar>
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="flex items-center gap-1.5 font-semibold">
                <span className="truncate">{name || t("preview.you")}</span>
                {hasAadhaar && (
                  <BadgeCheck className="pop size-4 shrink-0 text-brand" />
                )}
              </p>
              {resume.role ? (
                <p className="truncate text-sm text-brand-text motion-safe:animate-in motion-safe:fade-in">
                  {resume.role}
                </p>
              ) : (
                <Bar className="mt-1 w-28" />
              )}
            </div>
          </Section>

          <Section active={step === "work"}>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col gap-1">
                <dt className="text-xs text-muted-foreground">
                  {t("preview.pay")}
                </dt>
                <dd className="flex flex-wrap items-center gap-1.5 font-medium tabular-nums">
                  {now.trim() ? (
                    <>
                      {t("review.pay", {
                        now,
                        next: next.trim() || "–",
                        count: Number(next) || 0,
                      })}
                      {raise > 0 && (
                        <span className="pop rounded-full bg-success/12 px-1.5 py-px text-[0.6875rem] font-semibold text-success">
                          {formatPercent(raise, i18n.language, true)}
                        </span>
                      )}
                    </>
                  ) : (
                    <Bar className="mt-1.5 w-20" />
                  )}
                </dd>
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <dt className="text-xs text-muted-foreground">
                  {t("preview.industry")}
                </dt>
                <dd className="truncate font-medium">
                  {industry || <Bar className="mt-1.5 w-16" />}
                </dd>
              </div>
            </dl>
          </Section>

          <Section active={step === "resume"}>
            <p className="text-xs text-muted-foreground">
              {t("preview.skills")}
            </p>
            {skills.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {skills.map((skill, i) => (
                  <li
                    key={skill}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className="rounded-full bg-brand-muted px-2 py-0.5 text-xs font-medium text-brand-text motion-safe:animate-in motion-safe:fill-mode-both motion-safe:zoom-in-95 motion-safe:fade-in"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex gap-1.5">
                <Bar className="h-5 w-14" />
                <Bar className="h-5 w-20" />
                <Bar className="h-5 w-12" />
              </div>
            )}
          </Section>

          <Section active={step === "documents" || step === "review"} muted>
            <ul className="grid grid-cols-3 gap-2 text-center text-[0.6875rem] leading-tight">
              <Stamp icon={ShieldCheck} done={hasAadhaar}>
                {t("preview.aadhaar")}
              </Stamp>
              <Stamp icon={Camera} done={hasPhoto}>
                {t("preview.photo")}
              </Stamp>
              <Stamp icon={FileText} done={hasDocs}>
                {t("work.count", {
                  added: docCount,
                  total: REQUIRED_DOCUMENTS.length,
                })}
              </Stamp>
            </ul>
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 shrink-0" />
              {t("preview.private")}
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}

/** Home city first, then the places they'd work, as stops on one route. */
function Route({
  home,
  places,
  active,
}: {
  home: string
  places: string[]
  active: boolean
}) {
  const all = [
    home,
    ...places.filter((p) => p.toLowerCase() !== home.toLowerCase()),
  ].filter(Boolean)
  const stops = all.slice(0, STOPS.length)
  const extra = all.length - stops.length

  return (
    <div
      className={cn(
        "relative h-24 overflow-hidden bg-brand-muted/50 bg-[radial-gradient(circle,color-mix(in_oklab,var(--brand)_18%,transparent)_1px,transparent_1px)] bg-size-[14px_14px] transition-colors duration-300 motion-reduce:transition-none",
        active && "bg-brand-muted"
      )}
    >
      <svg
        viewBox="0 0 320 96"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0 size-full"
      >
        <path
          d={ROUTE}
          fill="none"
          strokeWidth={2}
          strokeDasharray="4 5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="stroke-brand/35"
        />
      </svg>
      {STOPS.map((pos, i) => {
        const label = stops[i] ?? ""
        return (
          <div
            key={i}
            style={{
              left: `${(pos.x / 320) * 100}%`,
              top: `${(pos.y / 96) * 100}%`,
            }}
            className="absolute flex -translate-1/2 flex-col items-center"
          >
            <span
              className={cn(
                "grid place-items-center rounded-full border-2 border-dashed border-brand/30 bg-card",
                i === 0 && home ? "size-4" : "size-3",
                label && "pop border-solid border-brand",
                label && i === 0 && home && "bg-brand"
              )}
            />
            {label && (
              <span className="absolute top-full mt-1 max-w-14 truncate rounded-full bg-card/90 px-1.5 text-[0.625rem] font-medium shadow-xs motion-safe:animate-in motion-safe:fade-in">
                {i === 3 && extra > 0 ? `${label} +${extra}` : label}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Photo or initials, ringed by how much of the profile is filled. */
function Avatar({
  done,
  label,
  highlight,
  children,
}: {
  done: number
  label: string
  highlight: boolean
  children: ReactNode
}) {
  return (
    <div className="relative grid size-20 shrink-0 place-items-center rounded-full bg-card">
      <svg viewBox="0 0 80 80" aria-hidden="true" className="absolute inset-0">
        <circle
          cx={40}
          cy={40}
          r={37}
          strokeWidth={3}
          className="fill-none stroke-muted"
        />
        <circle
          cx={40}
          cy={40}
          r={37}
          pathLength={1}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={1}
          strokeDashoffset={1 - done}
          className={cn(
            "origin-center -rotate-90 fill-none transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none",
            done === 1 ? "stroke-success" : "stroke-brand",
            done === 0 && "opacity-0"
          )}
        />
      </svg>
      <div
        className={cn(
          "grid size-16 place-items-center overflow-hidden rounded-full bg-brand-muted text-lg font-semibold text-brand-text",
          highlight && "ring-2 ring-brand/40"
        )}
      >
        {children}
      </div>
      <span className="absolute -inset-e-1 bottom-0 rounded-full border bg-card px-1.5 text-[0.625rem] font-semibold tabular-nums shadow-xs">
        {label}
      </span>
    </div>
  )
}

function Section({
  active,
  muted = false,
  children,
}: {
  active: boolean
  muted?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b p-5 transition-colors duration-300 last:border-b-0 motion-reduce:transition-none",
        muted && "bg-muted/30",
        active && "bg-brand-muted/40"
      )}
    >
      {children}
    </div>
  )
}

function Stamp({
  icon: Icon,
  done,
  children,
}: {
  icon: typeof Camera
  done: boolean
  children: ReactNode
}) {
  return (
    <li
      className={cn(
        "flex flex-col items-center gap-1.5",
        done ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "grid size-9 place-items-center rounded-full border border-dashed transition-colors duration-300 motion-reduce:transition-none",
          done && "border-solid border-success/40 bg-success/10 text-success"
        )}
      >
        <Icon key={String(done)} className={cn("size-4", done && "pop")} />
      </span>
      {children}
    </li>
  )
}

function Bar({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "block h-2.5 rounded-full bg-muted-foreground/15",
        className
      )}
    />
  )
}
