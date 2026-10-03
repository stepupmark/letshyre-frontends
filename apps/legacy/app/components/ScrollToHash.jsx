import { useEffect } from "react";
import { useLocation } from "react-router";

export function ScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const id = hash.replace("#", "");

    // Retry for a target that mounts late, but cap the attempts and clean up so
    // a hash pointing at an id that never appears can't loop forever.
    let timer;
    let attempts = 0;

    const scroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (++attempts > 20) return; // ~2s, then give up
      timer = setTimeout(scroll, 100);
    };

    scroll();
    return () => clearTimeout(timer);
  }, [hash]);

  return null;
}
