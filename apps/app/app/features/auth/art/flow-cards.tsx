import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { Check, KeyRound, UserRound } from "lucide-react"

import { ROLE_OF, type Audience } from "../audience"
import { FORGOT_FLOW, type ForgotAnswers } from "../forgot-answers"
import { companyFromEmail, initialsOf } from "../identity"
import { maskEmail, maskPhone } from "../mask"
import { registerFlowName, type RegisterAnswers } from "../register/answers"
import { useFlowData } from "../use-flow"

interface Row {
  key: string
  done: boolean
  label: string
}

function useRegisterCard(audience: Audience) {
  const { t } = useTranslation("auth")
  const data = useFlowData<RegisterAnswers>(registerFlowName(ROLE_OF[audience]))
  const name = data.name?.trim() ?? ""
  const company =
    audience === "employer"
      ? companyFromEmail(data.draftEmail ?? data.email ?? "")
      : null
  const rows: Row[] = [
    {
      key: "email",
      done: Boolean(data.emailVerified),
      label:
        data.emailVerified && data.email
          ? maskEmail(data.email)
          : t(audience === "employer" ? "fields.workEmail" : "fields.email"),
    },
    {
      key: "mobile",
      done: Boolean(data.mobileVerified),
      label:
        data.mobileVerified && data.phone
          ? maskPhone(data.phone)
          : t("fields.mobile"),
    },
    {
      key: "ready",
      done: Boolean(data.done),
      label: t(`live.ready.${audience}`),
    },
  ]
  const note = data.done
    ? "done"
    : data.mobileVerified
      ? "almost"
      : data.emailVerified
        ? "going"
        : "start"

  return {
    reset: false,
    initials: initialsOf(name),
    title: name || t("live.yourName"),
    subtitle:
      audience === "employer"
        ? (company ?? t("live.yourCompany"))
        : t("live.jobSeeker"),
    named: Boolean(name),
    rows,
    done: Boolean(data.done),
    note: t(`live.note.${note}`),
    tagline: t(`art.${audience}.tagline`),
  }
}

function useResetCard() {
  const { t } = useTranslation("auth")
  const data = useFlowData<ForgotAnswers>(FORGOT_FLOW)

  return {
    reset: true,
    initials: "",
    title: t("reset.title"),
    subtitle: data.email ? maskEmail(data.email) : t("fields.email"),
    named: true,
    rows: [
      { key: "sent", done: Boolean(data.key), label: t("reset.codeSent") },
      {
        key: "checked",
        done: Boolean(data.verified),
        label: t("reset.codeChecked"),
      },
      { key: "saved", done: false, label: t("reset.saved") },
    ],
    done: false,
    note: t("reset.note"),
    tagline: t("reset.tagline"),
  }
}

type Card = ReturnType<typeof useRegisterCard>

function Avatar({ card, className }: { card: Card; className: string }) {
  return (
    <span
      className={cn(
        "font-display flex shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand-text",
        className
      )}
    >
      {card.initials ||
        (card.reset ? (
          <KeyRound className="size-1/2" />
        ) : (
          <UserRound className="size-1/2" />
        ))}
    </span>
  )
}

function Tick({ done }: { done: boolean }) {
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
        done && "border-transparent bg-primary text-primary-foreground"
      )}
    >
      {done && <Check className="stamp size-3.5" />}
    </span>
  )
}

function FlowCard({ card }: { card: Card }) {
  const { t } = useTranslation("auth")

  return (
    <figure
      aria-hidden="true"
      className="@container flex w-full max-w-md flex-col gap-8"
    >
      <div className="settle relative -rotate-1 rounded-3xl border bg-card p-6 shadow-lg @md:p-8 rtl:rotate-1">
        <div className="flex items-center gap-4">
          <Avatar card={card} className="size-14 text-2xl" />
          <span className="flex min-w-0 flex-col">
            <span
              className={cn(
                "font-display truncate text-3xl/tight",
                !card.named && "text-muted-foreground"
              )}
            >
              {card.title}
            </span>
            <span className="truncate text-sm text-muted-foreground">
              {card.subtitle}
            </span>
          </span>
        </div>
        <span className="my-5 block h-px bg-border" />
        <ul className="flex flex-col gap-3">
          {card.rows.map((row) => (
            <li key={row.key} className="flex items-center gap-3 text-sm">
              <Tick done={row.done} />
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
        {card.done && (
          <span className="stamp absolute inset-e-6 -top-4 rotate-6 rounded-md border-2 border-brand-text bg-card px-3 py-1 text-sm font-bold tracking-widest text-brand-text uppercase">
            {t("live.welcome")}
          </span>
        )}
      </div>
      <figcaption className="flex flex-col gap-3">
        <span className="font-script -rotate-2 text-4xl leading-none text-brand-text @md:text-5xl">
          {card.note}
        </span>
        <span className="font-display text-3xl/tight text-balance @md:text-4xl">
          {card.tagline}
        </span>
      </figcaption>
    </figure>
  )
}

function FlowBand({ card }: { card: Card }) {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-3 rounded-2xl bg-muted/60 px-4 py-3 lg:hidden [@media(max-height:500px)]:hidden"
    >
      <Avatar card={card} className="size-10 text-lg" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            "truncate text-sm font-medium",
            !card.named && "text-muted-foreground"
          )}
        >
          {card.title}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {card.subtitle}
        </span>
      </span>
      <span className="flex gap-1.5">
        {card.rows.map((row) => (
          <Tick key={row.key} done={row.done} />
        ))}
      </span>
    </div>
  )
}

export function RegisterCard({ audience }: { audience: Audience }) {
  return <FlowCard card={useRegisterCard(audience)} />
}

export function RegisterBand({ audience }: { audience: Audience }) {
  return <FlowBand card={useRegisterCard(audience)} />
}

export function ResetCard() {
  return <FlowCard card={useResetCard()} />
}

export function ResetBand() {
  return <FlowBand card={useResetCard()} />
}
