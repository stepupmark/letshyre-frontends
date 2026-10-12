import { useTranslation } from "@workspace/i18n/react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { FieldError } from "@workspace/ui/components/field"
import { Camera, CameraOff, ImageUp, RotateCcw } from "lucide-react"
import { useCallback, useEffect, useId, useRef, useState } from "react"

import { checkFile, type FileRules } from "@/lib/file-rules"

const PHOTO: FileRules = {
  accept: [".jpg", ".jpeg", ".png", ".webp"],
  maxBytes: 10 * 1024 * 1024,
}
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
  onChange: (file: File | null) => void
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

      <div className="relative mx-auto aspect-square w-full max-w-72 overflow-hidden rounded-2xl bg-muted">
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
            {/* framing guide: head inside the oval, eyes on the line */}
            <svg
              viewBox="0 0 100 100"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full"
            >
              <defs>
                <mask id="frame">
                  <rect width="100" height="100" fill="white" />
                  <ellipse cx="50" cy="44" rx="25" ry="32" fill="black" />
                </mask>
              </defs>
              <rect
                width="100"
                height="100"
                fill="black"
                opacity="0.35"
                mask="url(#frame)"
              />
              <ellipse
                cx="50"
                cy="44"
                rx="25"
                ry="32"
                fill="none"
                stroke="white"
                strokeWidth="0.6"
                strokeDasharray="2 1.5"
              />
            </svg>
          </>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
            <Camera className="size-8" aria-hidden="true" />
            {t("photo.empty")}
          </div>
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
        {live ? (
          <>
            <Button onClick={capture} disabled={camera !== "live"}>
              <Camera />
              {t("photo.take")}
            </Button>
            <Button variant="outline" onClick={stop}>
              {t("photo.cancel")}
            </Button>
          </>
        ) : (
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
  return (
    <img
      ref={attach}
      alt={t("photo.previewAlt")}
      className="size-full object-cover"
    />
  )
}
