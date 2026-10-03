import { requireGuest } from "@/loaders/requireAuth";
import { catalogLoader } from "@/loaders/catalogLoader";
import { noindexMeta } from "@/lib/routeMeta";

export const handle = { i18n: ["common", "seo", "auth"] };
export const clientLoader = catalogLoader(handle.i18n, requireGuest);
export { EmployerSignIn as default } from "@/features/employer/auth/SignIn";

export const meta = noindexMeta("employerSignIn");
