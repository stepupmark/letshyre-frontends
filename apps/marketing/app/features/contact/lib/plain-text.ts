// Legacy headings carry <br/> and <hl> markup; the redesign shows them as plain text.
export const plainText = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/\s+/g, " ")
    .trim()
