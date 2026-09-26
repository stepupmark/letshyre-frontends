import {
  GATEWAY_PROVIDERS,
  type Gateway,
  type GatewayFormValues,
  type GatewayProvider,
} from "../schemas/payment-gateways.schema";

export const EMPTY_GATEWAY: GatewayFormValues = {
  provider: "razorpay",
  displayName: "",
  environment: "sandbox",
  clientId: "",
  clientSecret: "",
};

export function isProvider(value: string): value is GatewayProvider {
  return value in GATEWAY_PROVIDERS;
}

export function providerLabel(value: string) {
  return isProvider(value) ? GATEWAY_PROVIDERS[value] : value;
}

export function toGatewayFormValues(gateway: Gateway): GatewayFormValues {
  return {
    provider: isProvider(gateway.provider) ? gateway.provider : "razorpay",
    displayName: gateway.displayName,
    environment: gateway.sandbox ? "sandbox" : "live",
    clientId: gateway.clientId,
    clientSecret: gateway.clientSecret,
  };
}
