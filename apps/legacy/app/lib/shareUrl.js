// A UUID-shaped id, validated before it ever reaches a request URL — the
// same defensive pattern queryKeys.js uses for jobId. Anything else renders
// the invalid-link state without spending a network call (or a view).
export const SHARE_ID_PATTERN = /^[a-zA-Z0-9_-]{8,64}$/;

export const isValidShareId = (shareId) =>
  typeof shareId === "string" && SHARE_ID_PATTERN.test(shareId);

// share_url is the backend's own domain (api.letshyre.com) — not this
// frontend's origin. share_token is the actual scorecard id, so the URL is
// always built locally against /shared-scorecard/:shareId instead.
export function buildShareUrl(link) {
  const token = link?.share_token;
  if (typeof token !== "string" || !SHARE_ID_PATTERN.test(token)) return null;
  return `${window.location.origin}/shared-scorecard/${token}`;
}
