import * as z from "zod";

export const paymentsGatewaySchema = z.object({
  gatewayName: z.string().min(1, "Gateway name is required"),
  displayName: z.string().min(2, "Display name is required"),
  isActive: z.boolean(),
  environment: z.enum(["sandbox", "live"]),
  clientId: z.string().min(4, "Client ID is required"),
  clientSecret: z.string().min(6, "Client secret is required"),
});

export type PaymentGateway = z.infer<typeof paymentsGatewaySchema>;