import { useTranslation } from "@workspace/i18n/react"
import { BadgeCheck, Camera, FileText, ShieldCheck } from "lucide-react"
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
import { Avatar, Bar, Route, Section, Stamp } from "./profile-card-parts"

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

        <div className="flex flex-col overflow-hidden rounded-2xl border bg-card">
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
