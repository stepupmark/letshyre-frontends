export function MatchScore({ score }: { score: number }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-lg font-semibold text-brand-text tabular-nums">
        {Math.round(score)}
      </span>
      <span className="text-xs text-muted-foreground">AI match</span>
    </span>
  )
}
