import { useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { CircleAlert } from "lucide-react"
import { useId, useState } from "react"

import { FileDropzone } from "@/components/file-dropzone"
import { TextField } from "@/components/text-field"

import { JD_RULES } from "../../lib/employer-jobs"
import { JdFlowArt } from "../art/jd-art"

const HOW = ["upload", "read", "check"] as const

export function UploadStep({
  title,
  onTitle,
  jd,
  onJd,
  failed,
  onRead,
}: {
  title: string
  onTitle: (title: string) => void
  jd: File | null
  onJd: (file: File | null) => void
  failed: boolean
  onRead: (file: File, title: string) => void
}) {
  const { t } = useTranslation("jobs")
  const id = useId()
  const [missing, setMissing] = useState<"file" | "title" | null>(null)

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] lg:gap-8">
      <section
        aria-labelledby={id}
        className="settle flex flex-col gap-6 rounded-2xl border bg-card p-5 sm:p-6"
      >
        <div className="flex flex-col gap-1">
          <h2
            id={id}
            className="text-base font-semibold text-balance text-brand-text"
          >
            {t("post.upload.title")}
          </h2>
          <p className="text-sm text-pretty text-muted-foreground">
            {t("post.upload.body")}
          </p>
        </div>
        <TextField
          label={t("post.titleLabel")}
          hint={t("post.titleHint")}
          value={title}
          autoComplete="off"
          error={missing === "title" ? t("post.needTitle") : undefined}
          onChange={(event) => {
            onTitle(event.target.value)
            if (event.target.value.trim() && missing === "title")
              setMissing(null)
          }}
        />
        <FileDropzone
          label={t("post.jdLabel")}
          description={t("post.jdHint")}
          rules={JD_RULES}
          value={jd}
          error={missing === "file" ? t("post.needFile") : undefined}
          onSelect={(file) => {
            onJd(file)
            if (file) setMissing(null)
          }}
        />
        {failed && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{t("post.readFailed")}</AlertDescription>
          </Alert>
        )}
        <div className="border-t pt-5">
          <Button
            size="lg"
            onClick={() => {
              if (!title.trim()) {
                setMissing("title")
                return
              }
              if (!jd) {
                setMissing("file")
                return
              }
              onRead(jd, title.trim())
            }}
          >
            {t("post.read")}
          </Button>
        </div>
      </section>

      <aside
        aria-labelledby={`${id}-how`}
        className="settle flex flex-col gap-5 rounded-2xl border bg-muted/40 p-5 sm:p-6"
        style={{ transitionDelay: "80ms" }}
      >
        <div className="max-lg:hidden">
          <JdFlowArt />
        </div>
        <h2
          id={`${id}-how`}
          className="text-base font-semibold text-brand-text"
        >
          {t("post.how.title")}
        </h2>
        <ol className="flex flex-col gap-4">
          {HOW.map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-sm">
              <span
                aria-hidden="true"
                className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-muted text-xs font-semibold text-brand-text tabular-nums"
              >
                {i + 1}
              </span>
              <span className="pt-0.5 text-pretty">
                {t(`post.how.${step}`)}
              </span>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  )
}
