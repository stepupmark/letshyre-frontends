/** CSS only; hidden where scroll-driven animations aren't supported. */
export function ReadProgress() {
  return (
    <div
      aria-hidden
      className="read-progress pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-brand rtl:origin-right print:hidden"
    />
  )
}
