# packages/ui

shadcn/ui components and the theme every app shares (base-nova style on Base UI, neutral, RTL on).

`src/` is owned by the shadcn CLI. Never edit a file in it by hand, including to fix a bug or a
style: `pnpm ui:drift` fails CI when a component no longer matches the registry. Change a component
by composing it in the app, or in `@workspace/blocks` when more than one app needs it.

Add a component from an app folder so primitives land here:

```bash
cd apps/app
pnpm dlx shadcn@4.21.1 add <name>
```

To pick up a registry change, use `shadcn add <name> --overwrite` and review the diff.

The only hand-written part is the brand block at the end of `src/styles/globals.css`. `brand`
(`#266FFF`) is for fills, rings and progress with no text on them; anything carrying text uses
`primary` (`#2266F5`), because `brand` with white text is under 4.5:1.
