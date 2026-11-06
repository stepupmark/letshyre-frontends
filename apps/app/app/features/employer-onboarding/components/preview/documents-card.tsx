import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { Check, FileText, ImageIcon } from "lucide-react"
import { useWatch, type Control } from "react-hook-form"

import { DOCUMENTS, type Values } from "../../schemas/onboarding-form.schema"

/** A folder whose four slots fill as documents are added. */
export function DocumentsCard({ control }: { control: Control<Values> }) {
  const { t } = useTranslation("onboarding")
  const files = useWatch({
    control,
    name: DOCUMENTS.map((doc) => doc.name),
  })
  const added = files.filter((file) => file instanceof File).length

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
      <FolderArt filled={files.map((file) => file instanceof File)} />
      <ul className="flex flex-col gap-2.5">
        {DOCUMENTS.map(({ name }, i) => {
          const done = files[i] instanceof File
          const Icon = name === "company_logo" ? ImageIcon : FileText
          return (
            <li key={name} className="flex items-center gap-3 text-sm">
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors duration-300",
                  done ? "text-brand" : "text-muted-foreground/60"
                )}
              />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate",
                  !done && "text-muted-foreground"
                )}
              >
                {t(`documents.${name}.label`)}
              </span>
              {done && (
                <Check className="pop size-4 text-success" strokeWidth={2.5} />
              )}
            </li>
          )
        })}
      </ul>
      <div className="flex flex-col gap-2 border-t pt-4">
        <p className="text-sm font-medium tabular-nums">
          {t("preview.documents.caption", {
            count: added,
            total: DOCUMENTS.length,
          })}
        </p>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full origin-left rounded-full bg-brand transition-transform duration-500 ease-out motion-reduce:transition-none rtl:origin-right"
            style={{ transform: `scaleX(${added / DOCUMENTS.length})` }}
          />
        </div>
      </div>
    </div>
  )
}

const SLOTS = [
  { x: 56, rotate: -8 },
  { x: 100, rotate: -3 },
  { x: 144, rotate: 3 },
  { x: 188, rotate: 8 },
]

function FolderArt({ filled }: { filled: boolean[] }) {
  return (
    <svg viewBox="0 0 280 130" aria-hidden="true" className="w-full">
      <path
        d="M30 34 a8 8 0 0 1 8 -8 h52 l12 12 h140 a8 8 0 0 1 8 8 v70 a8 8 0 0 1 -8 8 h-204 a8 8 0 0 1 -8 -8 z"
        className="fill-brand-muted stroke-brand/25"
      />
      {SLOTS.map(({ x, rotate }, i) => {
        const done = filled[i] ?? false
        return (
          <g
            key={x}
            style={{
              transform: `translate(${x}px, ${done ? 22 : 40}px) rotate(${rotate}deg)`,
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
            className="transition-transform duration-500 ease-out motion-reduce:transition-none"
          >
            <rect
              width={36}
              height={48}
              rx={5}
              className={cn(
                "stroke-border transition-[fill] duration-300",
                done ? "fill-card" : "fill-muted"
              )}
            />
            <rect
              x={7}
              y={10}
              width={done ? 22 : 16}
              height={4}
              rx={2}
              className={
                done ? "fill-foreground/45" : "fill-muted-foreground/25"
              }
            />
            <rect
              x={7}
              y={19}
              width={18}
              height={4}
              rx={2}
              className="fill-muted-foreground/20"
            />
            {done && (
              <g className="pop">
                <circle cx={28} cy={40} r={7} className="fill-success" />
                <path
                  d="M24.5 40 l2.5 2.5 l4.5 -5"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="fill-none stroke-background"
                />
              </g>
            )}
          </g>
        )
      })}
      <path
        d="M22 70 a8 8 0 0 1 8 -8 h220 a8 8 0 0 1 8 8 l-6 46 a8 8 0 0 1 -8 7 h-208 a8 8 0 0 1 -8 -7 z"
        className="fill-card stroke-border"
      />
      <rect
        x={118}
        y={86}
        width={44}
        height={6}
        rx={3}
        className="fill-brand/30"
      />
    </svg>
  )
}
