export const INVITE_HREF = "{{invite_link}}"

export const isWebAddress = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
  } catch {
    return false
  }
}

export const allowedHref = (url: string) =>
  url === INVITE_HREF || /^(https?:\/\/|mailto:)/i.test(url)
