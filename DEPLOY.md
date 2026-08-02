# Self-hosting on Ubuntu + Plesk (Node.js)

This app is built with **TanStack Start** (React 19 + Vite + Nitro). It is **not**
a plain static Vite SPA: `vite build` produces a Nitro server bundle, not a
`dist/` folder of flat files. You therefore do **not** need to write an Express
server — Nitro generates a production Node.js server for you.

## 1. Build the production assets

Requires Node.js 20 or 22.

```bash
npm install
npm run build:node
```

`build:node` runs `SERVER_PRESET=node-server vite build` and writes:

```
.output/
├── server/index.mjs   # the Node HTTP server (fully bundled, no node_modules needed)
└── public/            # hashed client assets, served by the server above
```

Test it locally:

```bash
PORT=3000 node .output/server/index.mjs
# open http://localhost:3000
```

## 2. Upload to the server

Copy to your Plesk domain folder, e.g. `/var/www/vhosts/example.com/httpdocs`:

- `.output/` (the whole folder)
- `app.js`
- `package.json` (optional — only for metadata; `.output` is self-contained)

Alternatively, upload the full source and build on the server via the Plesk
Node.js panel: **NPM install** → **Run script: `build:node`**.

## 3a. Serve with Passenger (Plesk Node.js panel — recommended)

**Websites & Domains → your domain → Node.js**

| Setting                   | Value                                        |
| ------------------------- | -------------------------------------------- |
| Node.js version           | 20 or 22                                     |
| Application mode          | `production`                                 |
| Application root          | your domain folder (where `app.js` lives)    |
| Application startup file  | `app.js`                                     |
| Custom environment vars   | add app-specific vars here (`PORT` is set by Passenger automatically) |

Click **Enable Node.js**, then **Restart App** after every new upload.

Passenger reverse-proxies your domain to the Node process. Nitro serves the
client assets from `.output/public` with correct cache headers, and handles
SPA/deep-link routing — no `.htaccess` or rewrite rules required.

## 3b. Serve with PM2 (alternative)

```bash
cd /var/www/vhosts/example.com/httpdocs
PORT=3000 pm2 start .output/server/index.mjs --name stock-now
pm2 save && pm2 startup
```

Then in **Plesk → Apache & nginx Settings → Additional nginx directives**:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

(Disable "Proxy mode" conflicts by unchecking *Smart static files processing*
if Plesk intercepts asset requests.)

## Do I need Express?

No. An Express `express.static('dist')` server is the right answer for a plain
Vite SPA, but this project's Nitro output already includes an HTTP server that
serves static assets **and** renders the app server-side. Adding Express in
front of it would only duplicate work.

If you ever want a *pure static* deployment (Apache/nginx only, no Node
process), the app would have to be switched to a prerendered/SPA build first —
ask and it can be converted.

## Redeploy checklist

1. `npm run build:node`
2. Upload the new `.output/`
3. Plesk → Node.js → **Restart App** (or `pm2 restart stock-now`)

## Notes

- `.output/server/index.mjs` is ESM, which is why `app.js` uses dynamic `import()`.
- The Power Automate webhook is called from the browser, so no server-side
  secrets are involved. If you later move that call server-side, add the URL as
  an environment variable in the Plesk Node.js panel.
- Node 18 and below are not supported.
