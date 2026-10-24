export type Verification = "verified" | "pending" | "rejected"

export const verificationOf = (status: string | null | undefined) => {
  const value = status?.trim().toLowerCase()
  if (!value) return null
  if (value === "approved" || value === "verified") return "verified"
  if (value === "rejected") return "rejected"
  return "pending"
}

const text = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null

// the profile endpoint has no personal details, so they come from the signed-in user
export const accountOf = (user: Record<string, unknown>) => ({
  name:
    text(user.name) ??
    text(
      [text(user.first_name), text(user.last_name)].filter(Boolean).join(" ")
    ),
  email: text(user.email),
  phone: text(user.phone_number),
})

export const masked = (value: string) =>
  value.length <= 4 ? value : `•••• ${value.slice(-4)}`

export const hostOf = (url: string) => new URL(url).host.replace(/^www\./, "")
