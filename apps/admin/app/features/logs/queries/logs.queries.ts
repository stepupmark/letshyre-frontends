import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { logsService } from "../services/logs.service";

const logsKeys = {
  all: ["logs"] as const,
  email: (page: number) => [...logsKeys.all, "email", page] as const,
  sms: (page: number) => [...logsKeys.all, "sms", page] as const,
};

export const logsQueries = {
  email: (page: number) =>
    queryOptions({
      queryKey: logsKeys.email(page),
      queryFn: ({ signal }) => logsService.email(page, signal),
      staleTime: 30_000,
      placeholderData: keepPreviousData,
    }),
  sms: (page: number) =>
    queryOptions({
      queryKey: logsKeys.sms(page),
      queryFn: ({ signal }) => logsService.sms(page, signal),
      staleTime: 30_000,
      placeholderData: keepPreviousData,
    }),
};
