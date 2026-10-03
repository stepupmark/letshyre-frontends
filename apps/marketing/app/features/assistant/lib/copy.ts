import {
  addMessages,
  type Catalog,
  createCatalogLoader,
  type Locale,
} from "@workspace/i18n"

const load = createCatalogLoader(
  import.meta.glob<Catalog>("../../../locales/*/assistant.json", {
    import: "default",
  })
)

const pending = new Map<Locale, Promise<void>>()

/** The assistant's copy is fetched on first open, not shipped with the page. */
export function loadAssistantCopy(lang: Locale): Promise<void> {
  let promise = pending.get(lang)
  if (!promise) {
    promise = load(lang, ["assistant"]).then(addMessages)
    pending.set(lang, promise)
  }
  return promise
}
