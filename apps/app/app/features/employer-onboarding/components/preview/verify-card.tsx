import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { Check } from "lucide-react"
import { useWatch, type UseFormReturn } from "react-hook-form"

import { useFieldValid } from "@/lib/use-field-valid"
import { mask } from "@/lib/company-ids"
import type { Values } from "../../schemas/onboarding-form.schema"

/** A certificate that collects a check for each number that passes. */
export function VerifyCard({ form }: { form: UseFormReturn<Values> }) {
  const { t } = useTranslation("onboarding")
  const isValid = useFieldValid(form)
  const [registration, pan, gst] = useWatch({
    control: form.control,
    name: ["company_registration_number", "pan_number", "gst_number"],
  })
  const rows = [
    {
      label: t("fields.registration"),
      value: registration,
      ok: isValid("company_registration_number"),
    },
    { label: t("fields.pan"), value: pan, ok: isValid("pan_number") },
    { label: t("fields.gst"), value: gst, ok: isValid("gst_number") },
  ]
  const passed = rows.filter((row) => row.ok).length

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-[0_12px_32px_-12px_rgb(15_23_42/0.18)]">
      <CertificateArt passed={passed} total={rows.length} />
      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-3 text-sm">
            <span
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-full border transition-colors duration-300",
                row.ok && "border-success bg-success text-background"
              )}
            >
              {row.ok && <Check className="pop size-3" strokeWidth={3} />}
            </span>
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              {row.label}
            </span>
            {row.value ? (
              <span className="font-mono text-xs tracking-wider tabular-nums">
                {mask(row.value)}
              </span>
            ) : (
              <span className="h-2.5 w-16 rounded-full bg-muted-foreground/15" />
            )}
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        {t("preview.legal.caption")}
      </p>
    </div>
  )
}

function CertificateArt({ passed, total }: { passed: number; total: number }) {
  const done = passed === total
  return (
    <svg viewBox="0 0 280 120" aria-hidden="true" className="w-full">
      <rect
        x={24}
        y={12}
        width={180}
        height={100}
        rx={10}
        className="fill-muted/50 stroke-border"
      />
      <rect
        x={36}
        y={24}
        width={156}
        height={76}
        rx={6}
        strokeDasharray="4 4"
        className="fill-none stroke-muted-foreground/25"
      />
      <rect
        x={52}
        y={38}
        width={88}
        height={7}
        rx={3.5}
        className="fill-foreground/50"
      />
      {[56, 70, 84].map((y, i) => (
        <rect
          key={y}
          x={52}
          y={y}
          width={[120, 96, 72][i]}
          height={6}
          rx={3}
          className={cn(
            "transition-[fill] duration-500",
            i < passed ? "fill-brand/45" : "fill-muted-foreground/20"
          )}
        />
      ))}
      <g transform="translate(214 66)">
        <circle
          r={30}
          className={cn(
            "transition-[fill] duration-500",
            done ? "fill-success/15" : "fill-brand-muted"
          )}
        />
        {passed > 0 && (
          <circle
            r={30}
            pathLength={1}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${passed / total} 1`}
            transform="rotate(-90)"
            className={cn(
              "fill-none transition-[stroke-dasharray,stroke] duration-500 ease-out",
              done ? "stroke-success" : "stroke-brand"
            )}
          />
        )}
        <path
          key={String(done)}
          d="M-10 0 L-3 7 L11 -8"
          pathLength={1}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "fill-none",
            done ? "draw stroke-success" : "stroke-brand/30"
          )}
        />
      </g>
    </svg>
  )
}
