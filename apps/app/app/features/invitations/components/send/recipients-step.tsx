import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Textarea } from "@workspace/ui/components/textarea"
import { FileUp, UserPlus } from "lucide-react"
import { useId, useRef, useState, type ReactNode } from "react"

import { TextField } from "@/components/text-field"

import {
  addRecipients,
  parseRecipients,
  type Recipient,
} from "../../lib/recipients"
import { RecipientList } from "./recipient-list"

const CSV_LIMIT = 1024 * 1024
const PLAIN_TEXT = "text"

interface Report {
  added: number
  duplicates: number
  invalid: string[]
}

export function RecipientsStep({
  recipients,
  role,
  roles,
  errors,
  onRecipients,
  onRole,
  children,
}: {
  recipients: Recipient[]
  role: string
  roles: string[]
  errors: { recipients?: string; role?: string }
  onRecipients: (next: Recipient[]) => void
  onRole: (role: string) => void
  /** shown above the fields, e.g. the chosen template */
  children?: ReactNode
}) {
  const { t } = useTranslation("invitations")
  const id = useId()
  const file = useRef<HTMLInputElement>(null)
  const [text, setText] = useState("")
  const [report, setReport] = useState<Report | null>(null)

  const add = (input: string) => {
    const { found, invalid } = parseRecipients(input)
    const result = addRecipients(recipients, found)
    onRecipients(result.list)
    setReport({ added: result.added, duplicates: result.duplicates, invalid })
    setText(invalid.join("\n"))
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
      <div className="flex min-w-0 flex-col gap-6">
        {children}
        <TextField
          label={t("send.role")}
          hint={t("send.roleHint")}
          value={role}
          list={`${id}-roles`}
          autoComplete="off"
          error={errors.role}
          onChange={(event) => {
            onRole(event.target.value)
          }}
        />
        <datalist id={`${id}-roles`}>
          {roles.map((title) => (
            <option key={title} value={title} />
          ))}
        </datalist>

        <Field data-invalid={Boolean(errors.recipients)}>
          <FieldLabel htmlFor={`${id}-paste`}>{t("send.paste")}</FieldLabel>
          <div
            className="overflow-hidden rounded-lg border border-input transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 data-[invalid=true]:border-destructive"
            data-invalid={Boolean(errors.recipients)}
          >
            <Textarea
              id={`${id}-paste`}
              value={text}
              rows={6}
              placeholder={t("send.pastePlaceholder")}
              aria-describedby={`${id}-paste-hint`}
              className="resize-none rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
              onChange={(event) => {
                setText(event.target.value)
              }}
              onPaste={(event) => {
                const pasted = event.clipboardData.getData(PLAIN_TEXT)
                if (!pasted.includes("@")) return
                event.preventDefault()
                add(`${text}\n${pasted}`)
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
                className="text-muted-foreground"
                onClick={() => file.current?.click()}
              >
                <FileUp />
                {t("send.upload")}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!text.trim()}
                onClick={() => {
                  add(text)
                }}
              >
                <UserPlus />
                {t("send.add")}
              </Button>
            </div>
          </div>
          <input
            ref={file}
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              const picked = event.target.files?.[0]
              event.target.value = ""
              if (!picked) return
              if (picked.size > CSV_LIMIT) {
                setReport({
                  added: 0,
                  duplicates: 0,
                  invalid: [t("send.fileTooLarge")],
                })
                return
              }
              void picked.text().then(add)
            }}
          />
          <FieldDescription id={`${id}-paste-hint`}>
            {t("send.pasteHint")}
          </FieldDescription>
          <p
            aria-live="polite"
            className="text-sm text-muted-foreground tabular-nums empty:hidden"
          >
            {report &&
              [
                t("send.reportAdded", { count: report.added }),
                report.duplicates > 0 &&
                  t("send.reportDuplicates", { count: report.duplicates }),
                report.invalid.length > 0 &&
                  t("send.reportInvalid", { count: report.invalid.length }),
              ]
                .filter(Boolean)
                .join(" · ")}
          </p>
          <FieldError>{errors.recipients}</FieldError>
        </Field>
      </div>

      <RecipientList recipients={recipients} onChange={onRecipients} />
    </div>
  )
}
