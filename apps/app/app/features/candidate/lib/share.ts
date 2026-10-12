import type { ShareLink, SharedLink } from "../schemas/share.schema"
import type { LinkState } from "../types"
import { isShareId } from "./shared-scorecard"

export const MAX_SHARE_DAYS = 30

// the API's share_url points at its own host, so the link is built here
export const shareUrl = (link: Pick<ShareLink, "share_token">) =>
  isShareId(link.share_token)
    ? `${window.location.origin}/shared-scorecard/${link.share_token}`
    : null

export const stateOf = (link: SharedLink): LinkState =>
  link.is_expired
    ? "expired"
    : link.has_reached_max_views
      ? "used"
      : link.is_active
        ? "active"
        : "revoked"
