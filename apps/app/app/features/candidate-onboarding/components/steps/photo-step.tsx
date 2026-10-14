import { useTranslation } from "@workspace/i18n/react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { FieldError } from "@workspace/ui/components/field"
import { Camera, CameraOff, ImageUp, RotateCcw, X } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

import { FileImage } from "@/components/file-image"
import { checkFile } from "@/lib/file-rules"

import { PHOTO } from "../../schemas/onboarding-form.schema"

// captured photos are square, which is how every avatar shows them
const SIZE = 720

type CameraState = "off" | "starting" | "live" | "denied" | "missing"

export function PhotoStep({
  photo,
  error,
  onChange,
}: {
  photo: File | null
  error?: string
  onChange: (file: File) => void
}) {
  const { t } = useTranslation("candidateOnboarding")
  const inputId = useId()
  const video = useRef<HTMLVideoElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const [camera, setCamera] = useState<CameraState>("off")
  const [problem, setProblem] = useState<string | null>(null)

  const release = () => {
    stream.current?.getTracks().forEach((track) => {
      track.stop()
    })
    stream.current = null
  }
  const stop = () => {
    release()
    setCamera("off")
  }

  // the camera light goes off when the step closes
  useEffect(() => release, [])

  const start = async () => {
    setProblem(null)
    if (!("mediaDevices" in navigator)) {
      setCamera("missing")
      return
    }
    setCamera("starting")
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 } },
        audio: false,
      })
      setCamera("live")
    } catch (err) {
      const name = err instanceof DOMException ? err.name : ""
      setCamera(
        name === "NotAllowedError" || name === "SecurityError"
          ? "denied"
          : "missing"
      )
    }
  }

  const capture = () => {
    const el = video.current
    if (!el?.videoWidth) return
    const side = Math.min(el.videoWidth, el.videoHeight)
    const canvas = document.createElement("canvas")
    canvas.width = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    // mirrored, as the person saw themselves
    ctx.translate(SIZE, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(
      el,
      (el.videoWidth - side) / 2,
      (el.videoHeight - side) / 2,
      side,
      side,
      0,
      0,
      SIZE,
      SIZE
    )
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        onChange(new File([blob], "profile_photo.jpg", { type: "image/jpeg" }))
        stop()
      },
      "image/jpeg",
      0.9
    )
  }

  const live = camera === "live" || camera === "starting"
  const shownError = live ? undefined : (problem ?? error)

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">{t("photo.lead")}</p>

      <div className="relative mx-auto aspect-square w-full max-w-72 overflow-hidden rounded-3xl bg-muted shadow-[0_12px_32px_-12px_rgb(15_23_42/0.25)]">
        {photo && !live ? (
          <Preview file={photo} />
        ) : live ? (
          <>
            <video
              ref={(el) => {
                video.current = el
                if (el && el.srcObject !== stream.current)
                  el.srcObject = stream.current
              }}
              autoPlay
              playsInline
              muted
              aria-label={t("photo.viewfinder")}
              className="size-full -scale-x-100 object-cover"
            />
            <Viewfinder />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("photo.cancel")}
              onClick={stop}
              className="bg-scrim text-on-media hover:bg-scrim hover:text-on-media absolute inset-e-3 top-3 rounded-full backdrop-blur-sm"
            >
              <X />
            </Button>
            <button
              type="button"
              aria-label={t("photo.take")}
              onClick={capture}
              disabled={camera !== "live"}
              className="group border-on-media/90 absolute inset-x-0 bottom-4 mx-auto grid size-14 place-items-center rounded-full border-[3px] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              <span className="bg-on-media size-10 rounded-full transition-transform duration-150 group-hover:scale-95 group-active:scale-85 motion-reduce:transition-none" />
            </button>
          </>
        ) : (
          <EmptyPhoto>{t("photo.empty")}</EmptyPhoto>
        )}
      </div>

      {camera === "denied" && (
        <Alert>
          <CameraOff />
          <AlertTitle>{t("photo.deniedTitle")}</AlertTitle>
          <AlertDescription>{t("photo.deniedBody")}</AlertDescription>
        </Alert>
      )}
      {camera === "missing" && (
        <Alert>
          <CameraOff />
          <AlertTitle>{t("photo.missingTitle")}</AlertTitle>
          <AlertDescription>{t("photo.missingBody")}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {!live && (
          <>
            <Button
              variant={photo ? "outline" : "default"}
              onClick={() => void start()}
            >
              {photo ? <RotateCcw /> : <Camera />}
              {photo ? t("photo.retake") : t("photo.useCamera")}
            </Button>
            <label
              htmlFor={inputId}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border bg-background px-2.5 text-sm font-medium hover:bg-muted has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
            >
              <ImageUp className="size-4" aria-hidden="true" />
              {t("photo.upload")}
              <input
                id={inputId}
                type="file"
                accept={PHOTO.accept.join(",")}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ""
                  if (!file) return
                  const bad = checkFile(file, PHOTO)
                  if (bad) {
                    setProblem(
                      bad.kind === "tooLarge"
                        ? t("photo.tooLarge")
                        : t("photo.wrongType")
                    )
                    return
                  }
                  setProblem(null)
                  onChange(file)
                }}
              />
            </label>
          </>
        )}
      </div>
      <FieldError className="text-center">{shownError}</FieldError>
    </div>
  )
}

function Preview({ file }: { file: File }) {
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
function Viewfinder() {
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
function EmptyPhoto({ children }: { children: string }) {
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
