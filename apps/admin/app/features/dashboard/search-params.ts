import { createLoader, parseAsInteger, parseAsStringLiteral } from "nuqs";
import { ACTIVITY_RANGES } from "./schemas/dashboard.schema";

export const currentYear = () => new Date().getFullYear();

export const dashboardSearchParams = {
  year: parseAsInteger.withDefault(currentYear()),
  days: parseAsStringLiteral(ACTIVITY_RANGES).withDefault("7"),
};

export const loadDashboardSearchParams = createLoader(dashboardSearchParams);
