# file-salad-electron

The FileSalad desktop app — a macOS **menu-bar (status-bar)** app built with
Electron + React + TypeScript.

Sharing a file is an interrupt, not a destination: click the tray icon, a panel
drops down, paste (⌘V) or drop a file, and the public URL appears — click it to
copy. There is no dock window. Two storage modes are planned (PRD §5): a hosted
free tier (presigned PUT to the FileSalad bucket, server-enforced quota) and
bring-your-own S3/R2 bucket (credentials in the macOS Keychain, uploads direct,
backend untouched). Auth is email + password for both modes.

This repo is a **standalone single repo** (its own pnpm install, lint, build).
The renderer is a thin FSD shell right now — the tray + drop-down panel, a
drop-zone placeholder, and a local-history list. The upload/auth/history/settings
**feature logic is intentionally deferred** to follow-up tasks; what's here is the
correctly-shaped, on-brand, green-building starting point.

## Stack

- **Electron 33** — `main` (tray + panel window), `preload` (typed IPC bridge),
  `renderer` (the React UI).
- **electron-vite** — one config builds all three processes; Vite HMR for the
  renderer.
- **React 19** + **react-router-dom** (`HashRouter` — the renderer loads from
  `file://` in production).
- **TanStack Query** for server state (React Query) — no global client-state lib.
- **Tailwind CSS** with the FileSalad palette wired through CSS variables.
- **meemaw** (`Show` / `Repeat`), **lucide-react** (via the `@icons` proxy).
- **pnpm** as the package manager.

## Layout

```
src/
├── main/                       # Electron main process (Node)
│   ├── index.ts                # tray, drop-down panel window, IPC handlers, lifecycle
│   └── tray-icon.ts            # template tray icon (data URL — swap for real glyph)
├── preload/
│   └── index.ts                # contextIsolation bridge → window.fileSalad
├── shared/                     # shared between main + preload (Node side)
│   ├── ipc.ts                  # IPC channel-name constants (one source of truth)
│   └── bridge.ts               # FileSaladBridge contract
└── renderer/
    ├── index.html
    └── src/                    # the React app — Feature-Sliced Design
        ├── main.tsx            # ReactDOM entry
        ├── app.tsx             # composition root
        ├── app.provider.tsx    # QueryClient + HashRouter
        ├── app.routes.tsx      # route table (uses ROUTES)
        ├── styles.css          # palette CSS variables + Tailwind layers
        ├── global.d.ts         # window.fileSalad typing
        ├── features/
        │   └── panel/          # the drop-down panel feature
        │       ├── screen/
        │       │   ├── panel-screen.tsx       # composes the parts
        │       │   └── parts/                  # panel-header, drop-zone, history-list
        │       ├── utils/                      # stateful hooks (use-panel-dismiss)
        │       └── types/                      # upload-history-entry
        └── shared/
            ├── constants/routes.ts             # ROUTES — the only place paths live
            ├── ui/icons/index.ts               # @icons proxy (re-exports lucide-react)
            ├── ui/logo/logo.tsx                # standalone Logo component
            └── utils/cn.ts                     # clsx + tailwind-merge
```

## Frontend conventions


- **Feature-Sliced Design.** Code lives under `features/<name>/` organised by
  layer: `screen/` (composition root, reads like a table of contents),
  `screen/parts/` (screen-specific sections), `widgets/` (reusable within the
  feature), `api/` (React Query hooks), `providers/` (context + `useState`),
  `guards/`, `helpers/` (pure functions, one per file), `utils/` (stateful
  hooks), `types/`. Move something to `shared/` only when a **second** feature
  needs it.
- **Icons via `@icons` only.** Never `import { X } from 'lucide-react'` in a
  component — go through `src/renderer/src/shared/ui/icons/index.ts` so the icon
  set is swappable in one file. Use lucide icons, never emoji.
- **Routes via `ROUTES`.** Never inline a path string in a `<Link>`/`navigate()`
  — reference `@shared/constants/routes`. (Backend paths will likewise live in an
  `endpoints` constant when the API layer lands.)
- **Server state is React Query.** No bare `useEffect` + `fetch`. Client state is
  React Context + `useState` — no Redux/Zustand/MobX.
- **No `any`** (CI-enforced). Use `unknown` + narrowing, generics, or interfaces.
- **Props are externalised, `readonly` interfaces** named `<Component>Props` — no
  inline prop types.
- **Conditional rendering / lists use meemaw** `Show` / `Repeat`, never `&&`
  (renders `0`) or raw `.map()`.
- **Tailwind via `cn()`** (clsx + tailwind-merge) — never string-concatenate
  classes. Colours are **semantic tokens** (`bg-accent`, `text-secondary`, …)
  mapped to CSS variables in `styles.css`; never raw hex in a component. Swap the
  palette by editing those variables only.
- **Inline errors over toasts** for anything the user must act on; toasts only for
  transient confirmations ("Link copied").
- **Naming.** kebab-case files (`panel-screen.tsx`, `use-panel-dismiss.ts`),
  PascalCase components, named exports (lazy-loaded screens are the only default
  exports). Screens: `<feature>-screen.tsx`. Hooks: `use-<thing>.ts`.

## Security posture (Electron specifics)

- `contextIsolation: true`, `nodeIntegration: false`. The renderer only sees the
  curated `window.fileSalad` surface — never `ipcRenderer` directly.
- A Content-Security-Policy `<meta>` is set in `index.html`.
- BYO bucket credentials (when implemented) go to the **macOS Keychain only** —
  never to the backend, never logged, never in renderer state.

## Getting started

```bash
pnpm install
pnpm dev          # electron-vite: renderer HMR + launches the app with the tray
```

The app has no dock window — look for the FileSalad icon in the macOS menu bar.
Click it to toggle the panel; it hides on click-away or Esc.

> The `dev` / `preview` scripts clear `ELECTRON_RUN_AS_NODE` before launching, so
> they still start the real Electron app in environments that set that variable
> (some IDE/agent shells do). Without it, Electron would run as plain Node and
> `require('electron')` would be `undefined`.

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Run with Vite HMR; launches the Electron app. |
| `pnpm build` | Type-check (`tsc -b`) then build main/preload/renderer to `out/`. |
| `pnpm preview` / `pnpm start` | Build and run the production bundle. |
| `pnpm lint` | ESLint over `src/`. |
| `pnpm format` | Prettier write over `src/`. |
| `pnpm typecheck` | `tsc -b --noEmit`. |
| `pnpm clean` | Remove `out/` and build info. |

## Not done yet (deferred feature work)

The drop-zone, history, settings, auth, and both upload paths (hosted presigned
PUT + BYO direct-to-bucket) are placeholders. The tray glyph in `tray-icon.ts` is
a stand-in template image — replace it with the real FileSalad menu-bar icon
before shipping. macOS packaging (`.dmg` via electron-builder/Forge) is not wired.
