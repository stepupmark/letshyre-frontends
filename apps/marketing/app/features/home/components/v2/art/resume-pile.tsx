const SHEETS = [0, 5, -3, 6, -2, 4, -5, 2, -1, 3]

export function ResumePile({ label }: { label: string }) {
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 320 200"
      className="size-full"
    >
      <line
        x1="16"
        x2="304"
        y1="186"
        y2="186"
        strokeWidth="2"
        className="stroke-border"
      />

      <rect
        x="60"
        y="130"
        width="232"
        height="8"
        rx="3"
        className="fill-muted-foreground/35"
      />
      <rect
        x="76"
        y="138"
        width="6"
        height="48"
        className="fill-muted-foreground/35"
      />
      <rect
        x="270"
        y="138"
        width="6"
        height="48"
        className="fill-muted-foreground/35"
      />

      <g className="rise">
        {SHEETS.map((shift, index) => (
          <g
            key={index}
            transform={`translate(${String(168 + shift)} ${String(120 - index * 9)}) rotate(${String(shift / 3)})`}
          >
            <rect
              width="100"
              height="10"
              rx="2"
              strokeWidth="1.5"
              className="fill-card stroke-muted-foreground/45"
            />
            <rect
              x="8"
              y="4"
              width={index % 2 ? 40 : 54}
              height="2"
              rx="1"
              className="fill-muted-foreground/30"
            />
          </g>
        ))}
        <g transform="translate(164 14) rotate(-2)">
          <rect
            width="108"
            height="22"
            rx="3"
            strokeWidth="1.5"
            className="fill-card stroke-muted-foreground/45"
          />
          <circle cx="13" cy="11" r="6" className="fill-muted" />
          <rect
            x="25"
            y="7"
            width="46"
            height="3"
            rx="1.5"
            className="fill-foreground/40"
          />
          <rect
            x="25"
            y="13"
            width="30"
            height="3"
            rx="1.5"
            className="fill-muted-foreground/30"
          />
        </g>
      </g>

      <g transform="translate(244 170) rotate(14)">
        <rect
          width="46"
          height="12"
          rx="2"
          strokeWidth="1.5"
          className="fill-card stroke-muted-foreground/45"
        />
      </g>

      <path d="M78 130c0-26 10-38 34-38s34 12 34 38z" className="fill-brand" />
      <path
        d="M140 104c10-4 18-14 16-26"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
        className="stroke-brand"
      />
      <rect
        x="105"
        y="80"
        width="14"
        height="14"
        rx="4"
        className="fill-muted"
      />
      <circle
        cx="112"
        cy="66"
        r="17"
        strokeWidth="2"
        className="fill-muted stroke-foreground/70"
      />
      <path
        d="M95 64c0-12 8-19 18-19 9 0 16 6 16 14-7 0-14-3-17-8-3 6-9 10-17 13z"
        className="fill-foreground/80"
      />
      <circle cx="152" cy="74" r="6" className="fill-muted" />
      <path
        d="M118 74c2 1 4 1 6 0"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        className="stroke-foreground/70"
      />
    </svg>
  )
}
