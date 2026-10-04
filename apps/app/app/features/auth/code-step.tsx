import { Trans, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp"
import { Spinner } from "@workspace/ui/components/spinner"
import { useMutation } from "@tanstack/react-query"
import { useEffect, useId, useState } from "react"

import { Shake } from "@/components/motion/shake"

import { authErrorKey, type AuthErrorKey } from "./errors"

const LENGTH = 6
const RESEND_AFTER = 30
const MAX_TRIES = 5
const DIGITS = "^[0-9]+$"

/**
 * Enter a code sent by email or SMS. Paste and one-time-code autofill work;
 * the last digit submits. A rejected code isn't retried until it changes.
 */
export function CodeStep({
  destination,
  hint,
  onChangeDestination,
  verify,
  resend,
  onVerified,
  onLost,
}: {
  destination: string
  hint?: string
  onChangeDestination: () => void
  verify: (code: string) => Promise<unknown>
  resend: () => Promise<unknown>
  onVerified: () => void
  /** the code's session is gone; the flow should start again */
  onLost: (key: AuthErrorKey) => void
}) {
  const { t } = useTranslation("auth")
  const id = useId()
  const [code, setCode] = useState("")
  const [tried, setTried] = useState<string | null>(null)
  const [failures, setFailures] = useState(0)
  const [error, setError] = useState<AuthErrorKey | null>(null)
  const [wait, setWait] = useState(RESEND_AFTER)
  const [notice, setNotice] = useState(false)
  const locked = failures >= MAX_TRIES

  useEffect(() => {
    if (wait <= 0) return
    const timer = setTimeout(() => {
      setWait((s) => s - 1)
    }, 1000)
    return () => {
      clearTimeout(timer)
    }
  }, [wait])

  const check = useMutation({
    mutationFn: verify,
    onSuccess: onVerified,
    onError: (err) => {
      const key = authErrorKey(err, "errors.otpIncorrect")
      if (key === "errors.otpSessionInvalid") {
        onLost(key)
        return
      }
      setError(key)
      if (key === "errors.otpIncorrect") setFailures((n) => n + 1)
    },
  })

  const again = useMutation({
    mutationFn: resend,
    onSuccess: () => {
      setCode("")
      setTried(null)
      setFailures(0)
      setError(null)
      setWait(RESEND_AFTER)
      setNotice(true)
    },
    onError: (err) => {
      setError(authErrorKey(err, "errors.sendFailed"))
    },
  })

  const submit = (value: string) => {
    if (value.length !== LENGTH || locked || check.isPending) return
    setTried(value)
    setError(null)
    setNotice(false)
    check.mutate(value)
  }

  const message = locked ? t("code.locked") : error ? t(error) : undefined

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        submit(code)
      }}
    >
      <p className="text-sm text-muted-foreground">
        <Trans
          t={t}
          i18nKey="code.sentTo"
          values={{ destination }}
          components={{
            strong: <strong className="font-medium text-foreground" />,
          }}
        />{" "}
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 align-baseline"
          onClick={onChangeDestination}
        >
          {t("code.change")}
        </Button>
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {t("code.label")}
        </label>
        <Shake error={message}>
          <InputOTP
            id={id}
            maxLength={LENGTH}
            pattern={DIGITS}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            value={code}
            disabled={locked}
            aria-invalid={Boolean(message)}
            aria-describedby={message ? `${id}-error` : `${id}-hint`}
            onChange={(value) => {
              setCode(value)
              if (error === "errors.otpIncorrect") setError(null)
            }}
            onComplete={(value: string) => {
              if (value !== tried) submit(value)
            }}
          >
            <InputOTPGroup>
              {Array.from({ length: LENGTH }, (_, i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  aria-invalid={Boolean(message)}
                  className="size-11 text-lg sm:size-12"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </Shake>
        {message ? (
          <p id={`${id}-error`} role="alert" className="text-sm text-danger">
            {message}
          </p>
        ) : (
          <p
            id={`${id}-hint`}
            aria-live="polite"
            className="text-sm text-muted-foreground"
          >
            {notice ? t("code.resent") : hint}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={locked || check.isPending || code.length !== LENGTH}
      >
        {check.isPending && <Spinner />}
        {check.isPending ? t("code.verifying") : t("code.verify")}
      </Button>

      <p className="text-sm text-muted-foreground">
        {wait > 0 ? (
          <span className="tabular-nums">
            {t("code.resendIn", { seconds: wait })}
          </span>
        ) : (
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            disabled={again.isPending}
            onClick={() => {
              again.mutate()
            }}
          >
            {again.isPending ? t("code.resending") : t("code.resend")}
          </Button>
        )}
      </p>
    </form>
  )
}
