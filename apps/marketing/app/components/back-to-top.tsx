import { ArrowUpIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

/** Shows once the reader is a screen past the top. Needs a positioned parent. */
export function BackToTop({ label }: { label: string }) {
  const sentinel = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      setShown(
        entry !== undefined &&
          !entry.isIntersecting &&
          entry.boundingClientRect.top < 0
      )
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <div
        ref={sentinel}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-svh"
      />
      <a
        href="#main"
        aria-label={label}
        aria-hidden={!shown || undefined}
        tabIndex={shown ? undefined : -1}
        data-shown={shown || undefined}
        className="shadow-raised pointer-events-none fixed inset-e-4 bottom-4 z-40 grid size-11 scale-90 place-items-center rounded-full border bg-background/90 text-foreground opacity-0 backdrop-blur-md transition-[opacity,scale] duration-300 ease-out outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-shown:pointer-events-auto data-shown:scale-100 data-shown:opacity-100 motion-reduce:transition-none sm:inset-e-6 sm:bottom-6 print:hidden"
      >
        <ArrowUpIcon aria-hidden className="size-5" />
      </a>
    </>
  )
}
