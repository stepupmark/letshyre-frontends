import { cn } from "@workspace/ui/lib/utils"

/** The assistant as a speech bubble with eyes. `quiet` keeps only the blink and the ripple. */
export function LauncherFace({ quiet }: { quiet: boolean }) {
  return (
    <>
      <span
        aria-hidden
        className="launcher-ripple absolute inset-0 rounded-full border-2 border-primary opacity-0"
      />
      <svg
        aria-hidden
        viewBox="0 0 64 64"
        className={cn("size-full rtl:-scale-x-100", !quiet && "launcher-bob")}
      >
        <path
          d="M32 6a24 24 0 1 0 15.5 42.3L56 54l-4.4-10.2A24 24 0 0 0 32 6Z"
          className="fill-primary"
        />
        <g className="origin-center transition-transform duration-200 transform-fill group-hover:scale-115 group-focus-visible:scale-115 motion-reduce:transition-none">
          <g className={cn(!quiet && "launcher-glance")}>
            <g className={cn(!quiet && "launcher-eyes")}>
              <rect
                x="22"
                y="24"
                width="5"
                height="11"
                rx="2.5"
                className="launcher-blink fill-primary-foreground"
              />
              <rect
                x="37"
                y="24"
                width="5"
                height="11"
                rx="2.5"
                className="launcher-blink fill-primary-foreground"
              />
            </g>
          </g>
          {!quiet && (
            <g className="launcher-dots opacity-0">
              {[23, 32, 41].map((cx) => (
                <circle
                  key={cx}
                  cx={cx}
                  cy="30"
                  r="2.5"
                  className="fill-primary-foreground"
                />
              ))}
            </g>
          )}
        </g>
      </svg>
    </>
  )
}
