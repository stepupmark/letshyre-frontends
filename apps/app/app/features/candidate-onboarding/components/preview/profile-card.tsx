import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { Briefcase, Check, MapPin, ShieldCheck } from "lucide-react"
import { useCallback, type ReactNode } from "react"
import { useWatch, type Control } from "react-hook-form"

import type { ResumeState } from "../../lib/resume-state"
import {
  REQUIRED_DOCUMENTS,
  type StepId,
  type Values,
} from "../../schemas/onboarding-form.schema"

const initials = (name: string) =>
  name
    .trim()
    .split(/[\s@]+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("")

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
  const { t } = useTranslation("candidateOnboarding")
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

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {t("preview.caption")}
      </p>
      <div className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-[0_12px_32px_-12px_rgb(15_23_42/0.18)]">
        <Section active={step === "you" || step === "photo"}>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-muted text-base font-semibold text-brand-text",
                step === "photo" &&
                  "ring-2 ring-brand ring-offset-2 ring-offset-card"
              )}
            >
              {photo instanceof File ? (
                <Photo file={photo} />
              ) : (
                initials(name) || (
                  <span className="size-6 rounded-full bg-brand/25" />
                )
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="truncate font-semibold">
                {name || t("preview.you")}
              </p>
              {resume.role ? (
                <p className="truncate text-sm text-brand-text motion-safe:animate-in motion-safe:fade-in">
                  {resume.role}
                </p>
              ) : (
                <Bar className="w-28" />
              )}
              {place.length > 0 ? (
                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground motion-safe:animate-in motion-safe:fade-in">
                  <MapPin className="size-3.5 shrink-0" />
                  {place.join(", ")}
                </p>
              ) : (
                <Bar className="w-20" />
              )}
            </div>
          </div>
        </Section>

        <Section active={step === "work"}>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">
                {t("preview.pay")}
              </dt>
              <dd className="font-medium tabular-nums">
                {now.trim() ? (
                  t("review.pay", { now, next: next.trim() || "–" })
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
          {places.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {places.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                >
                  <Briefcase className="size-3 text-muted-foreground" />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section active={step === "resume"}>
          <p className="text-xs text-muted-foreground">{t("preview.skills")}</p>
          {skills.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full bg-brand-muted px-2 py-0.5 text-xs font-medium text-brand-text motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:fade-in"
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

        <Section active={step === "review"} muted>
          <ul className="flex flex-col gap-1.5 text-xs">
            <Tick done={aadhaar.replace(/\D/g, "").length === 12}>
              {t("preview.aadhaar")}
            </Tick>
            <Tick done={photo instanceof File}>{t("preview.photo")}</Tick>
            <Tick done={docCount === REQUIRED_DOCUMENTS.length}>
              {t("work.count", {
                added: docCount,
                total: REQUIRED_DOCUMENTS.length,
              })}
            </Tick>
          </ul>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0" />
            {t("preview.private")}
          </p>
        </Section>
      </div>
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

function Tick({ done, children }: { done: boolean; children: ReactNode }) {
  return (
    <li
      className={cn(
        "flex items-center gap-2",
        done ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-full border",
          done && "border-success bg-success"
        )}
      >
        {done && (
          <Check className="pop size-3 text-background" strokeWidth={3} />
        )}
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

function Photo({ file }: { file: File }) {
  // the object URL lives exactly as long as the img
  const attach = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) return
      const url = URL.createObjectURL(file)
      img.src = url
      return () => {
        URL.revokeObjectURL(url)
      }
    },
    [file]
  )
  return <img ref={attach} alt="" className="size-full object-cover" />
}
