import { useEffect, useEffectEvent } from "react"

const ACTIVITY_KEY = "last_activity"
const EVENTS = ["pointerdown", "keydown", "scroll", "visibilitychange"] as const

function readLastActivity() {
  try {
    return Number(localStorage.getItem(ACTIVITY_KEY)) || Date.now()
  } catch {
    return Date.now()
  }
}

function markActivity() {
  try {
    localStorage.setItem(ACTIVITY_KEY, String(Date.now()))
  } catch {
    // ignore, the in-tab timer still works
  }
}

/** Calls onIdle after `timeoutMs` without activity in any open tab. */
export function useIdleTimeout(timeoutMs: number, onIdle: () => void) {
  const idle = useEffectEvent(onIdle)

  useEffect(() => {
    markActivity()
    let lastWrite = 0
    const onActivity = () => {
      const now = Date.now()
      if (now - lastWrite > 5_000) {
        lastWrite = now
        markActivity()
      }
    }

    EVENTS.forEach((event) => {
      window.addEventListener(event, onActivity, { passive: true })
    })
    const timer = window.setInterval(() => {
      if (Date.now() - readLastActivity() >= timeoutMs) idle()
    }, 30_000)

    return () => {
      EVENTS.forEach((event) => {
        window.removeEventListener(event, onActivity)
      })
      window.clearInterval(timer)
    }
  }, [timeoutMs])
}
