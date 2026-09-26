import { createLoader, parseAsInteger, parseAsString } from "nuqs";

export const pageParser = parseAsInteger.withDefault(1);
export const textParser = parseAsString.withDefault("");

export const loadPageParam = createLoader({ page: pageParser });

/** Drops empty strings so they aren't sent as `?search=`. */
export function compactParams<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  ) as Partial<T>;
}
