# @workspace/ui

shadcn/ui components and the theme shared by every app.

`src/` is owned by the shadcn CLI. Don't edit it by hand: `pnpm ui:drift` fails if a component no
longer matches the registry. Customize by composing components in the app or in `@workspace/blocks`.

Generated with `shadcn@4.21.1 init --template react-router --base base --preset nova --monorepo --rtl`:

| Setting            | Value              |
| ------------------ | ------------------ |
| Style              | nova (`base-nova`) |
| Primitives         | Base UI            |
| Base color / theme | neutral            |
| Icons              | lucide             |
| Font               | Outfit (variable)  |
| Radius             | default            |
| RTL                | on                 |

## Brand colour

The brand blocks at the end of `globals.css` override the shadcn defaults. The defaults above them stay as generated.

| Token     | Value     | Use                                                          |
| --------- | --------- | ------------------------------------------------------------ |
| `brand`   | `#266FFF` | Fills, rings, dots and progress bars with no text on them    |
| `primary` | `#2266F5` | Buttons, links and anything carrying text (4.9:1 with white) |
| `ring`    | `#266FFF` | Focus rings                                                  |

`#266FFF` is 4.37:1 with white text, which is under WCAG AA, so text-bearing surfaces use `primary`.
Default buttons darken on hover instead of fading to 80%, which would drop below AA.

Add components from an app folder, so primitives land here and blocks land in the app:

```bash
cd apps/marketing
pnpm dlx shadcn@4.21.1 add dialog
```
