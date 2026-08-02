## Important: this is not a plain Vite SPA

Your app is built with **TanStack Start** (React 19 + Vite 8 + Nitro), which is a full-stack SSR framework. `vite build` does **not** produce a plain static `dist/` folder — it produces a Nitro server bundle. So you do **not** need to write an Express server; Nitro already generates a production Node server for you. You just need to build with the Node preset instead of the default Cloudflare one.

## What I'll change in the code

1. **`vite.config.ts`** — allow the Nitro target to be chosen by env var so the Lovable preview keeps working (cloudflare) while your self-hosted build uses `node-server`:
   ```ts
   export default defineConfig({
     tanstackStart: { server: { entry: "server" } },
     nitro: { preset: process.env.SERVER_PRESET ?? undefined },
   });
   ```
2. **`package.json`** — add a script:
   ```json
   "build:node": "SERVER_PRESET=node-server vite build"
   ```
3. **`app.js`** at the project root — the Passenger/PM2 startup file, a 3-line loader that boots the Nitro output:
   ```js
   import("./.output/server/index.mjs");
   ```
4. **`DEPLOY.md`** — the full Plesk walkthrough (summarized below).

## Deployment steps you'll follow

**On your machine or the server (Node 20+):**
```bash
npm install            # or bun install
npm run build:node     # outputs .output/
```

**Upload** to your Plesk domain's document root (e.g. `/var/www/vhosts/example.com/httpdocs`):
- `.output/` (entire folder)
- `app.js`
- `package.json` (optional, only for metadata — `.output` is self-contained)

Alternatively install Node/npm on the server and run the build there via Plesk's Node.js panel ("NPM install" + "Run script: build:node").

**In Plesk → Websites & Domains → Node.js:**
- Node.js version: 20 or 22
- Application root: your domain folder
- Application startup file: `app.js`
- Application mode: `production`
- Custom env vars: `PORT` is supplied by Passenger automatically; add any app env vars here
- Click **Enable Node.js** / **Restart App**

Passenger reverse-proxies to the Node process, serves the app over your domain, and Nitro serves the hashed client assets from `.output/public` with correct caching.

**PM2 alternative** (if you prefer it over Passenger):
```bash
PORT=3000 pm2 start .output/server/index.mjs --name stock-now
pm2 save && pm2 startup
```
Then add an Apache/nginx reverse-proxy directive in Plesk (Apache & nginx Settings → Additional nginx directives):
```
location / { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; }
```

## About Express

Not needed. If you ever wanted a pure-static host (no Node), the app would have to be converted to a prerendered/SPA build first — that's a separate change. I can do that instead if you'd rather serve it as flat files from Apache/nginx with no Node process at all; just say the word.

## Technical notes

- Nitro `node-server` output is fully bundled — no `node_modules` needed at runtime.
- `.output/server/index.mjs` is ESM, hence `app.js` uses dynamic `import()`.
- The Power Automate webhook call happens client-side, so no server secrets are involved.
