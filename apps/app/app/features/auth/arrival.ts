import { useLocation } from "react-router"

/** What another auth page hands over through router state. */
interface Arrival {
  email?: string
  notice?: "passwordChanged" | "accountCreated"
}

export const useArrival = () => (useLocation().state ?? {}) as Arrival
