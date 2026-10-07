const NETWORKS = {
  "linkedin.com": "linkedin",
  "x.com": "x",
  "twitter.com": "x",
  "instagram.com": "instagram",
  "youtube.com": "youtube",
} as const

export type SocialNetwork = (typeof NETWORKS)[keyof typeof NETWORKS]

/** Which icon and label a profile URL gets. `null` for networks we don't have an icon for. */
export function socialNetwork(url: string): SocialNetwork | null {
  const host = new URL(url).hostname.replace(/^www\./, "")
  return host in NETWORKS ? NETWORKS[host as keyof typeof NETWORKS] : null
}
