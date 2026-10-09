/** The API wraps most payloads as `{ success, data }` but not all. */
export const dataOf = (json: unknown) =>
  typeof json === "object" && json !== null && "data" in json ? json.data : json
