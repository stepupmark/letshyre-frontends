import { noindexMeta } from "@/lib/routeMeta";
import { catalogLoader } from "@/loaders/catalogLoader";

export const handle = { i18n: ["common", "seo"] };
export const clientLoader = catalogLoader(handle.i18n);

export { NotFound as default } from "@/features/not-found/NotFound";

export const meta = noindexMeta("notFound");
