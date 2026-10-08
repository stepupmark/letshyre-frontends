import { oneOf } from "@/lib/search-params"
import { ACTIVITY_RANGES } from "./schemas/dashboard.schema"

export const currentYear = () => new Date().getFullYear()

export function readDashboardParams(params: URLSearchParams) {
  const year = Number.parseInt(params.get("year") ?? "", 10)
  return {
    year: Number.isInteger(year) ? year : currentYear(),
    days: oneOf(params.get("days"), ACTIVITY_RANGES) ?? "7",
  }
}
