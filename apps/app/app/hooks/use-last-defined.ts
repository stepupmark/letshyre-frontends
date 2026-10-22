import { useState } from "react"

// a closing sheet still needs its content while it animates out
export function useLastDefined<T>(value: T | undefined) {
  const [last, setLast] = useState(value)
  if (value !== undefined && value !== last) setLast(value)
  return value ?? last
}
