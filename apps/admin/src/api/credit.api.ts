import { apiClient } from "./axiosInstance";
import { extractMessage } from "./apiError";

export type Credit = {
  id: string;
  creditValue: string;
  isActive: boolean;
};

export type GetCreditResponse = {
  success: boolean;
  message: string;
  data: {
    id: string;
    credit_value: string;
    is_active: boolean;
  };
};

export type UpdateCreditPayload = {
  id: string;
  creditValue: string;
};

export type UpdateCreditResponse = GetCreditResponse;

export const getCredit = async (): Promise<Credit> => {
  try {
    const res = await apiClient.get<GetCreditResponse>(
      "finances/v1/credits_managment/",
    );

    const data = res.data.data;

    return {
      id: data.id,
      creditValue: data.credit_value,
      isActive: data.is_active,
    };
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};

export const updateCredit = async ({
  id,
  creditValue,
}: UpdateCreditPayload): Promise<Credit> => {
  try {
    const res = await apiClient.put<UpdateCreditResponse>(
      `finances/v1/credits_managment_detail/${id}/`,
      {
        credit_value: creditValue, // backend format
      },
    );

    const data = res.data.data;

    return {
      id: data.id,
      creditValue: data.credit_value,
      isActive: data.is_active,
    };
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};
