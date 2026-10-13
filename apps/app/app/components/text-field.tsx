import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { Check, Eye, EyeOff } from "lucide-react"
import { useId, useState, type ComponentProps, type ReactNode } from "react"

type InputProps = Omit<ComponentProps<"input">, "id">

interface FieldProps {
  label: ReactNode
  error?: string
  hint?: ReactNode
  /** sits on the label's row, e.g. a "Forgot password?" link */
  labelAside?: ReactNode
}

/** Label above, hint and error below, wired up for screen readers. */
export function TextField({
  label,
  error,
  hint,
  labelAside,
  valid = false,
  className,
  ...input
}: FieldProps & InputProps & { valid?: boolean }) {
  const id = useId()
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldRow id={id} label={label} aside={labelAside} />
      <div className="relative">
        <Input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, error, hint)}
          className={cn(valid && "pe-9", className)}
          {...input}
        />
        {valid && (
          <Check
            aria-hidden="true"
            strokeWidth={2.5}
            className="pop pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-success"
          />
        )}
      </div>
      <FieldFooter id={id} error={error} hint={hint} />
    </Field>
  )
}

/** Password with show/hide and a Caps Lock warning. Paste is always allowed. */
export function PasswordField({
  label,
  error,
  hint,
  labelAside,
  ...input
}: FieldProps & InputProps) {
  const { t } = useTranslation("common")
  const id = useId()
  const [shown, setShown] = useState(false)
  const [caps, setCaps] = useState(false)
  const syncCaps = (event: React.KeyboardEvent) => {
    setCaps(event.getModifierState("CapsLock"))
  }

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldRow id={id} label={label} aside={labelAside} />
      <InputGroup>
        <InputGroupInput
          id={id}
          type={shown ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, error, hint)}
          onKeyDown={syncCaps}
          onKeyUp={syncCaps}
          {...input}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={shown ? t("password.hide") : t("password.show")}
            aria-pressed={shown}
            onClick={() => {
              setShown((value) => !value)
            }}
          >
            {shown ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {caps && (
        <p role="status" className="text-sm text-muted-foreground">
          {t("password.capsLock")}
        </p>
      )}
      <FieldFooter id={id} error={error} hint={hint} />
    </Field>
  )
}

const describedBy = (id: string, error?: string, hint?: ReactNode) =>
  [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ") || undefined

function FieldRow({
  id,
  label,
  aside,
}: {
  id: string
  label: ReactNode
  aside?: ReactNode
}) {
  return aside ? (
    <div className="flex items-baseline justify-between gap-3">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {aside}
    </div>
  ) : (
    <FieldLabel htmlFor={id}>{label}</FieldLabel>
  )
}

function FieldFooter({
  id,
  error,
  hint,
}: {
  id: string
  error?: string
  hint?: ReactNode
}) {
  return (
    <>
      {hint && <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription>}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </>
  )
}
