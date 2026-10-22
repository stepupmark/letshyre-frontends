import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { TicketPercent, X } from "lucide-react"
import { useId, useState } from "react"

import type { Checkout } from "../../mutations/use-checkout"

const COUPON = /^[A-Za-z0-9_-]{1,32}$/

export function Coupon({ checkout }: { checkout: Checkout }) {
  const { t } = useTranslation("billing")
  const id = useId()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const shown = error ?? checkout.rejected

  if (checkout.coupon)
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg bg-success-muted px-3 py-2 text-sm text-success">
        <span className="flex items-center gap-2">
          <TicketPercent className="size-4" aria-hidden="true" />
          {t("checkout.coupon.applied", { code: checkout.coupon })}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("checkout.coupon.remove", { code: checkout.coupon })}
          onClick={() => {
            setCode("")
            checkout.applyCoupon(null)
          }}
        >
          <X />
        </Button>
      </div>
    )

  if (!open)
    return (
      <Button
        variant="link"
        className="self-start px-0"
        onClick={() => {
          setOpen(true)
        }}
      >
        {t("checkout.coupon.toggle")}
      </Button>
    )

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const value = code.trim()
        if (!COUPON.test(value)) {
          setError(
            value ? t("checkout.coupon.invalid") : t("checkout.coupon.required")
          )
          return
        }
        setError(null)
        checkout.applyCoupon(value.toUpperCase())
      }}
    >
      <Field data-invalid={Boolean(shown)}>
        <FieldLabel htmlFor={id}>{t("checkout.coupon.label")}</FieldLabel>
        <div className="flex gap-2">
          <Input
            id={id}
            value={code}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={Boolean(shown)}
            aria-describedby={shown ? `${id}-error` : undefined}
            onChange={(event) => {
              setCode(event.target.value)
            }}
          />
          <Button
            type="submit"
            variant="outline"
            disabled={checkout.quote.isFetching}
          >
            {t("checkout.coupon.apply")}
          </Button>
        </div>
        <FieldError id={`${id}-error`}>{shown}</FieldError>
      </Field>
    </form>
  )
}
