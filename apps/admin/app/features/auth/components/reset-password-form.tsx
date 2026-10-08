import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { LoaderCircle } from "lucide-react"
import { PasswordInput } from "@/components/password-input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { useResetPassword } from "../mutations/use-password-reset"
import { resetPasswordSchema } from "../schemas/auth.schema"
import type { OtpSession, ResetPasswordInput } from "../types"
import { getErrorMessage } from "@/lib/api/api-error"

export function ResetPasswordForm({
  session,
  onDone,
}: {
  session: OtpSession
  onDone: () => void
}) {
  const resetPassword = useResetPassword()
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void form.handleSubmit(({ password }) => {
          resetPassword.mutate({ session, password }, { onSuccess: onDone })
        })(event)
      }}
    >
      <FieldGroup>
        {resetPassword.error && (
          <Alert variant="destructive">
            <AlertDescription>
              {getErrorMessage(resetPassword.error)}
            </AlertDescription>
          </Alert>
        )}
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="new-password">New password</FieldLabel>
              <PasswordInput
                {...field}
                id="new-password"
                autoComplete="new-password"
                autoFocus
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                At least 8 characters, with an uppercase letter and a number.
              </FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="confirm-password">
                Confirm password
              </FieldLabel>
              <PasswordInput
                {...field}
                id="confirm-password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Button type="submit" disabled={resetPassword.isPending}>
          {resetPassword.isPending && <LoaderCircle className="animate-spin" />}
          Reset password
        </Button>
      </FieldGroup>
    </form>
  )
}
