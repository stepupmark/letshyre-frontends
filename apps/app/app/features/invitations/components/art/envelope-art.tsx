/** A letter sliding into its envelope, with a merge field already filled. */
export function EnvelopeArt() {
  return (
    <svg viewBox="0 0 200 140" aria-hidden="true" className="w-40">
      <g className="float">
        <rect
          x={46}
          y={14}
          width={108}
          height={84}
          rx={8}
          className="fill-card stroke-border"
        />
        <rect
          x={60}
          y={30}
          width={44}
          height={7}
          rx={3.5}
          className="fill-foreground/55"
        />
        <rect
          x={60}
          y={46}
          width={30}
          height={9}
          rx={4.5}
          className="fill-brand-muted"
        />
        <rect
          x={94}
          y={48}
          width={44}
          height={5}
          rx={2.5}
          className="fill-muted-foreground/25"
        />
        <rect
          x={60}
          y={62}
          width={78}
          height={5}
          rx={2.5}
          className="fill-muted-foreground/25"
        />
        <rect
          x={60}
          y={74}
          width={56}
          height={5}
          rx={2.5}
          className="fill-muted-foreground/25"
        />
      </g>
      <path
        d="M 28 64 L 100 108 L 172 64 L 172 126 Q 172 132 166 132 L 34 132 Q 28 132 28 126 Z"
        className="fill-muted stroke-border"
      />
      <path
        d="M 28 126 L 84 96 M 172 126 L 116 96"
        className="fill-none stroke-border"
      />
      <circle cx={150} cy={44} r={11} className="pop fill-brand" />
      <path
        d="M 145 44 L 149 48 L 156 40"
        pathLength={1}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="draw fill-none stroke-background"
      />
    </svg>
  )
}
