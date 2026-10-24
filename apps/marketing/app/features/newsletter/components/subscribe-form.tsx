import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "@workspace/i18n/react"
import { useForm } from "react-hook-form"

import { useSubscribe } from "../mutations/use-subscribe"
import {
  isNewsletterError,
  newsletterSchema,
} from "../schemas/newsletter.schema"
import { NewsletterFields } from "./newsletter-fields"

export default function SubscribeForm({ id }: { id: string }) {
  const { t } = useTranslation("common")
  const subscription = useSubscribe()
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  })

  const message = formState.errors.email?.message
  const error = isNewsletterError(message) ? t(message) : undefined

  return (
    <>
      {!subscription.isSuccess && (
        <NewsletterFields
          id={id}
          input={register("email")}
          error={error}
          pending={subscription.isPending}
          onSubmit={(event) => {
            void handleSubmit(({ email }) => {
              subscription.mutate(email)
            })(event)
          }}
        />
      )}

      <p role="status" className="text-sm empty:hidden md:col-start-2">
        {subscription.isSuccess ? t("newsletter.subscribed") : null}
      </p>
      {subscription.isError && (
        <p role="alert" className="text-sm text-destructive md:col-start-2">
          {t("newsletter.subscribeFailed")}
        </p>
      )}
    </>
  )
}
