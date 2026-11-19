const KEY = "lh-stale-chunk-reload"
// a reload that fails again within this window means the chunk is broken, not stale
const RETRY_AFTER_MS = 60_000

/**
 * A tab opened before a deploy can import a chunk the new build no longer has. Reload once to
 * pick up the new build. React Router does the same for route modules itself.
 */
export function reloadOnStaleChunk(
  target: Window = window,
  now: () => number = Date.now
) {
  target.addEventListener("vite:preloadError", (event) => {
    try {
      const last = Number(target.sessionStorage.getItem(KEY) ?? 0)
      if (now() - last < RETRY_AFTER_MS) return
      target.sessionStorage.setItem(KEY, String(now()))
    } catch {
      return
    }
    event.preventDefault()
    target.location.reload()
  })
}
