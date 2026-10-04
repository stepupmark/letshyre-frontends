/** The API wraps most payloads as `{ success, data }` but not all; legacy read `data ?? body`. */
export const dataOf = (json: unknown) =>
  typeof json === "object" && json !== null && "data" in json ? json.data : json
