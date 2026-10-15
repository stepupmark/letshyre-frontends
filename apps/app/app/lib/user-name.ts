const text = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined

export function displayName(user: Record<string, unknown>) {
  const full = [text(user.first_name), text(user.last_name)]
    .filter(Boolean)
    .join(" ")
  return text(user.name) ?? text(full) ?? text(user.email) ?? ""
}

export function initials(name: string) {
  if (name.includes("@")) return name.charAt(0).toUpperCase()
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}
