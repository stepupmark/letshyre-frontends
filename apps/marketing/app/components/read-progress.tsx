/** A bar across the top that fills as the page scrolls. CSS only; hidden where unsupported. */
export function ReadProgress() {
  return (
    <div
      aria-hidden
      className="read-progress pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-brand rtl:origin-right"
    />
  )
}
