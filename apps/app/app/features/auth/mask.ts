/** a••••@mail.com: enough to recognise, not enough to read over a shoulder */
export function maskEmail(email: string) {
  const [user = "", domain = ""] = email.split("@")
  return domain ? `${user.slice(0, 1)}••••@${domain}` : email
}

export const maskPhone = (phone: string) => `+91 ••••••${phone.slice(-4)}`
