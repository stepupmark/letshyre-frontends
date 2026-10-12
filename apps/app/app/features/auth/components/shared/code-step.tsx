import { Trans, useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { useMutation } from "@tanstack/react-query"
import { ArrowUpRight, Check, ShieldAlert } from "lucide-react"
import { useReducedMotion } from "motion/react"
import { useEffect, useEffectEvent, useId, useState } from "react"

import { Shake } from "@/components/motion/shake"

import { useSecondsLeft } from "../../hooks/use-seconds-left"
import { authErrorKey, type AuthErrorKey } from "../../lib/errors"
import { inboxFor } from "../../lib/identity"
import { CodeInput } from "./code-input"
import { ResendTimer } from "./resend-timer"

const LENGTH = 6
const RESEND_AFTER = 30
const MAX_TRIES = 5

/**
 * A code sent by email or SMS. The last digit submits; a rejected code isn't
 * retried until it changes, and a correct one shows as verified before moving on.
 */
export function CodeStep({
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
    // long enough to see it turn green
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

  const message = !locked && error ? t(error) : undefined
  const describedBy = locked
    ? `${id}-locked`
    : message
      ? `${id}-error`
      : `${id}-hint`

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        submit(code)
      }}
    >
      <p className="-mt-2 text-muted-foreground">
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
          className="h-auto p-0 align-baseline text-base"
          onClick={onChangeDestination}
        >
          {t("code.change")}
        </Button>
      </p>

      {locked && (
        <Alert id={`${id}-locked`} variant="destructive" role="alert">
          <ShieldAlert />
          <AlertDescription>{t("code.locked")}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2.5">
        <label htmlFor={id} className="text-sm font-medium">
          {t("code.label")}
        </label>
        <Shake error={message}>
          <CodeInput
            id={id}
            length={LENGTH}
            value={code}
            state={verified ? "verified" : message ? "invalid" : "idle"}
            disabled={locked || verified}
            describedBy={describedBy}
            onChange={(value) => {
              setCode(value)
              if (
                error === "errors.otpIncorrect" ||
                error === "code.incomplete"
              )
                setError(null)
            }}
            onComplete={(value) => {
              if (value !== tried) submit(value)
            }}
          />
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
        disabled={locked || check.isPending || verified}
        className={verified ? "disabled:opacity-100" : undefined}
      >
        {check.isPending && <Spinner />}
        {verified && <Check className="pop" strokeWidth={3} />}
        <span role={verified ? "status" : undefined}>
          {verified
            ? t("code.verified")
            : check.isPending
              ? t("code.verifying")
              : t("code.verify")}
        </span>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
        {wait > 0 ? (
          <ResendTimer seconds={wait} total={RESEND_AFTER} />
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
