import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { JobsFilters } from "../schemas/jobs.schema";
import { jobsService } from "../services/jobs.service";

export const jobsKeys = {
  all: ["jobs"] as const,
  list: (filters: JobsFilters) => [...jobsKeys.all, "list", filters] as const,
  detail: (id: string) => [...jobsKeys.all, "detail", id] as const,
  summary: () => [...jobsKeys.all, "summary"] as const,
};

export const jobsQueries = {
  list: (filters: JobsFilters) =>
    queryOptions({
      queryKey: jobsKeys.list(filters),
      queryFn: ({ signal }) => jobsService.list(filters, signal),
      placeholderData: keepPreviousData,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: jobsKeys.detail(id),
      queryFn: ({ signal }) => jobsService.detail(id, signal),
    }),
  summary: () =>
    queryOptions({
      queryKey: jobsKeys.summary(),
      queryFn: ({ signal }) => jobsService.summary(signal),
      staleTime: 30_000,
    }),
};
