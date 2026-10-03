import React from "react";

// Hover-only, CSS-driven tooltip (not the Radix primitive) so it can sit inline
// in text flow without a separate trigger element.
export const Tooltip = ({ children, text }) => (
  <span className="group relative inline-block cursor-help border-b-2 border-dotted border-neutral-400 font-semibold text-brand-400">
    {children}
    <span className="invisible absolute bottom-[125%] left-1/2 z-100 w-62.5 -translate-x-1/2 translate-y-2.5 rounded-sm bg-text-body p-3 text-center text-sm leading-normal font-normal text-white opacity-0 shadow-[0_10px_25px_rgba(0,0,0,0.2)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 pointer-events-none after:absolute after:top-full after:left-1/2 after:-ml-1.25 after:border-5 after:border-solid after:border-transparent after:border-t-text-body after:content-['']">
      {text}
    </span>
  </span>
);
