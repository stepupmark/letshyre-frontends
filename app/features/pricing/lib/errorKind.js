// A chunk that 404s after a deploy surfaces as one of these, depending on the browser.
const CHUNK_ERROR =
  /dynamically imported module|Importing a module script failed|Failed to fetch dynamically|ChunkLoadError|Loading chunk/i;

const isOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;

export function errorKind(error) {
  if (isOffline()) return "offline";
  if (error?.name === "ChunkLoadError" || CHUNK_ERROR.test(error?.message ?? "")) return "update";
  return "generic";
}

export function priceErrorKind(error) {
  const status = error?.response?.status;
  if (status === 401 || status === 403) return "auth";
  if (error?.name === "InvalidPriceError") return "invalid";
  if (isOffline()) return "offline";
  return "generic";
}
