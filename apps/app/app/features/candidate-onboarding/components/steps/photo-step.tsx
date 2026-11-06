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

import { checkFile } from "@/lib/file-rules"

import { PHOTO } from "../../schemas/onboarding-form.schema"
import { EmptyPhoto, Preview, Viewfinder } from "./photo-parts"

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

      <div className="relative mx-auto aspect-square w-full max-w-72 overflow-hidden rounded-3xl bg-muted">
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
