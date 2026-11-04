import { useTranslation } from "@workspace/i18n/react"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"
import * as m from "motion/react-m"
import { useId } from "react"

import { TextField } from "@/components/text-field"
import { duration, ease } from "@/lib/motion"

import { INVITE_HREF } from "../../lib/link"

const INVITE = "invite"
const WEB = "web"

/** Where a link or button goes: the candidate's invite link, or a web address. */
export function LinkTarget({
  href,
  error,
  onChange,
}: {
  href: string
  error?: string
  onChange: (href: string) => void
}) {
  const { t } = useTranslation("invitations")
  const id = useId()
  const invite = href === INVITE_HREF
  const options = [
    { value: INVITE, label: t("link.invite") },
    { value: WEB, label: t("link.web") },
  ]
  return (
    <div className="flex flex-col gap-3">
      <RadioGroup
        aria-label={t("link.target")}
        value={invite ? INVITE : WEB}
        onValueChange={(value) => {
          onChange(value === INVITE ? INVITE_HREF : "")
        }}
        className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="group relative flex cursor-pointer items-center justify-center rounded-md px-3 py-1.5 text-sm text-muted-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-data-checked:text-foreground"
          >
            {(option.value === INVITE) === invite && (
              <m.span
                layoutId={id}
                aria-hidden="true"
                transition={{ duration: duration.base, ease }}
                className="absolute inset-0 rounded-md border bg-background"
              />
            )}
            <RadioGroupItem value={option.value} className="sr-only" />
            <span className="relative font-medium">{option.label}</span>
          </label>
        ))}
      </RadioGroup>
      {invite ? (
        <p className="text-sm text-pretty text-muted-foreground">
          {t("link.inviteHint")}
        </p>
      ) : (
        <TextField
          label={t("link.url")}
          type="url"
          inputMode="url"
          placeholder={t("link.urlPlaceholder")}
          value={href}
          error={error}
          autoComplete="off"
          onChange={(event) => {
            onChange(event.target.value.trim())
          }}
        />
      )}
    </div>
  )
}
