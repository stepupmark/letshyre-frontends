import { prerenderPaths } from "./app/i18n/config.js";

export default {
  ssr: false,
  // One prerendered page per locale x public route (see app/i18n/config.js).
  prerender: prerenderPaths(),
};
