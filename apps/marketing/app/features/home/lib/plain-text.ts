/**
 * Legacy copy carries inline markup like `<hl>` and `<br/>`. The redesign shows it as plain
 * text, so existing translations stay usable as they are.
 */
export const plainText = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/\s+/g, " ")
    .trim()
