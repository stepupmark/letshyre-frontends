/** Keeps the ends readable: ABCDE1234F → ABC•••••4F. */
export const mask = (value: string, keep = 3) =>
  value.length <= keep + 2
    ? value
    : `${value.slice(0, keep)}${"•".repeat(value.length - keep - 2)}${value.slice(-2)}`
