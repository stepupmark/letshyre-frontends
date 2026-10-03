import { noindexMeta } from "@/lib/routeMeta";
import { catalogLoader } from "@/loaders/catalogLoader";

export const handle = { i18n: ["scorecard"] };
export const clientLoader = catalogLoader(handle.i18n);

export { EmployeeScoreCard as default } from "@/features/employer/EmployeeScoreCard";

export const meta = noindexMeta("employerCandidateScorecard");
