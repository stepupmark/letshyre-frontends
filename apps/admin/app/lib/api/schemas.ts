import { z } from "zod";

export const envelope = <T extends z.ZodType>(data: T) =>
  z.object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    data,
  });

export const paginated = <T extends z.ZodType>(item: T) =>
  z.object({
    count: z.number(),
    total_pages: z.number(),
    current_page: z.number(),
    page_size: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(item),
  });

export type Paginated<T> = {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
