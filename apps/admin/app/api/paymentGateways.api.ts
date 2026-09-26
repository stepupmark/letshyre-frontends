import { PaymentGateway } from "../schemas/paymentsGateway.schema";
import { http } from "~/lib/api/http-client";
import { toApiError } from "~/lib/api/api-error";

export type Gateway = {
  id: string;
  name: string;
  displayName: string;
  clientId: string;
  clientSecret: string;
  isSandbox: boolean;
};

export type GatewayApiResponse = {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    display_name: string;
    config: {
      credentials: {
        client_id: string;
        client_secret: string;
      };
      is_sandbox: boolean;
    };
  }[];
};

export type AddGatewayPayload = {
  name: string;
  display_name: string;
  clientId: string;
  clientSecret: string;
  isSandbox: boolean;
};

export const getPaymentGateways = async (): Promise<Gateway[]> => {
  try {
    const res = await http.get<GatewayApiResponse>(
      `finances/v1/payment_gateway_managment/`,
    );

    return res.data.data.map((g) => ({
      id: g.id,
      name: g.name,
      displayName: g.display_name,
      clientId: g.config.credentials.client_id,
      clientSecret: g.config.credentials.client_secret,
      isSandbox: g.config.is_sandbox,
    }));
  } catch (err) {
    throw toApiError(err);
  }
};

export const addPaymentGateway = async (data: PaymentGateway) => {
  try {
    return await http.post(`finances/v1/payment_gateway_managment/`, {
      name: data.gatewayName,
      display_name: data.displayName,
      is_sandbox: data.isActive,
      credentials: {
        client_id: data.clientId,
        client_secret: data.clientSecret,
      },
    });
  } catch (err) {
    throw toApiError(err);
  }
};

export const updatePaymentGateway = async ({
  id,
  ...data
}: PaymentGateway & { id: string }) => {
  try {
    return await http.put(
      `finances/v1/payment_gateway_managment_detail/${id}/`,
      {
        name: data.gatewayName,
        display_name: data.displayName,
        is_sandbox: data.isActive,
        credentials: {
          client_id: data.clientId,
          client_secret: data.clientSecret,
        },
      },
    );
  } catch (err) {
    throw toApiError(err);
  }
};

export const getPaymentGatewayDetail = async (id: string): Promise<Gateway> => {
  try {
    const res = await http.get(
      `finances/v1/payment_gateway_managment_detail/${id}/`,
    );

    const gateway = res.data.data;

    return {
      id: gateway.id,
      name: gateway.name,
      displayName: gateway.display_name,
      clientId: gateway.config.credentials.client_id,
      clientSecret: gateway.config.credentials.client_secret,
      isSandbox: gateway.config.is_sandbox,
    };
  } catch (err) {
    throw toApiError(err);
  }
};

export const deletePaymentGateway = async (id: string) => {
  try {
    return await http.delete(
      `finances/v1/payment_gateway_managment_detail/${id}/`,
    );
  } catch (err) {
    throw toApiError(err);
  }
};
