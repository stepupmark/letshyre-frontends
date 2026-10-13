/** "acme.in" → "https://acme.in", so people needn't type the scheme. */
export const withScheme = (value: string) =>
  value && !/^https?:\/\//i.test(value) ? `https://${value}` : value
