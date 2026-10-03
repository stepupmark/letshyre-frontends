import { catalogLoader } from "@/loaders/catalogLoader";
import { noindexMeta } from "@/lib/routeMeta";

export { EmployeeProfile as default } from "@/features/employer/EmployeeProfile";

export const handle = { i18n: ["employerCandidates", "candidateProfile"] };
export const clientLoader = catalogLoader(handle.i18n);

export const meta = noindexMeta("employerCandidateProfile");
