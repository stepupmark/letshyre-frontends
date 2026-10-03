import { PublicLayout } from "@/components/layout/PublicLayout";
import { catalogLoader } from "@/loaders/catalogLoader";

// Layout for public pages that are NOT under /:lang — the shared scorecard,
// whose URL is a bare share id. Not prerendered, so there's no segment to read
// a locale from; it renders under the ambient AppLocaleProvider (root.jsx),
// which already tracks the visitor's stored/detected locale.
export const handle = { i18n: ["common", "seo"] };
export const clientLoader = catalogLoader(handle.i18n);

export default PublicLayout;
