// legacy copy carries <br/> and <hl> markup; shown as plain text so its translations still fit
export const plainText = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/\s+/g, " ")
    .trim()
