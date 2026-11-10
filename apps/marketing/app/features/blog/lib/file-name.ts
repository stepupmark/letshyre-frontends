/** A download's file name from its title, in any script. */
export const fileName = (title: string, type: string) =>
  `${title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-")}.${type.toLowerCase()}`
