import { useEffect, useState, useSyncExternalStore } from "react"

const OPENED = "launcher:opened"
const GREETED = "launcher:greeted"
const GREET_AFTER_MS = 4000
const GREET_FOR_MS = 8000
const SCROLL_AWAY_PX = 120

// storage may be blocked; the launcher then behaves as on a first visit
const seen = (key: string) => {
  try {
    return sessionStorage.getItem(key) === "1"
  } catch {
    return false
  }
}

const remember = (key: string) => {
  try {
    sessionStorage.setItem(key, "1")
  } catch {
    /* blocked: forgotten on the next page */
  }
}

// the flags only change through this hook, which tracks its own updates
const noSubscription = () => () => undefined

/**
 * The launcher animates until the chat has been opened once in this tab, and
 * greets once per tab, a few seconds in, until it is dismissed or the page scrolls.
 */
export function useLauncher() {
  const openedBefore = useSyncExternalStore(
    noSubscription,
    () => seen(OPENED),
    () => false
  )
  const [openedNow, setOpenedNow] = useState(false)
  const [greeting, setGreeting] = useState(false)

  useEffect(() => {
    if (seen(GREETED) || seen(OPENED)) return

    let hide: ReturnType<typeof setTimeout> | undefined
    let from = 0
    const dismiss = () => {
      setGreeting(false)
      window.removeEventListener("scroll", onScroll)
    }
    // scroll restoration and small nudges shouldn't count as moving on
    const onScroll = () => {
      if (Math.abs(window.scrollY - from) > SCROLL_AWAY_PX) dismiss()
    }
    const show = setTimeout(() => {
      remember(GREETED)
      setGreeting(true)
      from = window.scrollY
      hide = setTimeout(dismiss, GREET_FOR_MS)
      window.addEventListener("scroll", onScroll, { passive: true })
    }, GREET_AFTER_MS)

    return () => {
      clearTimeout(show)
      clearTimeout(hide)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return {
    quiet: openedBefore || openedNow,
    greeting,
    dismissGreeting: () => {
      setGreeting(false)
    },
    opened: () => {
      remember(OPENED)
      setOpenedNow(true)
      setGreeting(false)
    },
  }
}
