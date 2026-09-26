import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { employersService } from "../services/employers.service";

export const employersKeys = {
  all: ["employers"] as const,
  list: (page: number) => [...employersKeys.all, "list", page] as const,
  detail: (id: string) => [...employersKeys.all, "detail", id] as const,
  summary: () => [...employersKeys.all, "summary"] as const,
};

export const employersQueries = {
  list: (page: number) =>
    queryOptions({
      queryKey: employersKeys.list(page),
      queryFn: ({ signal }) => employersService.list(page, signal),
      placeholderData: keepPreviousData,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: employersKeys.detail(id),
      queryFn: ({ signal }) => employersService.detail(id, signal),
    }),
  summary: () =>
    queryOptions({
      queryKey: employersKeys.summary(),
      queryFn: ({ signal }) => employersService.summary(signal),
      staleTime: 30_000,
    }),
};
