import { startTransition, StrictMode } from "react"
import { hydrateRoot } from "react-dom/client"
import { HydratedRouter } from "react-router/dom"
import { reloadOnStaleChunk } from "@workspace/blocks/stale-chunks"

reloadOnStaleChunk()

// let the browser paint the shell before hydration takes the main thread
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
