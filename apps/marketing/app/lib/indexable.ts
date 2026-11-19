/** Unset means production builds are indexable and nothing else is. */
export const indexable = (viteEnv: string, flag: string | undefined) =>
  flag === "true" || flag === "false"
    ? flag === "true"
    : viteEnv === "production"
