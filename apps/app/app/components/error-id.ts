/** Short, stable id for an error, so a dev can match the screen to the console. */
export function errorId(error: unknown): string {
  const text =
    error instanceof Error
      ? `${error.name}:${error.message}`
      : JSON.stringify(error)
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, "0")
}
