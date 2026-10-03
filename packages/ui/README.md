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

Add components from an app folder, so primitives land here and blocks land in the app:

```bash
cd apps/marketing
pnpm dlx shadcn@4.21.1 add dialog
```
