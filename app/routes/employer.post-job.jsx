import { catalogLoader } from "@/loaders/catalogLoader";
import { noindexMeta } from "@/lib/routeMeta";

export { PostJob as default } from "@/features/employer/PostJob";

export const handle = { i18n: ["employerJobs"] };
export const clientLoader = catalogLoader(handle.i18n);

export const meta = noindexMeta("employerPostJob");
