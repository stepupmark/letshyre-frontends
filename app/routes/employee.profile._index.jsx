import { noindexMeta } from "@/lib/routeMeta";
import { catalogLoader } from "@/loaders/catalogLoader";

export const handle = { i18n: ["candidateProfile"] };
export const clientLoader = catalogLoader(handle.i18n);

export { EmployeeProfile as default } from "@/features/employee/EmployeeProfile";

export const meta = noindexMeta("employeeProfile");
