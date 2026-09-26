import { lazy } from "react";

// recharts is the heaviest dependency, keep it out of the dashboard's first load
const charts = () => import("./charts");

export const RevenueChart = lazy(() =>
  charts().then((m) => ({ default: m.RevenueChart })),
);
export const ActivityChart = lazy(() =>
  charts().then((m) => ({ default: m.ActivityChart })),
);
export const RoleScoreChart = lazy(() =>
  charts().then((m) => ({ default: m.RoleScoreChart })),
);
