import { Trans, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"
import { useMutation } from "@tanstack/react-query"
import { ArrowUpRight } from "lucide-react"
import { useReducedMotion } from "motion/react"
import { useEffect, useEffectEvent, useId, useState } from "react"

import { Shake } from "@/components/motion/shake"

import { authErrorKey, type AuthErrorKey } from "./errors"
import { inboxFor } from "./identity"
import { useSecondsLeft } from "./use-seconds-left"

const LENGTH = 6
const RESEND_AFTER = 30
const MAX_TRIES = 5
const DIGITS = "^[0-9]+$"
const RING = 2 * Math.PI * 9

/**
 * A code sent by email or SMS, entered on a ticket. Paste and one-time-code
 * autofill work; the last digit submits. A rejected code isn't retried until
 * it changes, and a correct one is stamped before moving on.
 */
export function CodeTicket({
  destination,
  email,
  sentAt = 0,
  hint,
  onChangeDestination,
  verify,
  resend,
  onVerified,
  onLost,
}: {
  destination: string
  /** for the open-your-inbox shortcut */
  email?: string
  sentAt?: number
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
  const reduce = useReducedMotion()
  const [code, setCode] = useState("")
  const [tried, setTried] = useState<string | null>(null)
  const [failures, setFailures] = useState(0)
  const [error, setError] = useState<AuthErrorKey | "code.incomplete" | null>(
    null
  )
  const [notice, setNotice] = useState(false)
  const wait = useSecondsLeft(sentAt + RESEND_AFTER * 1000, RESEND_AFTER)
  const locked = failures >= MAX_TRIES
  const inbox = email ? inboxFor(email) : null

  const check = useMutation({ mutationFn: verify })
  const verified = check.isSuccess

  const proceed = useEffectEvent(onVerified)
  useEffect(() => {
    if (!verified) return
    // long enough to see the stamp land
    const timer = setTimeout(proceed, reduce ? 0 : 700)
    return () => {
      clearTimeout(timer)
    }
  }, [verified, reduce])

  const again = useMutation({
    mutationFn: resend,
    onSuccess: () => {
      setCode("")
      setTried(null)
      setFailures(0)
      setError(null)
      setNotice(true)
    },
    onError: (err) => {
      setError(authErrorKey(err, "errors.sendFailed"))
    },
  })

  const submit = (value: string) => {
    if (locked || check.isPending || verified) return
    if (value.length !== LENGTH) {
      setError("code.incomplete")
      return
    }
    setTried(value)
    setError(null)
    setNotice(false)
    check.mutate(value, {
      onError: (err) => {
        const key = authErrorKey(err, "errors.otpIncorrect")
        if (key === "errors.otpSessionInvalid") {
          onLost(key)
          return
        }
        setError(key)
        if (key === "errors.otpIncorrect") {
          setFailures((n) => n + 1)
          setCode("")
        }
      },
    })
  }

  const message = locked ? t("code.locked") : error ? t(error) : undefined

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        submit(code)
      }}
    >
      <Shake error={message}>
        <div
          className={cn(
            "relative rounded-2xl border bg-card shadow-sm transition-opacity",
            locked && "opacity-60"
          )}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <p className="min-w-0 text-sm text-muted-foreground">
              <Trans
                t={t}
                i18nKey="code.sentTo"
                values={{ destination }}
                components={{
                  strong: (
                    <strong className="font-medium break-all text-foreground" />
                  ),
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
            {wait > 0 && (
              <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                <svg viewBox="0 0 20 20" className="size-5 -rotate-90">
                  <circle
                    cx="10"
                    cy="10"
                    r="9"
                    className="fill-none stroke-muted stroke-2"
                  />
                  <circle
                    cx="10"
                    cy="10"
                    r="9"
                    strokeDasharray={RING}
                    strokeDashoffset={RING * (1 - wait / RESEND_AFTER)}
                    className="fill-none stroke-brand stroke-2 transition-[stroke-dashoffset] duration-1000 ease-linear motion-reduce:transition-none"
                  />
                </svg>
                <span aria-hidden="true">
                  {t("code.seconds", { seconds: wait })}
                </span>
                <span className="sr-only">
                  {t("code.resendIn", { seconds: wait })}
                </span>
              </span>
            )}
          </div>

          <div aria-hidden="true" className="relative mx-4 sm:mx-5">
            <span className="block border-t border-dashed" />
            <span className="absolute -inset-s-6.5 -top-2.5 size-5 rounded-full border bg-background [clip-path:inset(0_0_0_50%)] sm:-inset-s-7.5 sm:bg-card lg:bg-background rtl:[clip-path:inset(0_50%_0_0)]" />
            <span className="absolute -inset-e-6.5 -top-2.5 size-5 rounded-full border bg-background [clip-path:inset(0_50%_0_0)] sm:-inset-e-7.5 sm:bg-card lg:bg-background rtl:[clip-path:inset(0_0_0_50%)]" />
          </div>

          <div className="flex flex-col items-center gap-3 px-4 pt-4 pb-5 sm:px-5">
            <label htmlFor={id} className="self-start text-sm font-medium">
              {t("code.label")}
            </label>
            <InputOTP
              id={id}
              maxLength={LENGTH}
              pattern={DIGITS}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              value={code}
              disabled={locked || verified}
              aria-invalid={Boolean(message)}
              aria-describedby={message ? `${id}-error` : `${id}-hint`}
              onChange={(value) => {
                setCode(value)
                if (
                  error === "errors.otpIncorrect" ||
                  error === "code.incomplete"
                )
                  setError(null)
              }}
              onComplete={(value: string) => {
                if (value !== tried) submit(value)
              }}
            >
              <InputOTPGroup>
                {[0, 1, 2].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    aria-invalid={Boolean(message)}
                    className="font-display size-11 text-2xl sm:size-12"
                  />
                ))}
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                {[3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    aria-invalid={Boolean(message)}
                    className="font-display size-11 text-2xl sm:size-12"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {verified && (
            <p
              role="status"
              className="stamp absolute inset-e-4 top-1/2 -rotate-12 rounded-md border-2 border-brand-text bg-card px-3 py-1 text-sm font-bold tracking-widest text-brand-text uppercase"
            >
              {t("code.verified")}
            </p>
          )}
        </div>
      </Shake>

      {message ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="-mt-2 text-sm text-danger"
        >
          {message}
        </p>
      ) : (
        <p
          id={`${id}-hint`}
          aria-live="polite"
          className="-mt-2 text-sm text-muted-foreground"
        >
          {notice ? t("code.resent") : hint}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={locked || check.isPending || verified}
      >
        {check.isPending && <Spinner />}
        {check.isPending ? t("code.verifying") : t("code.verify")}
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
        {wait > 0 ? (
          <span className="text-muted-foreground">{t("code.notYet")}</span>
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
        {inbox && (
          <a
            href={inbox.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
          >
            {t("code.openInbox", { provider: inbox.provider })}
            <ArrowUpRight
              className="size-3.5 rtl:-scale-x-100"
              aria-hidden="true"
            />
          </a>
        )}
      </div>
    </form>
  )
}
