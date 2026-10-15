import type { CSSProperties } from "react"

const wait = (ms: number): CSSProperties => ({
  transitionDelay: `${ms}ms`,
  animationDelay: `${ms}ms`,
})

function Lines({ x, y, widths }: { x: number; y: number; widths: number[] }) {
  return widths.map((width, i) => (
    <rect
      key={i}
      x={x}
      y={y + i * 13}
      width={width}
      height={5}
      rx={2.5}
      className="fill-muted-foreground/25"
    />
  ))
}

/** A JD page whose details land in the form's fields. */
export function JdFlowArt() {
  return (
    <svg viewBox="0 0 320 220" aria-hidden="true" className="w-full">
      <g className="settle">
        <rect
          x={12}
          y={20}
          width={124}
          height={168}
          rx={14}
          className="fill-card stroke-border"
        />
        <rect
          x={28}
          y={38}
          width={34}
          height={8}
          rx={4}
          className="fill-brand"
        />
        <rect
          x={28}
          y={54}
          width={78}
          height={7}
          rx={3.5}
          className="fill-foreground/55"
        />
        <Lines x={28} y={76} widths={[92, 80, 88]} />
        <rect
          x={24}
          y={112}
          width={100}
          height={22}
          rx={6}
          className="fill-brand-muted"
        />
        <Lines x={32} y={120} widths={[62]} />
        <Lines x={28} y={146} widths={[86, 70, 54]} />
      </g>

      <path
        d="M 136 120 C 160 120, 158 82, 182 82"
        pathLength={1}
        className="draw fill-none stroke-brand"
        strokeWidth={2}
        strokeLinecap="round"
      />

      <g className="settle" style={wait(150)}>
        <rect
          x={184}
          y={44}
          width={124}
          height={160}
          rx={14}
          className="fill-card stroke-border"
        />
        {[0, 1, 2, 3].map((row) => (
          <g key={row}>
            <rect
              x={198}
              y={62 + row * 34}
              width={36}
              height={5}
              rx={2.5}
              className="fill-muted-foreground/35"
            />
            <rect
              x={198}
              y={72 + row * 34}
              width={96}
              height={14}
              rx={5}
              className="fill-background stroke-border"
            />
            <rect
              x={203}
              y={77 + row * 34}
              width={[54, 40, 62, 46][row]}
              height={4}
              rx={2}
              className="grow-x fill-brand/70"
              style={wait(700 + row * 140)}
            />
            <circle
              cx={286}
              cy={79 + row * 34}
              r={4}
              className="pop fill-success"
              style={wait(900 + row * 140)}
            />
          </g>
        ))}
      </g>
    </svg>
  )
}

/** The JD under a moving scan line; runs until the read finishes. */
export function ReadingArt() {
  return (
    <svg viewBox="0 0 200 220" aria-hidden="true" className="w-full max-w-52">
      <rect
        x={30}
        y={10}
        width={140}
        height={196}
        rx={14}
        className="fill-card stroke-border"
      />
      <rect x={48} y={30} width={38} height={8} rx={4} className="fill-brand" />
      <rect
        x={48}
        y={46}
        width={88}
        height={7}
        rx={3.5}
        className="fill-foreground/55"
      />
      <Lines x={48} y={70} widths={[104, 92, 100, 70]} />
      <Lines x={48} y={130} widths={[96, 104, 84, 98, 60]} />
      <g className="sweep">
        <rect
          x={36}
          y={22}
          width={128}
          height={18}
          rx={4}
          className="fill-brand/10"
        />
        <rect
          x={36}
          y={39}
          width={128}
          height={2}
          rx={1}
          className="fill-brand"
        />
      </g>
    </svg>
  )
}

/** A posted job card with its first applicants. */
export function EmptyJobsArt() {
  return (
    <svg viewBox="0 0 240 140" aria-hidden="true" className="w-56">
      <rect
        x={46}
        y={14}
        width={150}
        height={100}
        rx={14}
        className="fill-muted stroke-border"
        transform="rotate(-5 121 64)"
      />
      <g className="settle">
        <rect
          x={42}
          y={24}
          width={156}
          height={104}
          rx={14}
          className="fill-card stroke-border"
        />
        <rect
          x={58}
          y={40}
          width={30}
          height={30}
          rx={9}
          className="fill-brand-muted"
        />
        <path
          d="M 66 52 h 14 v 11 h -14 z M 69 52 v -3 h 8 v 3"
          className="fill-none stroke-brand"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <rect
          x={98}
          y={44}
          width={74}
          height={7}
          rx={3.5}
          className="fill-foreground/55"
        />
        <Lines x={98} y={58} widths={[52]} />
        <rect
          x={58}
          y={84}
          width={44}
          height={14}
          rx={7}
          className="fill-brand-muted"
        />
        <rect
          x={64}
          y={89}
          width={32}
          height={4}
          rx={2}
          className="fill-brand/60"
        />
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={146 + i * 14}
            cy={106}
            r={8}
            className="pop fill-brand-muted stroke-card"
            strokeWidth={2.5}
            style={wait(500 + i * 120)}
          />
        ))}
      </g>
      <g className="pop" style={wait(300)}>
        <circle cx={198} cy={24} r={13} className="fill-brand" />
        <path
          d="M 198 18 v 12 M 192 24 h 12"
          className="stroke-primary-foreground"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
