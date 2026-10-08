import { z } from "zod"
import { envelope, id } from "@/lib/api/schemas"

export const GATEWAY_PROVIDERS = {
  razorpay: "Razorpay",
  stripe: "Stripe",
  paypal: "PayPal",
} as const

export type GatewayProvider = keyof typeof GATEWAY_PROVIDERS

const gatewaySchema = z
  .object({
    id,
    name: z.string(),
    display_name: z.string().nullish(),
    config: z.object({
      credentials: z.object({
        client_id: z.string().nullish(),
        client_secret: z.string().nullish(),
      }),
      is_sandbox: z.boolean().nullish(),
    }),
  })
  .transform((gateway) => ({
    id: gateway.id,
    provider: gateway.name,
    displayName: gateway.display_name || gateway.name,
    clientId: gateway.config.credentials.client_id ?? "",
    clientSecret: gateway.config.credentials.client_secret ?? "",
    sandbox: gateway.config.is_sandbox ?? false,
  }))

export const gatewaysResponseSchema = envelope(z.array(gatewaySchema))

export const gatewayFormSchema = z.object({
  provider: z.enum(["razorpay", "stripe", "paypal"]),
  displayName: z.string().trim().min(2, "At least 2 characters"),
  environment: z.enum(["sandbox", "live"]),
  clientId: z.string().trim().min(4, "Enter the client ID"),
  clientSecret: z.string().trim().min(6, "Enter the client secret"),
})

export type Gateway = z.infer<typeof gatewaySchema>
export type GatewayFormValues = z.infer<typeof gatewayFormSchema>
