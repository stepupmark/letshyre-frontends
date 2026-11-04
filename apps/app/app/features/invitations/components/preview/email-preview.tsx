import { useTranslation } from "@workspace/i18n/react"
import { Input } from "@workspace/ui/components/input"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import { useQuery } from "@tanstack/react-query"
import { Monitor, Smartphone } from "lucide-react"
import * as m from "motion/react-m"
import { useDeferredValue, useEffect, useId, useRef, useState } from "react"

import { duration, ease } from "@/lib/motion"

import { fillFields } from "../../lib/merge-fields"
import { previewDocument } from "../../lib/preview-html"
import { previewQuery } from "../../queries/templates.queries"

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
  const id = useId()
  const [sample, setSample] = useState({
    candidate_name: t("preview.sampleName"),
    job_role: t("preview.sampleRole"),
  })
  const [device, setDevice] = useState(DESKTOP)
  const server = useQuery(
    previewQuery(templateId, {
      candidate_name: t("preview.sampleName"),
      job_role: t("preview.sampleRole"),
    })
  )
  const live = useDeferredValue({ subject, body })
  const values = {
    employer_company_name: t("preview.sampleCompany"),
    sender_name: t("preview.sampleSender"),
    ...server.data?.merge_context,
    candidate_name: sample.candidate_name.trim() || t("preview.sampleName"),
    job_role: sample.job_role.trim() || t("preview.sampleRole"),
  }
  const html = previewDocument({
    body: live.body,
    values,
    frame: server.data && {
      html: server.data.preview_html,
      body: server.data.body_html,
    },
  })

  return (
    <section
      aria-labelledby={id}
      className="flex flex-col overflow-hidden rounded-lg border bg-card"
    >
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
        <h2 id={id} className="text-sm font-medium">
          {t("preview.title")}
        </h2>
        <ToggleGroup
          aria-label={t("preview.device")}
          value={[device]}
          onValueChange={(next) => {
            if (next[0]) setDevice(next[0])
          }}
          size="sm"
        >
          <ToggleGroupItem value={DESKTOP} aria-label={t("preview.desktop")}>
            <Monitor />
          </ToggleGroupItem>
          <ToggleGroupItem value={PHONE} aria-label={t("preview.phone")}>
            <Smartphone />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 border-b px-4 py-3 text-sm">
        <dt className="text-muted-foreground">{t("preview.from")}</dt>
        <dd className="truncate">{values.employer_company_name}</dd>
        <dt className="text-muted-foreground">{t("preview.to")}</dt>
        <dd className="truncate">{values.candidate_name}</dd>
        <dt className="text-muted-foreground">{t("preview.subject")}</dt>
        <dd className="font-medium text-pretty">
          {fillFields(live.subject, values, { html: false }) ||
            t("preview.noSubject")}
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

      <fieldset className="grid gap-3 border-t px-4 py-3 sm:grid-cols-2">
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
    </section>
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

/** Same-origin so the text can be swapped without a white flash; scripts still can't run. */
function EmailFrame({ html, title }: { html: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(480)

  useEffect(() => {
    const doc = frame.current?.contentDocument
    if (!doc) return
    const next = new DOMParser().parseFromString(html, "text/html")
    doc.replaceChild(
      doc.importNode(next.documentElement, true),
      doc.documentElement
    )
    // <html> never reports less than the frame, so the body is what shrinks with the text
    const observer = new ResizeObserver(() => {
      setHeight(doc.body.offsetHeight)
    })
    observer.observe(doc.body)
    return () => {
      observer.disconnect()
    }
  }, [html])

  return (
    <iframe
      ref={frame}
      title={title}
      sandbox="allow-same-origin"
      style={{ height }}
      className="pointer-events-none block w-full"
    />
  )
}
