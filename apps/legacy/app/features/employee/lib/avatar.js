// Deterministic initials-avatar fallback (DiceBear), seeded on the given
// string. No default seed — callers pass their own fallback text.
// (Profile/scorecard views use avatarFallback() in candidate-profile/utils.js — a
// different service with a different look, kept separate on purpose.)
export const initialsAvatar = (seed) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}`;
