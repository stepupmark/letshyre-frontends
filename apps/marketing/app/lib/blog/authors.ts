export interface Author {
  name: string
  jobTitle: string
  /** A profile that confirms who they are, such as LinkedIn. */
  url?: string
}

/** People who sign posts, by the id a post's `author` uses. Unsigned posts are the team's. */
export const AUTHORS: Readonly<Record<string, Author>> = {}
