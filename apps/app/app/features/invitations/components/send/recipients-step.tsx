import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Textarea } from "@workspace/ui/components/textarea"
import { FileUp, UserPlus } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useId, useRef, useState } from "react"

import { Shake } from "@/components/motion/shake"
import { TextField } from "@/components/text-field"
import { checkFile } from "@/lib/file-rules"
import { duration, ease } from "@/lib/motion"

import { useFileDrop } from "../../hooks/use-file-drop"
import { RECIPIENT_FILE } from "../../lib/limits"
import {
  addRecipients,
  parseRecipients,
  type Recipient,
} from "../../lib/recipients"
import { RecipientList } from "./recipient-list"

const SUGGESTIONS = 6
const ENTER = "Enter"

interface Report {
  added: number
  duplicates: number
  invalid: number
  at: number
}

export function RecipientsStep({
  recipients,
  role,
  roles,
  errors,
  onRecipients,
  onRole,
}: {
  recipients: Recipient[]
  role: string
  roles: string[]
  errors: { recipients?: string; role?: string }
  onRecipients: (next: Recipient[]) => void
  onRole: (role: string) => void
}) {
  const { t } = useTranslation("invitations")
  const id = useId()
  const file = useRef<HTMLInputElement>(null)
  const [text, setText] = useState("")
  const [report, setReport] = useState<Report | null>(null)
  const [fileError, setFileError] = useState<string>()
  const [repeated, setRepeated] = useState<{ emails: string[]; at: number }>()

  const typed = role.trim().toLocaleLowerCase()
  const suggestions = roles
    .filter((title) => !typed || title.toLocaleLowerCase().includes(typed))
    .slice(0, SUGGESTIONS)

  const add = (input: string, keep = "") => {
    const { found, invalid } = parseRecipients(input)
    const known = new Set(recipients.map((r) => r.email.toLowerCase()))
    const result = addRecipients(recipients, found)
    const at = Date.now()
    onRecipients(result.list)
    setReport({
      added: result.added,
      duplicates: result.duplicates,
      invalid: invalid.length,
      at,
    })
    setRepeated({
      emails: found
        .map((r) => r.email.toLowerCase())
        .filter((email) => known.has(email)),
      at,
    })
    setText([keep.trim(), ...invalid].filter(Boolean).join("\n"))
  }

  const importFile = async (picked: File | undefined) => {
    setFileError(undefined)
    if (!picked) return
    const problem = checkFile(picked, RECIPIENT_FILE)
    if (problem) {
      setFileError(
        problem.kind === "tooLarge"
          ? t("send.fileTooLarge")
          : t("send.fileWrongType")
      )
      return
    }
    try {
      add(await picked.text(), text)
    } catch {
      setFileError(t("send.fileUnreadable"))
    }
  }

  const { dragging, zone } = useFileDrop((picked) => {
    void importFile(picked)
  })
  const problem = errors.recipients ?? fileError

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <TextField
          label={t("send.role")}
          value={role}
          autoComplete="off"
          error={errors.role}
          onChange={(event) => {
            onRole(event.target.value)
          }}
        />
        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {suggestions.map((title) => (
              <Button
                key={title}
                type="button"
                variant="outline"
                size="sm"
                aria-pressed={role.trim() === title}
                className="font-normal aria-pressed:border-brand aria-pressed:bg-brand-muted aria-pressed:text-brand-text max-md:h-11"
                onClick={() => {
                  onRole(title)
                }}
              >
                {title}
              </Button>
            ))}
          </div>
        )}
      </div>

      <Field data-invalid={Boolean(problem)}>
        <FieldLabel htmlFor={`${id}-paste`}>{t("send.paste")}</FieldLabel>
        <Shake error={report?.invalid ? String(report.at) : fileError}>
          <div
            data-invalid={Boolean(problem)}
            data-dragging={dragging}
            ref={zone}
            className="relative overflow-hidden rounded-lg border border-input transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 data-[dragging=true]:border-dashed data-[dragging=true]:border-brand data-[invalid=true]:border-destructive"
          >
            <Textarea
              id={`${id}-paste`}
              value={text}
              rows={5}
              dir="ltr"
              placeholder={t("send.pastePlaceholder")}
              aria-keyshortcuts={ENTER}
              className="resize-none rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
              onChange={(event) => {
                setText(event.target.value)
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" || event.shiftKey || !text.trim())
                  return
                event.preventDefault()
                add(text)
              }}
            />
            <div className="flex items-center justify-between gap-2 border-t bg-muted/30 px-2 py-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground max-md:h-11"
                onClick={() => file.current?.click()}
              >
                <FileUp />
                {t("send.import")}
              </Button>
              <Button
                type="button"
                size="sm"
                className="max-md:h-11"
                disabled={!text.trim()}
                onClick={() => {
                  add(text)
                }}
              >
                <UserPlus />
                {t("send.add")}
                <kbd
                  aria-hidden="true"
                  className="font-sans text-xs opacity-70 max-md:hidden"
                >
                  ↵
                </kbd>
              </Button>
            </div>
            <AnimatePresence>
              {dragging && (
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: duration.fast, ease }}
                  className="pointer-events-none absolute inset-0 grid place-items-center bg-brand-muted/90 text-sm font-medium text-brand-text"
                >
                  <span className="flex items-center gap-2">
                    <FileUp aria-hidden="true" className="size-4" />
                    {t("send.dropHere")}
                  </span>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </Shake>
        <input
          ref={file}
          type="file"
          accept={RECIPIENT_FILE.accept.join(",")}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            const picked = event.target.files?.[0]
            event.target.value = ""
            void importFile(picked)
          }}
        />
        <p
          aria-live="polite"
          className="text-sm text-muted-foreground tabular-nums empty:hidden"
        >
          {report &&
            [
              t("send.reportAdded", { count: report.added }),
              report.duplicates > 0 &&
                t("send.reportRepeat", { count: report.duplicates }),
              report.invalid > 0 &&
                t("send.reportUnread", { count: report.invalid }),
            ]
              .filter(Boolean)
              .join(" · ")}
        </p>
        <FieldError>{problem}</FieldError>
      </Field>

      <RecipientList
        recipients={recipients}
        repeated={repeated}
        onChange={onRecipients}
      />
    </div>
  )
}
