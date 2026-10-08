import { zodResolver } from "@hookform/resolvers/zod"
import { AccountInactiveError, RoleNotAllowedError } from "@workspace/auth"
import { Controller, useForm } from "react-hook-form"
import { Link, useSearchParams } from "react-router"
import { LoaderCircle } from "lucide-react"
import { PasswordInput } from "@/components/password-input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getErrorMessage } from "@/lib/errors"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useLogin } from "../mutations/use-login"
import { loginSchema } from "../schemas/auth.schema"
import type { LoginInput } from "../types"
import { AuthHeading } from "./auth-layout"

const REASON_MESSAGES: Record<string, string> = {
  expired: "Your session expired. Please sign in again.",
  idle: "You were signed out after a period of inactivity.",
  forbidden: "This account doesn't have admin access.",
}

function signInError(error: Error) {
  if (error instanceof RoleNotAllowedError) return REASON_MESSAGES.forbidden
  if (error instanceof AccountInactiveError)
    return "This account is inactive. Contact another admin."
  return getErrorMessage(error, "Couldn't sign you in. Please try again.")
}

export function SignInForm() {
  const [searchParams] = useSearchParams()
  const reason = REASON_MESSAGES[searchParams.get("reason") ?? ""]
  const login = useLogin()
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  return (
    <>
      <AuthHeading
        title="Sign in"
        description="Use your LetsHyre admin account to continue."
      />
      <form
        noValidate
        onSubmit={(event) => {
          void form.handleSubmit((values) => {
            login.mutate(values)
          })(event)
        }}
      >
        <FieldGroup>
          {(login.error ?? reason) && (
            <Alert variant={login.error ? "destructive" : "default"}>
              <AlertDescription>
                {login.error ? signInError(login.error) : reason}
              </AlertDescription>
            </Alert>
          )}
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  {...field}
                  id="password"
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Button type="submit" disabled={login.isPending}>
            {login.isPending && <LoaderCircle className="animate-spin" />}
            Sign in
          </Button>
        </FieldGroup>
      </form>
    </>
  )
}
