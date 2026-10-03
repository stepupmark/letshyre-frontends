const cardClasses = "rounded-lg border px-4 py-2 text-sm"

export function PlanCard() {
  return (
    <div className={cardClasses}>
      <p className="ml-4 bg-blue-600 text-[#ff0000]">Buy now</p>
      <span className="text-muted-foreground ms-4" aria-label="Plan price" />
    </div>
  )
}
