interface Address {
  line?: string
  city?: string
  state?: string
  pin?: string
}

/** The API takes an address as one line: "12 MG Road, Kochi, Kerala 682001". */
export const joinAddress = ({ line, city, state, pin }: Address) =>
  [line, city, [state, pin].filter(Boolean).join(" ")]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ")
