import { useTranslation } from "@workspace/i18n/react"

import { FileImage } from "@/components/file-image"

export function Preview({ file }: { file: File }) {
  const { t } = useTranslation("candidateOnboarding")
  return (
    <>
      <FileImage
        file={file}
        alt={t("photo.previewAlt")}
        className="size-full object-cover motion-safe:animate-in motion-safe:duration-500 motion-safe:fade-in motion-safe:zoom-in-105"
      />
      {/* how it shows up as an avatar */}
      <span
        aria-hidden="true"
        className="border-on-media absolute inset-e-3 bottom-3 size-14 overflow-hidden rounded-full border-[3px] shadow-lg"
      >
        <FileImage file={file} className="size-full object-cover" />
      </span>
    </>
  )
}

/** Corner marks and a faint thirds grid, like a camera screen. */
export function Viewfinder() {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="text-on-media pointer-events-none absolute inset-0 size-full"
    >
      <g stroke="currentColor" strokeOpacity={0.18} strokeWidth={0.3}>
        <line x1={33.3} y1={0} x2={33.3} y2={100} />
        <line x1={66.6} y1={0} x2={66.6} y2={100} />
        <line x1={0} y1={33.3} x2={100} y2={33.3} />
        <line x1={0} y1={66.6} x2={100} y2={66.6} />
      </g>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 12 H14 Q12 12 12 14 V22" />
        <path d="M78 12 H86 Q88 12 88 14 V22" />
        <path d="M22 88 H14 Q12 88 12 86 V78" />
        <path d="M78 88 H86 Q88 88 88 86 V78" />
      </g>
      <circle
        cx={16}
        cy={18}
        r={1.4}
        className="animate-pulse fill-destructive motion-reduce:animate-none"
      />
    </svg>
  )
}

/** Before any photo: a portrait outline with a camera badge. */
export function EmptyPhoto({ children }: { children: string }) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-muted-foreground/20 bg-[radial-gradient(circle_at_50%_40%,var(--brand-muted),transparent_70%)] p-6 text-center text-sm text-muted-foreground">
      <svg viewBox="0 0 96 96" aria-hidden="true" className="size-24">
        <circle
          cx={48}
          cy={48}
          r={44}
          className="fill-card stroke-brand/25"
          strokeWidth={2}
          strokeDasharray="5 5"
        />
        <circle cx={48} cy={38} r={14} className="fill-brand/20" />
        <path
          d="M22 80 C24 62 36 56 48 56 C60 56 72 62 74 80 A44 44 0 0 1 22 80 Z"
          className="fill-brand/20"
        />
        <g transform="translate(66 64)">
          <circle
            cx={10}
            cy={10}
            r={12}
            className="fill-brand stroke-card"
            strokeWidth={3}
          />
          <path
            d="M4.5 7.5 h3 l1.5 -2 h2 l1.5 2 h3 v8 h-11 z"
            className="stroke-on-media fill-none"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          <circle
            cx={10}
            cy={11.5}
            r={2.2}
            className="stroke-on-media fill-none"
            strokeWidth={1.5}
          />
        </g>
      </svg>
      <p className="max-w-52 text-pretty">{children}</p>
    </div>
  )
}
