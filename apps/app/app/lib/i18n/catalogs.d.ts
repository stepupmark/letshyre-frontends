// the shipping locales' catalogs, from the app-catalogs plugin in vite.config.ts
declare module "virtual:app-catalogs" {
  import type { Catalog } from "@workspace/i18n"

  const files: Record<string, () => Promise<Catalog>>
  export default files
}
