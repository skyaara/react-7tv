# Examples

All examples consume the package exactly through its public exports:

| Workspace | Architecture | Start command |
| --- | --- | --- |
| `vite` | Client-rendered SPA | `npm run dev --workspace @react-7tv-wrapper/example-vite` |
| `next` | App Router Server + Client Components | `npm run dev --workspace @react-7tv-wrapper/example-next` |
| `react-router` | Framework-mode SSR and loader | `npm run dev --workspace @react-7tv-wrapper/example-react-router` |
| `marketing` | Astro static shell + React island | `npm run marketing:dev` |

Install once from the repository root with `npm install`. Build every app with
`npm run examples:build`, or validate the package and all examples together with
`npm run check:all`.
