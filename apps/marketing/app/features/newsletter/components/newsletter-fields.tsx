import { localePath } from "@workspace/i18n"
import { Trans, useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
import type { ComponentProps, SubmitEventHandler } from "react"
import { Link } from "react-router"

import { PAGES } from "@/lib/pages"

export function NewsletterFields({
  id,
  input,
  error,
  pending = false,
  onSubmit,
}: {
  id: string
  /** Missing until the form logic has loaded, which also keeps the button disabled. */
  input?: ComponentProps<"input">
  error?: string
  pending?: boolean
  onSubmit?: SubmitEventHandler<HTMLFormElement>
}) {
  const { t } = useTranslation("common")
  const lang = useLocale()

  return (
    <form
      noValidate
      className="w-full md:max-w-md md:justify-self-end"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-desc`}
      onSubmit={onSubmit}
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
            {...input}
          />
          <Button type="submit" size="lg" disabled={!onSubmit || pending}>
            {pending && <Spinner aria-hidden />}
            {pending ? t("newsletter.subscribing") : t("newsletter.subscribe")}
          </Button>
        </div>
        {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
        <p className="text-xs text-muted-foreground">
          <Trans
            t={t}
            i18nKey="newsletter.privacy"
            components={{
              pp: (
                <Link
                  to={localePath(lang, PAGES.privacy.path)}
                  className="underline underline-offset-4 hover:text-foreground"
                />
              ),
            }}
          />
        </p>
      </Field>
    </form>
  )
}
