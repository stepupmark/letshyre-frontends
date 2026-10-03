# LetsHyre Design System

A single source of truth for all visual decisions in the LetsHyre frontend. Every color, font, spacing value, shadow and radius is declared in the `@theme` block of `app/styles/tailwind.css`, and flows through the app as both Tailwind utilities and CSS custom properties.ddddddddd

---

## Table of Contents

1. [Architecture](#architecture)
2. [Colors](#colors)
3. [Typography](#typography)
4. [Spacing](#spacing)  
5. [Border Radius](#border-radius)
6. [Shadows](#shadows)
7. [Transitions](#transitions)
8. [Z-Index](#z-index)
9. [Layout](#layout)
10. [Responsiveness](#responsiveness)
11. [Rules for New Code](#rules-for-new-code)
12. [Adding New Tokens](#adding-new-tokens)

---

## Architecture

```
project root/
└── app/
    ├── root.jsx          ← imports tailwind.css then global.css, once, for the whole app
    └── styles/
        ├── tailwind.css      ← the Tailwind v4 @theme: colors, spacing, radii, keyframes
        └── global.css        ← class-based global rules (nav progress bar, skeletons)
```

There are no component or route stylesheets. Every feature surface is Tailwind
utilities written inline in JSX. An ESLint rule blocks bare `*.css` imports
outside `app/root.jsx` and `app/styles/` to keep it that way.

### One token system

The `@theme` block in `tailwind.css` is the source of truth. It declares the
palette, spacing scale, radii, shadows, containers, breakpoints and keyframes,
and Tailwind generates both the utilities (`bg-brand-500`) and the matching
custom properties (`--color-brand-500`) from each entry.

**Reach for a Tailwind utility first, and `var(--color-*)` only where a utility
cannot express it** — inside a gradient, a composed `box-shadow`, or a keyframe.

The older `tokens.css` and its `--clr-*` / `--space-*` / `--font-*` names are
deleted. If you meet one in an old branch, the replacement is the same name in
Tailwind's namespace: `--clr-border` → `--color-border`, `--space-4` → `p-4`.

Breakpoints are Tailwind variants now — see [Responsiveness](#responsiveness).

---

## Colors

### Brand Scale

The brand palette is a blue family. Pick by intensity — not by number.

| Token | Hex | Use |
|---|---|---|
| `--clr-brand-100` | `#eff6ff` | Page tint, hover backgrounds, subtle fills |
| `--clr-brand-200` | `#dbeafe` | Tab borders, sidebar dividers |
| `--clr-brand-300` | `#bfdbfe` | Decorative borders |
| `--clr-brand-400` | `#73a5ef` | Decorative accents, landing balls, focus rings |
| `--clr-brand-500` | `#6296ef` | Primary actions on light backgrounds, icons |
| `--clr-brand-600` | `#2563eb` | CTA buttons, links, active states (strongest) |
| `--clr-brand-700` | `#1d4ed8` | Hover state for brand-600 |
| `--clr-brand-800` | `#1e3a8a` | Deep brand, rarely used |
| `--clr-brand-900` | `#0f172a` | Near-black headings on brand backgrounds |
| `--clr-brand-accent` | `#185fa5` | Landing page italic/cursive accent text |
| `--clr-employee-accent` | `#3b6df0` | Employee dashboard sidebar active state (distinct from employer blue) |

### Neutral Scale (Slate)

| Token | Hex | Common Use |
|---|---|---|
| `--clr-neutral-50` | `#f8fafc` | Lightest background |
| `--clr-neutral-100` | `#f1f5f9` | Hover states, sidebar close buttons |
| `--clr-neutral-200` | `#e2e8f0` | Light borders, dividers |
| `--clr-neutral-300` | `#cbd5e1` | Inactive states |
| `--clr-neutral-400` | `#94a3b8` | Faint icons, placeholder text |
| `--clr-neutral-500` | `#64748b` | Nav link defaults, secondary labels |
| `--clr-neutral-600` | `#475569` | Muted body text |
| `--clr-neutral-700` | `#334155` | Subheadings |
| `--clr-neutral-800` | `#1e293b` | Dark buttons, strong body text |
| `--clr-neutral-900` | `#0f172a` | Near-black — primary text, dark CTAs |

### Semantic Colors

Use these for **meaning**, not decoration.

| Token | Hex | Use |
|---|---|---|
| `--clr-success` | `#10b981` | Online status, success icons |
| `--clr-success-bg` | `#d1fae5` | Success message backgrounds |
| `--clr-danger` | `#ef4444` | Logout, delete, error text |
| `--clr-danger-bg` | `#fee2e2` | Error/danger card backgrounds |
| `--clr-warning` | `#f59e0b` | Warning icons |
| `--clr-warning-bg` | `#fef3c7` | Warning card backgrounds |

### Surface / Background

| Token | Hex | Use |
|---|---|---|
| `--clr-bg-page` | `#f6faff` | General page background |
| `--clr-bg-card` | `#ffffff` | Cards, sidebars, modals, panels |
| `--clr-bg-subtle` | `#f8fafc` | Secondary backgrounds inside cards |

### Text Colors

| Token | Hex | Use |
|---|---|---|
| `--clr-text-main` | `#0f172a` | Primary headings, strong text |
| `--clr-text-body` | `#1e293b` | Default paragraph text |
| `--clr-text-muted` | `#475569` | Secondary labels, captions |
| `--clr-text-faint` | `#94a3b8` | Placeholder text, disabled |
| `--clr-text-white` | `#ffffff` | Text on dark/colored backgrounds |

### Border Colors

| Token | Hex | Use |
|---|---|---|
| `--clr-border` | `#e2e8f0` | Standard borders, dividers |
| `--clr-border-soft` | `#eef2f8` | Subtle blue-tinted borders (employer panels) |
| `--clr-border-focus` | `#73a5ef` | Input focus rings |

### Gradients

| Token | Use |
|---|---|
| `--gradient-brand` | Auth page background balls, decorative fills |
| `--gradient-dark-cta` | Dark call-to-action button backgrounds |

---

## Typography

Two font families only. Everything in the UI uses one of these two.

| Token | Stack | Use |
|---|---|---|
| `--font-display` | `"Merriweather", Georgia, serif` | Section headings, marketing titles |
| `--font-body` | `"Merriweather", Georgia, serif` | Body copy, form labels |
| `--font-ui` | `"DM Sans", system-ui, sans-serif` | Buttons, nav, dashboards, all UI chrome |
| `--font-mono` | `"Courier New", Courier, monospace` | Code snippets |

> **Quick rule:** anything the user reads as content → `--font-body`. Anything that is interface chrome → `--font-ui`.

Fonts are loaded in `index.html` via a single `<link>` to Google Fonts (DM Sans + Merriweather). Never add a `@import url(...)` for fonts inside a CSS file.

### Font Size Scale

| Token | rem | px |
|---|---|---|
| `--text-xs` | 0.75rem | 12px |
| `--text-sm` | 0.875rem | 14px |
| `--text-base` | 1rem | 16px |
| `--text-lg` | 1.125rem | 18px |
| `--text-xl` | 1.25rem | 20px |
| `--text-2xl` | 1.5rem | 24px |
| `--text-3xl` | 1.875rem | 30px |
| `--text-4xl` | 2.25rem | 36px |
| `--text-5xl` | 3rem | 48px |

---

## Spacing

4px base unit. Use these for `padding`, `margin`, `gap`, and similar properties.

| Token | rem | px |
|---|---|---|
| `--space-1` | 0.25rem | 4px |
| `--space-2` | 0.5rem | 8px |
| `--space-3` | 0.75rem | 12px |
| `--space-4` | 1rem | 16px |
| `--space-5` | 1.25rem | 20px |
| `--space-6` | 1.5rem | 24px |
| `--space-8` | 2rem | 32px |
| `--space-10` | 2.5rem | 40px |
| `--space-12` | 3rem | 48px |
| `--space-16` | 4rem | 64px |
| `--space-20` | 5rem | 80px |
| `--space-24` | 6rem | 96px |

---

## Border Radius

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 0.375rem (6px) | Small chips, tags |
| `--radius-md` | 0.75rem (12px) | Cards, buttons |
| `--radius-lg` | 1rem (16px) | Larger panels, modals |
| `--radius-xl` | 1.5rem (24px) | Dashboard sidebars, big cards |
| `--radius-full` | 9999px | Pills, avatars, circles |

---

## Shadows

| Token | Use |
|---|---|
| `--shadow-sm` | Subtle card lift |
| `--shadow-md` | Default card shadow |
| `--shadow-lg` | Dropdowns, floating panels |
| `--shadow-xl` | Modals, full-screen overlays |
| `--shadow-brand` | Brand-tinted glow (blue) on focus/active |

---

## Transitions

| Token | Duration | Use |
|---|---|---|
| `--transition-fast` | 0.15s ease | Micro-interactions, icon color changes |
| `--transition-base` | 0.25s ease | Default hover effects, background changes |
| `--transition-slow` | 0.4s cubic-bezier | Layout shifts, panel slides |
| `--transition-spring` | 0.9s spring | Entrance animations, modal pop |

---

## Z-Index

Never write a raw `z-index` number. Use these tokens so layers never collide.

| Token | Value | Layer |
|---|---|---|
| `--z-base` | 1 | Raised content (e.g. card above page) |
| `--z-raised` | 10 | Sticky headers |
| `--z-dropdown` | 100 | Dropdowns, tooltips |
| `--z-sticky` | 200 | Fixed navigation bars |
| `--z-overlay` | 500 | Overlay dimmer behind modals |
| `--z-modal` | 600 | Modal dialogs |
| `--z-toast` | 9999 | Toast notifications (always on top) |

---

## Layout

### Container caps

Content must stop growing on ultra-wide / 4K / TV screens — past the cap it
centers and the gutters absorb the extra width. Use the reusable wrapper
classes from `global.css` rather than re-declaring `max-width` per component.

| Token | Value | Wrapper class | Use |
|---|---|---|---|
| `--container-prose` | 65ch | `.container--prose` | Long-form reading text (policy, about) |
| `--container-content` | 1280px | `.container` | Standard marketing / content pages |
| `--container-wide` | 1440px | `.container--wide` | Dashboards, data-dense layouts |
| `--container-max` | 1600px | `.container--fluid` | Hard ceiling for full-bleed content |
| `--page-padding-x` | `clamp(1.25rem, 5vw, 6rem)` | — | Responsive horizontal gutter |
| `--section-gap-y` | `--space-fluid-lg` | `.section` | Vertical space between page sections |

`--page-max-width` (→ `--container-content`) and `--dashboard-max-width`
(→ `--container-wide`) remain as back-compat aliases.

---

## Responsiveness

The app is built to work from small phones (360px) up through 4K / TV
(2560px+). Three mechanisms carry the load: **breakpoint tokens**, **fluid
scales**, and **container caps**.

### Breakpoints

Breakpoints are Tailwind variants, declared once in the `@theme` block of
`app/styles/tailwind.css`. They are in `em` so they respect the user's browser
zoom, and they map 1:1 onto the old `--bp-*` tiers.

| Variant | Min-width | px @16 | Device class |
|---|---|---|---|
| `xs:` | 22.5em | 360px | small mobile |
| `sm:` | 30em | 480px | normal mobile |
| `md:` | 48em | 768px | small / medium tablet |
| `lg:` | 64em | 1024px | big tablet, small laptop |
| `xl:` | 80em | 1280px | normal laptop |
| `2xl:` | 90em | 1440px | large desktop |
| `3xl:` | 120em | 1920px | ultra-wide / TV |
| `4xl:` | 160em | 2560px | 4K |

Each has a `max-*` counterpart (`max-md:`, compiling to `@media (width < 48em)`)
for the rare case where a mobile-first rewrite isn't practical. Tailwind sorts
`max-*` variants descending, so `max-md:` wins over `max-lg:` on a phone.

**Write mobile-first** — unprefixed utilities target the smallest screen, then
layer enhancements upward:

```jsx
{/* GOOD — mobile-first, canonical breakpoints */}
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" />
```

```jsx
{/* BAD — raw px breakpoint, invents a new value */}
<div className="max-[923px]:hidden" />
```

**Never write a raw px breakpoint.** Pick the nearest tier. There is no variant
for 923px, 992px or 1178px on purpose — those are exactly the kind of one-off
values this system replaced.

### How breakpoints work (build setup)

`@tailwindcss/vite` compiles the `@theme` block; there is no PostCSS config in
this project any more. The two plugins that used to resolve `@media (--bp-*)`
— `@csstools/postcss-global-data` and `postcss-custom-media` — were removed
along with `breakpoints.css` once the last legacy stylesheet was migrated.

To **add or change a breakpoint**, edit the `--breakpoint-*` entries in
`app/styles/tailwind.css` only.

### Common gotcha: grid blowout on small screens

A `1fr` grid/flex column is really `minmax(auto, 1fr)`. The `auto` floor lets
the track grow to its content's min-content width, so on narrow phones the
column can overflow its container (content gets clipped by the `overflow-x`
guard). Fix it with `minmax(0, 1fr)` and/or `min-width: 0` on the grid item so
the track can shrink:

```css
/* BAD — can overflow on small phones if content can't shrink */
.grid { grid-template-columns: 1fr; }

/* GOOD — track is allowed to shrink below content width */
.grid { grid-template-columns: minmax(0, 1fr); }
.grid > * { min-width: 0; }
```

### Fluid scales (spacing & type)

For spacing and type that should **breathe with the viewport** instead of
jumping at each breakpoint, use the fluid tokens. Each is a `clamp()` locked to
a minimum (~360px) and a maximum (~1920px) and scales smoothly between.

| Fluid spacing | Use |
|---|---|
| `--space-fluid-xs` … `--space-fluid-xl` | Section / page rhythm — vertical gaps, hero padding |
| `--space-fluid-lg` (= `--section-gap-y`) | Default gap between page sections |

| Fluid type | Use |
|---|---|
| `--font-fluid-sm` … `--font-fluid-3xl` | Headings and display text that scale across devices |
| `--font-fluid-hero` | Landing-page hero titles (40px → 96px) |

**When to use which spacing scale:**

- **Fixed step scale** (`--space-1..24`) → component-internal spacing that
  should NOT scale: icon gaps, button padding, form field spacing.
- **Fluid scale** (`--space-fluid-*`) → layout rhythm that SHOULD scale:
  space between sections, hero vertical padding, large page margins.

```css
/* Section rhythm scales with the screen */
.section        { padding-block: var(--space-fluid-lg); }
.hero           { padding-block: var(--space-fluid-xl); }
/* Button padding stays fixed regardless of screen size */
.btn            { padding: var(--space-3) var(--space-5); }
```

### Handling ultra-wide / 4K / TV

- Wrap page content in a container class so it caps and centers — never let a
  layout span the full 2560px.
- Full-bleed backgrounds (nav bars, hero background colours) SHOULD span edge
  to edge; only the **content** inside them is capped.
- Test at 1920 and 2560: content should sit centered with growing side gutters,
  not stretched into unreadable line lengths.

### Guardrails already in place (global.css)

- `html { font-size: 100%; }` — respects the user's browser font-size setting.
- `body { overflow-x: hidden; }` — guards against accidental horizontal scroll.
- `img, video { max-width: 100%; }` — media never overflows its container.
- `@media (prefers-reduced-motion: reduce)` — animations disabled for users who
  ask their OS to reduce motion.

### QA matrix

Before shipping a responsive change, check these widths (no horizontal scroll
at any of them):

`320 · 360 · 414 · 600 · 768 · 1024 · 1280 · 1440 · 1920 · 2560`

---

## Rules for New Code

### Always use tokens — never hardcode values

```css
/* BAD */
color: #475569;
color: white;
padding: 16px;
border-radius: 12px;
font-family: "DM Sans", sans-serif;
font-family: "Inter", sans-serif;

/* GOOD */
color: var(--clr-text-muted);
color: var(--clr-text-white);
padding: var(--space-4);
border-radius: var(--radius-md);
font-family: var(--font-ui);
```

### Never use CSS named color keywords

Named keywords (`white`, `black`, `grey`, `gray`, `red`, `transparent`) bypass the token system and are invisible to theming tools.

```css
/* BAD */
color: white;
background: black;
border-top-color: white;

/* GOOD */
color: var(--clr-text-white);
background: var(--clr-neutral-900);
border-top-color: var(--clr-text-white);
```

Exception: `transparent` is a CSS keyword with no token equivalent — it is allowed.

### Choosing a color token

| Situation | Token to use |
|---|---|
| Page background | `--clr-bg-page` |
| Card / panel background | `--clr-bg-card` |
| Secondary background inside a card | `--clr-bg-subtle` |
| Primary action button | `--clr-brand-500` or `--clr-brand-600` |
| Main heading text | `--clr-text-main` |
| Normal paragraph text | `--clr-text-body` |
| Caption, label, secondary text | `--clr-text-muted` |
| Placeholder / disabled | `--clr-text-faint` |
| Text on dark/coloured backgrounds | `--clr-text-white` |
| Standard border | `--clr-border` |
| Input focus ring | `--clr-border-focus` |
| Success state | `--clr-success` / `--clr-success-bg` |
| Error / delete / logout | `--clr-danger` / `--clr-danger-bg` |

### Employee vs Employer visuals

The two dashboard sides use a subtly different blue to give each side its own feel:

- **Employer** sidebar active → `--clr-brand-500` (`#6296ef`)
- **Employee** sidebar active → `--clr-employee-accent` (`#3b6df0`) — a slightly more vivid purple-blue
- **Employer** panel borders → `--clr-border-soft` (`#eef2f8`) — soft blue tint
- **Employee** page background → `--clr-brand-100` (`#eff6ff`) — lightest brand tint

Do not normalize these to the same value; the visual distinction is intentional.

### rgba() is allowed for alpha transparency

When you need a semi-transparent version of a token color, write the rgba inline — that's expected:

```css
/* Fine — rgba inline for alpha */
box-shadow: 0 6px 16px rgba(98, 150, 239, 0.25);  /* brand-500 at 25% */
background: rgba(15, 23, 42, 0.6);                 /* neutral-900 at 60% */
```

**Prefer Tailwind's alpha modifier**: `bg-brand-500/25`, `border-text-main/10`. It
applies the opacity to the token itself, so the colour stays in sync if the token
ever changes — write a literal `rgba()` only where no utility applies, such as
inside a gradient or a composed `box-shadow`, and comment the token name beside it.

Note that `rgba(var(--color-brand-500), 0.25)` does **not** work: the token
resolves to a whole colour value, not three bare channels.

### font-family: inherit is acceptable

`font-family: inherit` on form inputs and buttons is correct — it tells the element to use its parent's font rather than the browser default. It is not a hardcoded family and does not need a token.

### No local `:root` blocks

If you find yourself wanting `:root { --my-component-color: ... }`, add the token
to the `@theme` block in `tailwind.css` instead. (There are no component CSS files
left to put it in anyway — see [Architecture](#architecture).)

### z-index: local stacking vs global layers

Raw z-index integers are acceptable **only** for relative stacking **within a single component's own elements** (e.g. a card's overlay above its image). For anything that stacks against elements from other components, use a `--z-*` token.

```css
/* OK — only competing with siblings inside the same card */
.card-image   { z-index: 1; }
.card-overlay { z-index: 2; }

/* BAD — competing with elements from other components */
.navbar { z-index: 50; }   /* use var(--z-sticky) */
.modal  { z-index: 600; }  /* use var(--z-modal)  */
```

---

## Intentional Hardcoded Exceptions

Some values are explicitly permitted to stay inline and are **not** design system violations:

| Value | Where | Why |
|---|---|---|
| `#a9c6f9`, `#cdfcf3` | Brand gradient stops | Specific mid-gradient colours; not semantic |
| `#7c3aed`, `#6f42c1`, `#9333ea` and related purples | Badge/tag UI | Out-of-brand accent colour intentionally used for visual differentiation |
| `#fff` in `-webkit-mask: linear-gradient(#fff 0 0)` | CSS mask technique | The colour value is irrelevant here; this is a shape-masking pattern |
| Off-grid font sizes (`1.05rem`, `1.3rem`, `2.5rem`, etc.) | Landing page display typography | Intentional design choices that don't align with the scale; adding tokens for every size would bloat the system |
| Off-grid spacing (`5px`, `10px`, `14px`, etc.) | Component micro-spacing | The 4px-grid token scale covers standard cases; these are intentional exceptions |
| `rgba(...)` | Shadow and overlay tints | CSS cannot use hex tokens for alpha — see rgba() rule above |
| `transparent` | Borders, backgrounds | No token equivalent exists |

---

## Known Limitations

These are acknowledged gaps in the current design system — documented so they can be improved deliberately rather than worked around silently.

**`--font-display` and `--font-body` resolve to the same value.** Both are `"Merriweather", Georgia, serif`. They are kept as separate tokens to preserve the semantic distinction (display headings vs body copy), but a future update may give them different stacks. For now, prefer `--font-body` for paragraph text and `--font-display` for large marketing headings.

**`bg-subtle` and `neutral-50` have the same value** (`#f8fafc`). Use `bg-subtle` for secondary backgrounds inside cards; use `neutral-50` when referencing a position in the neutral scale (e.g. hover state fills). If the values diverge in a future update, the semantic choice will be correct.

**`--color-black` does not exist.** `--color-*: initial` clears Tailwind's stock palette and only `--color-white` is restored, so `bg-black/50` or `border-black/6` generates **nothing** — no error, no warning, just a missing background. Use `text-main` or a literal `rgba()`.

**No linting enforcement of token usage.** The rules in this document are documentation-only. Nothing prevents a developer from writing `color: #ef4444` in an arbitrary value. The ESLint rule that exists guards stylesheet *imports*, not raw values.

**No component-level token layer.** There is one tier: the `@theme` block. To retheme a single component you either add a global token or hardcode. Tailwind v4's `@theme` can be scoped to a selector, which is the escape hatch if this ever becomes painful.

**Navbar z-index is off-scale.** `navbar.css` uses `z-index: 35`, `40`, `50`, `60` — values that sit between `--z-raised: 10` and `--z-dropdown: 100` and have no matching tokens. These layers are correct relative to each other and work in production. Fixing them would require auditing every floating element in the app to prevent collisions.

---

## Adding New Tokens

1. Open the `@theme` block in `app/styles/tailwind.css` — the only place tokens
   are declared.
2. Add your token to the correct section (color, spacing, radius, etc.) using
   Tailwind's namespace (`--color-*`, `--radius-*`, `--text-*`), so the matching
   utility is generated for you.
3. The legacy `--clr-*` naming below is kept for reading old branches and diffs;
   nothing in the app uses it any more:

| Category | Pattern | Example |
|---|---|---|
| Color — brand | `--clr-brand-{scale}` | `--clr-brand-350` |
| Color — neutral | `--clr-neutral-{scale}` | `--clr-neutral-150` |
| Color — semantic | `--clr-{name}` | `--clr-info` |
| Color — surface | `--clr-bg-{name}` | `--clr-bg-sidebar` |
| Color — text | `--clr-text-{name}` | `--clr-text-link` |
| Color — border | `--clr-border-{name}` | `--clr-border-error` |
| Font | `--font-{name}` | `--font-code` |
| Font size | `--text-{size}` | `--text-6xl` |
| Spacing | `--space-{n}` | `--space-14` |
| Radius | `--radius-{name}` | `--radius-2xl` |
| Shadow | `--shadow-{name}` | `--shadow-inner` |
| Transition | `--transition-{name}` | `--transition-bounce` |
| Z-index | `--z-{name}` | `--z-sidebar` |

4. Use the new token everywhere — never mix the token and a hardcoded fallback.
