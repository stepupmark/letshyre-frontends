import { useTranslation } from "@workspace/i18n/react"
import { Input } from "@workspace/ui/components/input"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import { Monitor, Smartphone } from "lucide-react"
import * as m from "motion/react-m"
import { useDeferredValue, useId, useState } from "react"

import { duration, ease } from "@/lib/motion"

import { useEmailPreview } from "../../hooks/use-email-preview"
import { EmailFrame } from "./email-frame"

const DESKTOP = "desktop"
const PHONE = "phone"

export function EmailPreview({
  templateId,
  subject,
  body,
}: {
  templateId: string
  subject: string
  body: string
}) {
  const { t } = useTranslation("invitations")
  const [sample, setSample] = useState({
    candidate_name: t("preview.sampleName"),
    job_role: t("preview.sampleRole"),
  })
  const [device, setDevice] = useState(DESKTOP)
  const live = useDeferredValue({ subject, body })
  const preview = useEmailPreview({
    templateId,
    subject: live.subject,
    body: live.body,
    person: {
      candidate_name: sample.candidate_name.trim() || t("preview.sampleName"),
      job_role: sample.job_role.trim() || t("preview.sampleRole"),
    },
  })
  const { values, html } = preview

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <fieldset className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
          <legend className="sr-only">{t("preview.sampleLegend")}</legend>
          <SampleInput
            label={t("fields.candidate_name")}
            value={sample.candidate_name}
            onChange={(candidate_name) => {
              setSample((current) => ({ ...current, candidate_name }))
            }}
          />
          <SampleInput
            label={t("fields.job_role")}
            value={sample.job_role}
            onChange={(job_role) => {
              setSample((current) => ({ ...current, job_role }))
            }}
          />
        </fieldset>
        <ToggleGroup
          aria-label={t("preview.device")}
          value={[device]}
          onValueChange={(next) => {
            if (next[0]) setDevice(next[0])
          }}
          variant="outline"
        >
          <ToggleGroupItem value={DESKTOP} aria-label={t("preview.desktop")}>
            <Monitor />
          </ToggleGroupItem>
          <ToggleGroupItem value={PHONE} aria-label={t("preview.phone")}>
            <Smartphone />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 border-b px-4 py-3 text-sm">
          <dt className="text-muted-foreground">{t("preview.from")}</dt>
          <dd className="truncate">{values.employer_company_name}</dd>
          <dt className="text-muted-foreground">{t("preview.to")}</dt>
          <dd className="truncate">{values.candidate_name}</dd>
          <dt className="text-muted-foreground">{t("preview.subject")}</dt>
          <dd className="font-medium text-pretty">
            {preview.subject || t("preview.noSubject")}
          </dd>
        </dl>
        <div className="flex justify-center bg-muted/40 p-3">
          <m.div
            key={device}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: duration.base, ease }}
            data-device={device}
            className="w-full overflow-hidden rounded-md border bg-background data-[device=phone]:max-w-sm"
          >
            <EmailFrame html={html} title={t("preview.frame")} />
          </m.div>
        </div>
      </div>
    </div>
  )
}

function SampleInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </label>
      <Input
        id={id}
        value={value}
        autoComplete="off"
        onChange={(event) => {
          onChange(event.target.value)
        }}
      />
    </div>
  )
}
