import { createContext, use } from "react"

interface DownloadState {
  started: boolean
  start: () => void
}

/** Set once a download link is clicked, so the page can point at the next step. */
export const DownloadState = createContext<DownloadState>({
  started: false,
  start: () => undefined,
})

export const useDownloadState = () => use(DownloadState)
