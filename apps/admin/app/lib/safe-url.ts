const SAFE_PROTOCOLS = new Set(["http:", "https:"]);

/** Returns a normalised http(s) URL, or undefined for anything else (javascript:, data:, garbage). */
export function safeExternalUrl(raw: string | null | undefined): string | undefined {
  const value = raw?.trim();
  if (!value) return undefined;
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`);
    return SAFE_PROTOCOLS.has(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/** Only allows same-origin paths, so `?redirectTo=` can't send users to another site. */
export function safeRedirect(to: string | null | undefined, fallback = "/dashboard"): string {
  if (!to || !to.startsWith("/") || to.startsWith("//") || to.startsWith("/\\")) return fallback;
  return to;
}
