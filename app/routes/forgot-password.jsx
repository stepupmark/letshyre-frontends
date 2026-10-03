import { requireGuest } from "@/loaders/requireAuth";
import { catalogLoader } from "@/loaders/catalogLoader";
import { noindexMeta } from "@/lib/routeMeta";

export const handle = { i18n: ["common", "seo", "auth"] };
export const clientLoader = catalogLoader(handle.i18n, requireGuest);
export { ForgotPassword as default } from "@/features/forgot/ForgotPassword";

export const meta = noindexMeta("forgotPassword");
