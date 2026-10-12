import { useTranslation } from "@workspace/i18n/react"

import { useFlowData } from "../../hooks/use-flow"
import { ROLE_OF, type Audience } from "../../lib/audience"
import { FORGOT_FLOW } from "../../lib/forgot"
import { companyFromEmail, initialsOf } from "../../lib/identity"
import { maskEmail, maskPhone } from "../../lib/mask"
import { registerFlowName } from "../../lib/register"
import type { ForgotAnswers, RegisterAnswers } from "../../types"
import { Lock, ProfileCard, Rows, type Row } from "./flow-art"

/** The account being made, filling in as each step is done. */
export function useRegisterScene(audience: Audience) {
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
    note: t(`live.note.${note}`),
    tagline: t(`art.${audience}.tagline`),
    scene: (
      <ProfileCard
        initials={initialsOf(name)}
        title={name || t("live.yourName")}
        named={Boolean(name)}
        subtitle={
          audience === "employer"
            ? (company ?? t("live.yourCompany"))
            : t("live.jobSeeker")
        }
        rows={rows}
        welcome={data.done ? t("live.welcome") : null}
      />
    ),
  }
}

/** A lock that opens once the code checks out. */
export function useResetScene() {
  const { t } = useTranslation("auth")
  const data = useFlowData<ForgotAnswers>(FORGOT_FLOW)
  const rows: Row[] = [
    { key: "sent", done: Boolean(data.key), label: t("reset.codeSent") },
    {
      key: "checked",
      done: Boolean(data.verified),
      label: t("reset.codeChecked"),
    },
    { key: "saved", done: false, label: t("reset.saved") },
  ]

  return {
    note: t("reset.note"),
    tagline: t("reset.tagline"),
    scene: (
      <div className="flex flex-col items-center gap-8">
        <Lock open={Boolean(data.verified)} sent={Boolean(data.key)} />
        <div className="settle w-full max-w-sm rounded-3xl border bg-card p-6 shadow-[0_10px_30px_rgb(15_23_42/0.07)] delay-150">
          <p className="text-sm font-medium">{t("reset.title")}</p>
          <p className="truncate text-sm text-muted-foreground">
            {data.email ? maskEmail(data.email) : t("fields.email")}
          </p>
          <Rows rows={rows} />
        </div>
      </div>
    ),
  }
}
