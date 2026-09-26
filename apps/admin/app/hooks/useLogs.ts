import { useQuery } from "@tanstack/react-query";
import { fetchEmailLogs, fetchSmsLogs } from "../api/logs.api";

export const logsQueryKeys = {
  email: (page: number) => ["logs", "email", page] as const,
  sms: (page: number) => ["logs", "sms", page] as const,
};

export function useEmailLogs(page: number) {
  return useQuery({
    queryKey: logsQueryKeys.email(page),
    queryFn: () => fetchEmailLogs(page),
    staleTime: 1000 * 30, // 30 s — logs are near-realtime
    placeholderData: (prev) => prev, // keep previous page data while fetching
  });
}

export function useSmsLogs(page: number) {
  return useQuery({
    queryKey: logsQueryKeys.sms(page),
    queryFn: () => fetchSmsLogs(page),
    staleTime: 1000 * 30,
    placeholderData: (prev) => prev,
  });
}
