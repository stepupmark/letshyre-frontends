export function Handover() {
  return (
    <svg viewBox="0 0 96 64" aria-hidden className="h-16 w-24 shrink-0">
      <rect
        x={10}
        y={10}
        width={44}
        height={48}
        rx={8}
        className="fill-muted"
      />
      <rect
        x={30}
        y={4}
        width={50}
        height={52}
        rx={8}
        className="settle fill-card stroke-border"
      />
      <circle
        cx={46}
        cy={22}
        r={8}
        strokeWidth={3}
        strokeDasharray="36 50"
        className="origin-center -rotate-90 fill-none stroke-brand transform-fill"
      />
      <rect
        x={60}
        y={17}
        width={14}
        height={4}
        rx={2}
        className="fill-muted-foreground/30"
      />
      <rect
        x={60}
        y={25}
        width={10}
        height={3}
        rx={1.5}
        className="fill-muted-foreground/20"
      />
      <rect x={38} y={38} width={34} height={4} rx={2} className="fill-muted" />
      <rect
        x={38}
        y={38}
        width={24}
        height={4}
        rx={2}
        className="grow-x fill-brand"
      />
      <rect x={38} y={46} width={34} height={4} rx={2} className="fill-muted" />
      <rect
        x={38}
        y={46}
        width={16}
        height={4}
        rx={2}
        className="grow-x fill-brand/60"
      />
      <circle cx={80} cy={52} r={9} className="pop fill-primary" />
      <path
        d="m76 52 3 3 5-6"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pop fill-none stroke-primary-foreground"
      />
    </svg>
  )
}
