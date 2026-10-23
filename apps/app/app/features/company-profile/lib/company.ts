import type { Company } from "../schemas/company-profile.schema"

export type Verification = "verified" | "pending" | "rejected"

export const verificationOf = (status: string | null | undefined) => {
  const value = status?.trim().toLowerCase()
  if (!value) return null
  if (value === "approved" || value === "verified") return "verified"
  if (value === "rejected") return "rejected"
  return "pending"
}

const first = (...values: (string | null | undefined)[]) =>
  values.find((value) => value?.trim())?.trim() ?? null

export const accountOf = (company: Company) => {
  const user = company.user
  return {
    name: first(
      company.full_name,
      company.name,
      company.user_name,
      user?.full_name,
      user?.name,
      user?.user_name
    ),
    email: first(company.email, user?.email),
    phone: first(company.phone_number, user?.phone_number),
  }
}

export const masked = (value: string) =>
  value.length <= 4 ? value : `•••• ${value.slice(-4)}`

export const hostOf = (url: string) => new URL(url).host.replace(/^www\./, "")
