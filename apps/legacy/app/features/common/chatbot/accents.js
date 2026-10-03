// The chatbot UI is shared across roles; the accent is the only visual that
// differs. Each field is a full Tailwind class (not a fragment) so classes stay
// static and survive the JIT compiler — `solidHover` carries the `/90` opacity
// because that modifier can't be composed at runtime.
//
//   solid      – filled surfaces (user bubble, send button background)
//   solidHover – hover state for the send button
//   softBg     – tinted circle behind the bot/avatar glyph
//   softText   – the accent glyph/icon color on a soft background

export const EMPLOYEE_ACCENT = {
  solid: "bg-employee-accent",
  solidHover: "hover:bg-employee-accent/90",
  softBg: "bg-brand-100",
  softText: "text-employee-accent",
};

export const EMPLOYER_ACCENT = {
  solid: "bg-brand-600",
  solidHover: "hover:bg-brand-600/90",
  softBg: "bg-brand-100",
  softText: "text-brand-600",
};

// Landing-page widget. Brand blue, same as the employer accent — kept as its own
// export so the public bot's styling can diverge later without touching either
// authenticated bot.
export const PUBLIC_ACCENT = {
  solid: "bg-brand-600",
  solidHover: "hover:bg-brand-600/90",
  softBg: "bg-brand-100",
  softText: "text-brand-600",
};
