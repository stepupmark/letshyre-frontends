import { zodResolver } from "@hookform/resolvers/zod"
import { homeFor, login, readSession, safeNext } from "@workspace/auth"
import { useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { FieldGroup } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import { useMutation } from "@tanstack/react-query"
import { CircleAlert } from "lucide-react"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { href, Link } from "react-router"
import { z } from "zod"

import { Shake } from "@/components/motion/shake"
import { PasswordField, TextField } from "@/components/text-field"
import { checkOnBlur } from "@/lib/forms"
import { api } from "@/lib/api"

import { authErrorKey } from "./errors"

const schema = (
  t: (key: "validation.emailInvalid" | "validation.passwordRequired") => string
) =>
  z.object({
    email: z.email(t("validation.emailInvalid")),
    password: z.string().min(1, t("validation.passwordRequired")),
  })

/**
 * Email and password for both roles. Calls `onSignedIn` with where to go next:
 * the page they came for when it's safe, otherwise their home.
 */
export function SignInForm({
  email = "",
  next,
  onSignedIn,
}: {
  email?: string
  next?: string | null
  onSignedIn: (to: string) => void
}) {
  const { t } = useTranslation("auth")
  const form = useForm({
    resolver: zodResolver(useMemo(() => schema(t), [t])),
    defaultValues: { email, password: "" },
    mode: "onSubmit",
  })
  const { errors } = form.formState

  const signIn = useMutation({
    mutationFn: (values: { email: string; password: string }) =>
      login(api, values),
    onSuccess: () => {
      const session = readSession()
      if (session.status !== "signed-in") return
      onSignedIn(safeNext(next) ?? homeFor(session))
    },
    onError: () => {
      form.setValue("password", "")
      form.setFocus("password")
    },
  })

  const failure = signIn.isError
    ? t(authErrorKey(signIn.error, "errors.signInFailed"))
    : undefined
  const busy = signIn.isPending || signIn.isSuccess

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        void form.handleSubmit((values) => {
          signIn.mutate(values)
        })(event)
      }}
    >
      {failure && (
        <Shake error={failure}>
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{failure}</AlertDescription>
          </Alert>
        </Shake>
      )}
      <FieldGroup>
        <TextField
          label={t("fields.email")}
          type="email"
          autoComplete="username"
          inputMode="email"
          autoFocus={!email}
          error={errors.email?.message}
          {...checkOnBlur(form, "email")}
        />
        <PasswordField
          label={t("fields.password")}
          autoComplete="current-password"
          autoFocus={Boolean(email)}
          error={errors.password?.message}
          labelAside={
            <Link
              to={href("/forgot-password")}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {t("signIn.forgot")}
            </Link>
          }
          {...checkOnBlur(form, "password")}
        />
      </FieldGroup>
      <Button type="submit" size="lg" disabled={busy}>
        {busy && <Spinner />}
        {signIn.isSuccess
          ? t("signIn.redirecting")
          : signIn.isPending
            ? t("signIn.submitting")
            : t("signIn.submit")}
      </Button>
    </form>
  )
}
