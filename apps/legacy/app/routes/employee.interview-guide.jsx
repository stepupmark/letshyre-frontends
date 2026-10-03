import { catalogLoader } from "@/loaders/catalogLoader";
import { noindexMeta } from "@/lib/routeMeta";

export const handle = { i18n: ["interviewGuide"] };
export const clientLoader = catalogLoader(handle.i18n);

export { InterviewGuide as default } from "@/features/employee/InterviewGuide";

export const meta = noindexMeta("employeeInterviewGuide");
