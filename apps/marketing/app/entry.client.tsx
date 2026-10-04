import { startTransition, StrictMode } from "react"
import { hydrateRoot } from "react-dom/client"
import { HydratedRouter } from "react-router/dom"

// The page is prerendered, so let the browser paint it before hydration takes
// the main thread. Otherwise first paint waits for every module to run.
requestAnimationFrame(() => {
  setTimeout(() => {
    startTransition(() => {
      hydrateRoot(
        document,
        <StrictMode>
          <HydratedRouter />
        </StrictMode>
      )
    })
  })
})
