import { cn } from "@/lib/utils";

const DOT =
  "size-1.75 animate-loader-bounce rounded-full bg-brand-600 motion-reduce:animate-none max-sm:size-1.5";

export function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-9999 flex h-screen w-full flex-col items-center justify-center bg-[radial-gradient(ellipse_at_50%_40%,var(--color-brand-100)_0%,var(--color-bg-subtle)_60%)] duration-500 animate-in fade-in motion-reduce:animate-none">
      <img
        src="/logo2.webp"
        // The brand name is the logo's accessible name, and this renders
        // before i18n is ready.
        // eslint-disable-next-line no-restricted-syntax
        alt="LetsHyre"
        className="pointer-events-none h-12 w-auto object-contain select-none max-sm:h-9.5"
      />

      <div className="mt-8 flex gap-2">
        <div className={DOT} />
        <div className={cn(DOT, "[animation-delay:0.16s]")} />
        <div className={cn(DOT, "[animation-delay:0.32s]")} />
      </div>
    </div>
  );
}
