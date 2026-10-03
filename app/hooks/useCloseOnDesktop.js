import { useEffect } from "react";

// Closes a mobile nav drawer when the viewport crosses up into lg. The drawers
// are modal Radix Sheets (focus trap + scroll lock); left open across a resize
// they'd scroll-lock the page behind a now-hidden panel (lg:hidden won't
// release the trap). 64em is --breakpoint-lg, matching the layouts.
export function useCloseOnDesktop(onClose) {
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64em)");
    const handle = (e) => {
      if (e.matches) onClose();
    };
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, [onClose]);
}
