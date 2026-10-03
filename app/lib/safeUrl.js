// Strips dangerous URL schemes before an API-sourced value (logos, employer
// links) lands in an href/src. Denylist, not allowlist: https/http/mailto/tel,
// relative and protocol-relative URLs pass through; only injection vectors
// (javascript:, data:, etc.) collapse to `fallback`.
const DANGEROUS_SCHEME = /^\s*(?:javascript|data|vbscript|file|blob):/i;

export function safeUrl(url, fallback = "") {
  if (typeof url !== "string" || !url.trim()) return fallback;
  if (DANGEROUS_SCHEME.test(url)) return fallback;
  return url;
}
