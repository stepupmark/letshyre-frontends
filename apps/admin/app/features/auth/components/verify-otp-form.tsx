import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp"
import { useSendOtp, useVerifyOtp } from "../mutations/use-password-reset"
import { verifyOtpSchema } from "../schemas/auth.schema"
import type { OtpSession, VerifyOtpInput } from "../types"
import { getErrorMessage } from "@/lib/errors"

const RESEND_AFTER_SECONDS = 60

interface VerifyOtpFormProps {
  session: OtpSession
  onResent: (session: OtpSession) => void
  onVerified: () => void
}

export function VerifyOtpForm({
  session,
  onResent,
  onVerified,
}: VerifyOtpFormProps) {
  const [secondsLeft, setSecondsLeft] = useState(RESEND_AFTER_SECONDS)
  const verifyOtp = useVerifyOtp()
  const sendOtp = useSendOtp()
  const form = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  })

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = window.setTimeout(() => {
      setSecondsLeft((value) => value - 1)
    }, 1000)
    return () => {
      window.clearTimeout(timer)
    }
  }, [secondsLeft])

  const submit = form.handleSubmit(({ otp }) => {
    verifyOtp.mutate(
      { session, otp },
      {
        onSuccess: onVerified,
        onError: () => {
          form.resetField("otp")
        },
      }
    )
  })

  const resend = () => {
    sendOtp.mutate(session.email, {
      onSuccess: (next) => {
        onResent(next)
        verifyOtp.reset()
        form.resetField("otp")
        setSecondsLeft(RESEND_AFTER_SECONDS)
        toast.success("We sent you a new code")
      },
    })
  }

  const error = verifyOtp.error ?? sendOtp.error

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void submit(event)
      }}
    >
      <FieldGroup>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>
        )}
        <Controller
          control={form.control}
          name="otp"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="otp">Verification code</FieldLabel>
              <InputOTP
                id="otp"
                maxLength={6}
                autoFocus
                value={field.value}
                onChange={field.onChange}
                onComplete={() => submit()}
                disabled={verifyOtp.isPending}
                containerClassName="w-full"
              >
                <InputOTPGroup className="w-full">
                  {Array.from({ length: 6 }, (_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="h-12 flex-1 text-base"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Button type="submit" disabled={verifyOtp.isPending}>
          {verifyOtp.isPending && <LoaderCircle className="animate-spin" />}
          Verify
        </Button>
        <p className="text-sm text-muted-foreground">
          Didn&apos;t get it?{" "}
          {secondsLeft > 0 ? (
            <span>Resend in {secondsLeft}s</span>
          ) : (
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              disabled={sendOtp.isPending}
              onClick={resend}
            >
              Resend code
            </Button>
          )}
        </p>
      </FieldGroup>
    </form>
  )
}
