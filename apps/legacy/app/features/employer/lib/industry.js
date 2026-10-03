// Maps a stored industry value to a known option's value. The backend may hold
// an option value, a human label, or a legacy string, so we match on value OR
// label — case-insensitively and string-coerced (exact, not substring). Falls
// back to the raw stored value so an unknown/legacy entry is preserved rather
// than silently dropped (callers surface it as an option so it stays visible).
export function resolveIndustryValue(stored, options = []) {
  if (!stored) return "";
  const norm = (s) => String(s).trim().toLowerCase();
  const hit = options.find(
    (o) => norm(o.value) === norm(stored) || norm(o.label) === norm(stored),
  );
  return hit ? hit.value : stored;
}
