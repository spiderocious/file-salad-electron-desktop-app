# file-salad-electron

The FileSalad desktop app — a macOS **menu-bar (status-bar)** app built with
Electron + React + TypeScript.

Sharing a file is an interrupt, not a destination: click the tray icon, a panel
drops down, paste (⌘V) or drop a file, and the public URL appears — click it to
copy. There is no dock window. Users must get past an **auth gate** first: sign
in / create an account, **or** connect their own storage and skip signup.

## Storage modes

Two ways to upload, chosen behind a single adapter the UI never sees:

- **Hosted** — the backend checks quota, signs a PUT, the file uploads to the
  FileSalad bucket; backend enforces the monthly cap + per-file size.
- **BYOK (bring your own bucket)** — uploads go **directly** to the user's own
  S3 / R2 / Tigris / GCS bucket, signed in the main process; the backend is never
  contacted. Active when the user has saved credentials **and** toggled "use my
  bucket" on. A badge in the panel shows which mode is live.

The renderer asks main to "upload this file" / "list my uploads" and gets a
uniform result — it never learns which adapter ran (only a `mode` flag for the
badge). See `src/main/adapters/`.

## Security

- **Secrets live in the main process, encrypted at rest** via Electron
  `safeStorage` (OS-backed key — no Keychain code, no plaintext on disk). Auth
  tokens + BYOK credentials persist across restarts in `userData/filesalad.store.enc`.
- The **BYOK secret key never enters the renderer**: the settings form writes it
  to main once (write-only); reads return status (provider/bucket/enabled), never
  the secret. SigV4 signing + the BYOK PUT happen in main.
- `contextIsolation: true`, `nodeIntegration: false`. The renderer sees only the
  curated `window.fileSalad` bridge, never `ipcRenderer`. CSP `<meta>` in
  `index.html`.

## Provider config (designed to move to the backend)

Which BYOK providers exist, what fields each needs, and how to derive
endpoints/public URLs is a single **serializable config** (`src/shared/provider-config.ts`)
— string templates, no functions. The renderer consumes it through a hook
(`useProviderConfig`) that today reads it over the bridge from main. When the
backend owns this config, only that hook's source changes; the dynamic settings
form and endpoint derivation are unaffected.

## Stack

- **Electron 33** — `main` (tray, panel window, secure store, upload adapters,
  SigV4), `preload` (typed IPC bridge), `renderer` (React UI).
- **electron-vite** — one config builds all three processes; Vite HMR for the
  renderer. Type-checking is per-project (`tsc -p tsconfig.node.json` /
  `tsconfig.web.json`).
- **React 19** + **TanStack Query** (server state) + React Context (auth,
  panel-view, session upload count). The app is a single fixed panel surface —
  views are **state-routed** (auth ↔ panel ↔ settings), no URL router.
- **file-salad-ui-lib** for all UI (DropZone, CopyableLink, UploadHistoryItem,
  UsageMeter, Button, TextInput, SegmentControl, Toggle, Toast) + `--fs-*` tokens.
- **aws4** (SigV4 signing), **zod** (form validation), **meemaw** (`Show`/`Repeat`),
  **lucide-react** via the `@icons` proxy. **pnpm**.

## Layout

```
src/
├── main/                          # Electron main process (Node) — holds secrets
│   ├── index.ts                   # tray, drop-down panel window, lifecycle
│   ├── ipc-handlers.ts            # all IPC wiring
│   ├── tray-icon.ts               # template tray icon
│   ├── services/
│   │   ├── secure-store.ts        # safeStorage-encrypted token + BYOK store
│   │   ├── backend-client.ts      # authed client for hosted uploads (Bearer + refresh)
│   │   ├── byok-endpoints.ts      # resolve endpoint/region/public URL per provider
│   │   └── byok-status.ts         # non-secret BYOK status for the renderer
│   └── adapters/
│       ├── upload-adapter.ts      # the interface (perform / list)
│       ├── hosted-adapter.ts      # presign → PUT → complete via our backend
│       ├── byok-adapter.ts        # SigV4-signed PUT direct to the user's bucket
│       └── select-adapter.ts      # the hosted-vs-BYOK rule
├── preload/index.ts               # contextIsolation bridge → window.fileSalad
├── shared/                        # shared main ↔ renderer (no Node/DOM imports)
│   ├── ipc.ts  bridge.ts          # channel names + bridge contract
│   ├── provider-config.ts         # bundled provider config + template resolver
│   └── types/                     # storage, upload, provider-config types
└── renderer/
    ├── index.html
    └── src/                       # the React app — Feature-Sliced Design
        ├── app.tsx app.provider.tsx app-content.tsx   # composition + providers
        ├── features/
        │   ├── auth/              # api/ providers/ guards/ screen/ (login, register, me, logout)
        │   ├── settings/          # screen/ parts/ (account, dynamic BYOK form, toggle) + api/
        │   └── panel/             # api/ providers/ utils/ screen/ + parts/ (drop-area, history, header)
        └── shared/
            ├── api/use-provider-config.ts
            ├── config/ constants/ services/ (env, endpoints, api-client, token-service, api-error)
            ├── providers/panel-view-provider.tsx
            └── ui/icons  ui/logo
```

## Frontend conventions

- **Feature-Sliced Design** — `features/<name>/{screen,parts,api,providers,guards,utils,types}`.
  Promote to `shared/` only when a second feature needs it.
- **Icons via `@icons` only** (never `lucide-react` directly). Lucide, not emoji.
- **Server state is React Query**; client state is Context + `useState` (no Redux/Zustand).
- **No `any`** (CI-enforced). **Props are externalised `readonly` interfaces.**
- **meemaw `Show` / `Repeat`**, never `&&` / raw `.map()`.
- All UI from **file-salad-ui-lib** with semantic `--fs-*` tokens — never raw hex,
  never reinvent a lib primitive.
- **Inline errors over toasts** for anything the user must act on; toasts only for
  transient confirmations ("Link copied").
- kebab-case files, PascalCase components, named exports.

## Getting started

```bash
pnpm install
pnpm dev          # electron-vite: renderer HMR + launches the app (tray)
```

The app has no dock window — look for the **FileSalad** item in the macOS menu
bar. Click it to toggle the panel; it hides on click-away or Esc. First launch
shows the auth gate.

Set the backend with `VITE_API_BASE_URL` (renderer, for auth/me) and
`FILESALAD_API_BASE_URL` (main, for hosted uploads); both default to
`http://localhost:8096`.

> The app launches the real Electron binary. If you run it from a shell that sets
> `ELECTRON_RUN_AS_NODE=1` (some IDE/agent terminals do), prefix with
> `env -u ELECTRON_RUN_AS_NODE` or Electron starts as plain Node and
> `require('electron')` is `undefined`.

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Vite HMR; launches the Electron app. |
| `pnpm build` | Type-check then build main/preload/renderer to `out/`. |
| `pnpm preview` / `pnpm start` | Build and run the production bundle. |
| `pnpm test` | Vitest (renderer + shared) — RTL + MSW + a bridge mock. |
| `pnpm lint` | ESLint over `src/`. |
| `pnpm format` | Prettier write over `src/`. |
| `pnpm typecheck` | `tsc` per project (node + web), no emit. |
| `pnpm clean` | Remove `out/` and build info. |

## Not done yet

- The tray glyph (`src/main/assets/`) is a placeholder — swap for the real mark.
- macOS packaging (`.dmg` via electron-builder/Forge) isn't wired.
- "Launch at login" toggle (PRD) isn't implemented.
