import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { LoaderCircle } from "lucide-react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

import { getErrorMessage } from "@/lib/errors"

import { useSendOtp } from "../mutations/use-password-reset"
import { requestOtpSchema } from "../schemas/auth.schema"
import type { OtpSession, RequestOtpInput } from "../types"

export function RequestOtpForm({
  onSent,
}: {
  onSent: (session: OtpSession) => void
}) {
  const sendOtp = useSendOtp()
  const form = useForm<RequestOtpInput>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { email: "" },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void form.handleSubmit(({ email }) => {
          sendOtp.mutate(email, { onSuccess: onSent })
        })(event)
      }}
    >
      <FieldGroup>
        {sendOtp.error && (
          <Alert variant="destructive">
            <AlertDescription>
              {getErrorMessage(sendOtp.error)}
            </AlertDescription>
          </Alert>
        )}
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="reset-email">Email</FieldLabel>
              <Input
                {...field}
                id="reset-email"
                type="email"
                autoComplete="username"
                autoFocus
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Button type="submit" disabled={sendOtp.isPending}>
          {sendOtp.isPending && <LoaderCircle className="animate-spin" />}
          Send code
        </Button>
      </FieldGroup>
    </form>
  )
}
