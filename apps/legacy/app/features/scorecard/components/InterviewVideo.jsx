import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Video, CirclePlay, LoaderCircle } from "lucide-react";
import { safeUrl } from "@/lib/safeUrl";
import { Button } from "@/components/ui/button";

// Save-Data is probed lazily; guarded for SSR/prerender.
function prefersReducedData() {
  if (typeof navigator === "undefined") return false;
  if (navigator.connection?.saveData) return true;
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-reduced-data: reduce)").matches;
  }
  return false;
}

// A single URL can't offer real codec fallback, but a typed <source> lets the
// browser reject an unplayable format early and fall through to onError.
function guessType(src) {
  const path = src.split("?")[0].toLowerCase();
  if (path.endsWith(".webm")) return "video/webm";
  if (path.endsWith(".ogg") || path.endsWith(".ogv")) return "video/ogg";
  if (path.endsWith(".mov")) return "video/quicktime";
  if (path.endsWith(".mp4") || path.endsWith(".m4v")) return "video/mp4";
  return "";
}

/**
 * The player: a click-to-load facade → native <video>. Playback speed,
 * picture-in-picture and fullscreen are all provided by the browser's native
 * controls, so we don't reimplement them. What the browser doesn't give us —
 * lazy loading, resume position, a buffering indicator and a retry path — lives
 * here.
 */
function VideoPlayer({ src, storageKey }) {
  const { t } = useTranslation("scorecard");
  const videoRef = useRef(null);
  const lastSaveRef = useRef(0);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [buffering, setBuffering] = useState(false);

  const preload = prefersReducedData() ? "none" : "metadata";
  const type = useMemo(() => guessType(src), [src]);

  const restorePosition = () => {
    const v = videoRef.current;
    if (!v) return;
    let saved;
    try {
      saved = Number(localStorage.getItem(storageKey)) || 0;
    } catch {
      saved = 0;
    }
    if (saved > 5 && Number.isFinite(v.duration) && saved < v.duration - 5) {
      v.currentTime = saved;
    }
  };

  const persistPosition = () => {
    const v = videoRef.current;
    if (!v) return;
    if (Math.abs(v.currentTime - lastSaveRef.current) >= 5) {
      lastSaveRef.current = v.currentTime;
      try {
        localStorage.setItem(storageKey, String(v.currentTime));
      } catch {
        /* storage full / unavailable — resume is best-effort */
      }
    }
  };

  const clearPosition = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* no-op */
    }
  };

  const retry = () => {
    setFailed(false);
    requestAnimationFrame(() => videoRef.current?.load());
  };

  if (!started) {
    return (
      <button
        type="button"
        onClick={() => setStarted(true)}
        aria-label={t("interview.play")}
        className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md bg-neutral-900 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <span className="flex size-16 items-center justify-center rounded-full bg-text-white/15 text-text-white transition-transform duration-200 group-hover:scale-110 group-hover:bg-text-white/25 motion-reduce:transition-none">
          <CirclePlay size={32} />
        </span>
        <span className="absolute bottom-3 text-sm font-medium text-text-white/90">
          {t("interview.play")}
        </span>
      </button>
    );
  }

  if (failed) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md bg-bg-subtle px-4 py-8 text-center">
        <p className="m-0 text-sm text-text-muted">{t("interview.error")}</p>
        <Button variant="outline" size="sm" onClick={retry}>
          {t("interview.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-neutral-900">
      <video
        ref={videoRef}
        controls
        controlsList="nodownload"
        playsInline
        preload={preload}
        autoPlay
        aria-label={t("interview.videoLabel")}
        onLoadedMetadata={restorePosition}
        onTimeUpdate={persistPosition}
        onEnded={clearPosition}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onError={() => setFailed(true)}
        className="block h-full w-full object-contain"
      >
        {type ? <source src={src} type={type} /> : <source src={src} />}
      </video>

      {buffering && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-900/40"
          role="status"
          aria-label={t("interview.loading")}
        >
          <LoaderCircle
            size={40}
            className="animate-spin text-text-white motion-reduce:animate-none"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}

/**
 * The candidate's recorded interview video.
 *
 * Employer-only: rendered by ScorecardView solely when the employer page opts
 * in, so it never appears on the candidate's own scorecard. The URL is a full,
 * ready-to-use link from the API (data.candidate_interview_video); safeUrl only
 * strips dangerous schemes before it reaches src — nothing is appended.
 */
export function InterviewVideo({ url }) {
  const { t } = useTranslation("scorecard");
  const src = safeUrl(url);

  // Keyed by the URL path (not the signed query) so resume survives URL refresh.
  const storageKey = useMemo(() => {
    if (!src) return "";
    try {
      return `lh:interview:${new URL(src).pathname}`;
    } catch {
      return `lh:interview:${src}`;
    }
  }, [src]);

  return (
    <section
      className="rounded-lg border border-border-soft bg-card p-5 shadow-sm"
      aria-labelledby="interview-video-heading"
    >
      <h3
        id="interview-video-heading"
        className="mt-0 mb-4 flex items-center gap-2 text-base font-bold text-text-main"
      >
        <Video size={18} className="text-brand-600" aria-hidden="true" />
        {t("interview.title")}
      </h3>

      {src ? (
        <VideoPlayer src={src} storageKey={storageKey} />
      ) : (
        <p className="m-0 rounded-md bg-bg-subtle px-4 py-6 text-center text-sm text-text-muted">
          {t("interview.empty")}
        </p>
      )}
    </section>
  );
}

export default InterviewVideo;
