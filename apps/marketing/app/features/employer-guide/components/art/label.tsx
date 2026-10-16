/** A short label drawn in the sketch. */
export function Label({
  x,
  y,
  children,
  strong = false,
  anchor,
  className,
}: {
  x: number
  y: number
  children: string
  strong?: boolean
  anchor?: "middle" | "end"
  className?: string
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={strong ? 11 : 9}
      className={
        className ??
        (strong
          ? "fill-foreground font-semibold"
          : "fill-muted-foreground font-medium")
      }
    >
      {children}
    </text>
  )
}
