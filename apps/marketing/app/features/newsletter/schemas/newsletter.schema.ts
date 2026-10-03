import { z } from "zod"

// messages are catalog keys, translated where they're shown
export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "newsletter.emailRequired")
    .pipe(z.email("newsletter.emailInvalid")),
})

export type NewsletterInput = z.input<typeof newsletterSchema>

export const NEWSLETTER_ERRORS = [
  "newsletter.emailRequired",
  "newsletter.emailInvalid",
] as const

export type NewsletterError = (typeof NEWSLETTER_ERRORS)[number]

export const isNewsletterError = (
  message: string | undefined
): message is NewsletterError =>
  NEWSLETTER_ERRORS.some((key) => key === message)
