# hobom-tech-blog

A lightweight, Angular‑based tech blog. Built with Angular (Material 3), deployable on Vercel as a static SPA (no SSR). Includes clean environment management, API proxying for local dev, and production rewrites to avoid mixed‑content issues.

---

## Table of contents

* [Features](#features)
* [Tech stack](#tech-stack)
* [Quick start](#quick-start)
* [Project structure](#project-structure)
* [Environments configuration](#environments--configuration)

  * [1) Angular environments](#1-angular-environments)
  * [2) Local dev proxy (`proxy.conf.json`)](#2-local-dev-proxy-proxyconfjson)
  * [3) Production on Vercel (`vercel.json` rewrites)](#3-production-on-vercel-verceljson-rewrites)
* [Favicon assets](#favicon--assets)
* [Styling Material 3 theme tips](#styling--material-3-theme-tips)
* [Build analyze bundles](#build--analyze-bundles)
* [Routing on Vercel (404 fix)](#routing-on-vercel-404-fix)
* [NPM scripts](#npm-scripts)
* [Troubleshooting](#troubleshooting)
* [License](#license)

---

## Features

* Angular + Angular Material (MD3) with CSS custom properties
* Clean separation of **local** and **production** API endpoints
* **Local dev proxy** to bypass CORS while developing
* **Vercel rewrites** to avoid browser mixed‑content (HTTPS → HTTP) issues
* SPA routing fallback for Vercel
* Build budget guidance and bundle analysis

## Tech stack

* **Angular** (v18+)
* **Angular Material 3** (theming via CSS vars)
* **RxJS**
* **Vercel** (static SPA deployment)

> *No SSR by default. If later needed, migrate to Angular SSR/Prerender.*

---

## Quick start

### Prerequisites

* Node.js 18+ (recommend LTS)
* npm (or pnpm/yarn)

### Install

```bash
npm ci    # or: npm install
```

### Run (local)

```bash
# uses proxy.conf.json for /api → your backend
npm run start
```

### Build (production)

```bash
npm run build
```

The production build is emitted to `dist/hobom-tech-blog/`.

### Deploy (Vercel)

* Connect the repo in Vercel dashboard
* Framework preset: **Angular**
* Build command: `npm run build`
* Output directory: `dist/hobom-tech-blog`
* Include `vercel.json` at repo root (see below)

---

## Project structure

```
src/
  app/
  assets/
    icons/
  environments/
    environment.ts
    environment.prod.ts
  favicon.ico
  index.html
angular.json
proxy.conf.json
vercel.json
```

---

## Environments & configuration

### 1) Angular environments

Create **`src/environments/environment.ts`** and **`src/environments/environment.prod.ts`**:

**`src/environments/environment.ts`**

```ts
export const environment = {
  production: false,
  // Local dev calls should go through the proxy: use relative /api
  apiBaseUrl: '/api/hobom/tech',
};
```

*A simple service example:*c

```ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class PostsService {
  constructor(private http: HttpClient) {}

  list(limit = 20) {
    return this.http.get(`${environment.apiBaseUrl}/articles`, { params: { limit } });
  }
}
```

### 2) Local dev proxy (`proxy.conf.json`)

Use a proxy to call your backend over HTTP during `ng serve` *without* CORS errors:

**`proxy.conf.json`**

```json
{
  "/api": {
    "target": "http://ishisha.iptime.org:8081/hobom-internal/api/v1",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    },
    "logLevel": "debug"
  }
}
```

**`angular.json`** (serve options)

```json
{
  "projects": {
    "hobom-tech-blog": {
      "architect": {
        "serve": {
          "options": {
            "proxyConfig": "proxy.conf.json"
          }
        }
      }
    }
  }
}
```

Run dev:

```bash
ng serve --proxy-config proxy.conf.json
```

### 3) Production on Vercel (`vercel.json` rewrites)

In production, browsers require HTTPS for pages served over HTTPS. If your backend is **HTTP only**, route through Vercel so the browser calls same‑origin HTTPS and Vercel calls your backend server‑to‑server.

**`vercel.json`** (at repo root)

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "http://ishisha.iptime.org:8081/hobom-internal/api/v1/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
      ]
    }
  ]
}
```

> This eliminates **Mixed Content** because the browser only talks to `https://hobom-tech-blog.vercel.app`.

If you have an **HTTPS** API domain, you can instead set `environment.prod.ts` to point to it directly and remove the rewrite for `/api`.

---

## Favicon & assets

* Replace `src/favicon.ico` with your icon or update the link in `src/index.html`:

```html
<link rel="icon" type="image/x-icon" href="assets/icons/hobom.ico" />
```

* Add social share images under `src/assets/` (e.g., `og-image.png`).

---

## Styling & Material 3 theme tips

Angular Material 3 exposes CSS vars like `--mat-sys-surface`. To apply a light gray background site‑wide:

```css
:root {
  /* Optional: tweak tonal surfaces */
  /* --mat-sys-surface: #f7f7f7; */
}

html, body, app-root { height: 100%; }
body { margin: 0; background: var(--mat-sys-surface); }

/* Sometimes using container surfaces feels nicer */
.app-surface {
  background: var(--mat-sys-surface-container-low);
}
```

> For advanced theming, define a custom Material theme and load via `@use` in your global styles.

---

## Build & analyze bundles

### Production build

```bash
ng build --configuration production
```

### Inspect bundle sizes

```bash
ng build --configuration production --stats-json
npx source-map-explorer 'dist/hobom-tech-blog/**/*.js' --html dist/report.html
```

### Adjust budgets (if you see "bundle initial exceeded maximum budget")

Edit `angular.json` → `projects.hobom-tech-blog.architect.build.configurations.production.budgets`:

```json
"budgets": [
  { "type": "initial", "maximumError": "1.5mb", "maximumWarning": "1.0mb" },
  { "type": "anyComponentStyle", "maximumWarning": "6kb", "maximumError": "10kb" }
]
```

> Prefer **reducing** bundle size (code‑splitting, removing heavy libs, using `standalone` components, lazy routes) rather than only increasing budgets.

---

## Routing on Vercel (404 fix)

For client‑side routes (e.g., `/articles/123`), Vercel must serve `index.html` and let Angular router handle it. The `vercel.json` rewrite `{"source": "/(.*)", "destination": "/index.html"}` ensures this.

---

## NPM scripts

```json
{
  "scripts": {
    "start": "ng serve --proxy-config proxy.conf.json",
    "build": "ng build --configuration production",
    "analyze": "ng build --configuration production --stats-json && npx source-map-explorer 'dist/hobom-tech-blog/**/*.js'",
    "lint": "ng lint",
    "test": "ng test"
  }
}
```

---

## Troubleshooting

* **Mixed Content error**: Ensure API calls use `/api/...` and Vercel rewrites to your HTTP backend. Or use a proper **HTTPS** backend.
* **404 on hard refresh**: Ensure the SPA fallback rewrite to `/index.html` exists in `vercel.json`.
* **Favicon not updating**: Bust cache by renaming the file (e.g., `favicon-v2.ico`) and updating `index.html`, or hard‑reload the browser.
* **CORS in local dev**: You must run via `ng serve` with `proxy.conf.json`, and call the API via relative `/api/...` URLs.
* **Large bundles**: Use lazy loading, remove unused polyfills, and analyze with `source-map-explorer`.

---

## License

MIT (c) HoBom
