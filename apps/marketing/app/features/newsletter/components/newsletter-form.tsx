import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { useId } from "react"
import { useForm } from "react-hook-form"

import { useSubscribe } from "../mutations/use-subscribe"
import {
  isNewsletterError,
  newsletterSchema,
} from "../schemas/newsletter.schema"

export function NewsletterForm() {
  const { t } = useTranslation("common")
  const id = useId()
  const subscription = useSubscribe()
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  })

  const message = formState.errors.email?.message
  const error = isNewsletterError(message) ? t(message) : undefined

  return (
    <div className="grid gap-4 md:grid-cols-2 md:items-center md:gap-8">
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-title`} className="text-sm font-semibold">
          {t("footer.stayUpdated")}
        </h2>
        <p id={`${id}-desc`} className="text-sm text-muted-foreground">
          {t("footer.newsletterDesc")}
        </p>
      </div>

      {!subscription.isSuccess && (
        <form
          noValidate
          className="w-full md:max-w-md md:justify-self-end"
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-desc`}
          onSubmit={(event) => {
            void handleSubmit(({ email }) => {
              subscription.mutate(email)
            })(event)
          }}
        >
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor={`${id}-email`} className="sr-only">
              {t("newsletter.emailLabel")}
            </FieldLabel>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id={`${id}-email`}
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder={t("newsletter.emailPlaceholder")}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className="h-9 bg-background sm:flex-1"
                {...register("email")}
              />
              <Button type="submit" size="lg" disabled={subscription.isPending}>
                {subscription.isPending
                  ? t("newsletter.subscribing")
                  : t("newsletter.subscribe")}
              </Button>
            </div>
            {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
          </Field>
        </form>
      )}

      <p role="status" className="text-sm empty:hidden md:col-start-2">
        {subscription.isSuccess ? t("newsletter.subscribed") : null}
      </p>
      {subscription.isError && (
        <p role="alert" className="text-sm text-destructive md:col-start-2">
          {t("newsletter.subscribeFailed")}
        </p>
      )}
    </div>
  )
}
