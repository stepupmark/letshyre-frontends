import { useEffect, useRef, useState } from "react"

/** Same-origin so the text can be swapped without a white flash; scripts still can't run. */
export function EmailFrame({ html, title }: { html: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(480)

  useEffect(() => {
    const doc = frame.current?.contentDocument
    if (!doc) return
    const next = new DOMParser().parseFromString(html, "text/html")
    doc.replaceChild(
      doc.importNode(next.documentElement, true),
      doc.documentElement
    )
    // the blank frame is in quirks mode, where the body stretches to the frame, so measure its content
    const measure = () => {
      const range = doc.createRange()
      range.selectNodeContents(doc.body)
      const padding = parseFloat(getComputedStyle(doc.body).paddingBottom) || 0
      setHeight(Math.ceil(range.getBoundingClientRect().bottom + padding))
    }
    const observer = new ResizeObserver(measure)
    for (const child of doc.body.children) observer.observe(child)
    measure()
    return () => {
      observer.disconnect()
    }
  }, [html])

  return (
    <iframe
      ref={frame}
      title={title}
      sandbox="allow-same-origin"
      style={{ height }}
      className="pointer-events-none block w-full"
    />
  )
}
