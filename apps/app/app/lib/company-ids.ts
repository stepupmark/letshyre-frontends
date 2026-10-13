/** Indian company identifiers and the web addresses companies give us. */

export const PAN = /^[A-Z]{5}[0-9]{4}[A-Z]$/

// state code, the PAN, entity number, a fixed Z, checksum
export const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/

export const PIN_CODE = /^[1-9][0-9]{5}$/

// country hosts too, like in.linkedin.com
export const isLinkedIn = (value: string) => {
  try {
    return /(^|\.)linkedin\.com$/i.test(new URL(value).hostname)
  } catch {
    return false
  }
}

/** "acme.in" → "https://acme.in", so people needn't type the scheme. */
export const withScheme = (value: string) =>
  value && !/^https?:\/\//i.test(value) ? `https://${value}` : value

/** Keeps the ends readable: ABCDE1234F → ABC•••••4F. */
export const mask = (value: string, keep = 3) =>
  value.length <= keep + 2
    ? value
    : `${value.slice(0, keep)}${"•".repeat(value.length - keep - 2)}${value.slice(-2)}`
