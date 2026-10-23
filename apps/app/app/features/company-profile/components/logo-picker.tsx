import { useTranslation } from "@workspace/i18n/react"
import {
  Field,
  FieldDescription,
  FieldError,
} from "@workspace/ui/components/field"
import { ImageUp } from "lucide-react"
import { useId, type Ref } from "react"

import { checkFile, type FileRules } from "@/lib/file-rules"

import { CompanyLogo } from "./parts"

const LOGO: FileRules = {
  accept: [".jpg", ".jpeg", ".png", ".webp"],
  maxBytes: 5 * 1024 * 1024,
}

export function LogoPicker({
  current,
  file,
  error,
  inputRef,
  onPick,
}: {
  current: string | null
  file: File | null
  error: string | null
  inputRef: Ref<HTMLInputElement>
  onPick: (file: File | null, problem: string | null) => void
}) {
  const { t } = useTranslation("company")
  const id = useId()
  return (
    <Field data-invalid={Boolean(error)}>
      <div className="flex flex-wrap items-center gap-4">
        <CompanyLogo src={current} file={file} />
        <div className="flex flex-col items-start gap-1.5">
          <label
            htmlFor={id}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
          >
            <ImageUp aria-hidden="true" className="size-4" />
            {current || file ? t("logo.replace") : t("logo.upload")}
            <input
              ref={inputRef}
              id={id}
              type="file"
              accept={LOGO.accept.join(",")}
              className="sr-only"
              aria-describedby={`${id}-hint`}
              aria-invalid={Boolean(error)}
              onChange={(event) => {
                const picked = event.target.files?.[0] ?? null
                if (!picked) return
                const problem = checkFile(picked, LOGO)
                onPick(
                  picked,
                  problem
                    ? problem.kind === "tooLarge"
                      ? t("logo.tooLarge")
                      : t("logo.wrongType")
                    : null
                )
              }}
            />
          </label>
          <FieldDescription id={`${id}-hint`}>
            {t("logo.hint")}
          </FieldDescription>
        </div>
      </div>
      <FieldError>{error}</FieldError>
    </Field>
  )
}
