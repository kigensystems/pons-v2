# Deploying Plum

Prepared September 8, 2026. Netlify serves the frontend and proxies `/api` to the launch API, which runs as one Docker container with a persistent disk on Render. Nothing has been deployed yet; this is the checklist.

## Shape

- **Frontend**: Netlify builds `frontend/` (`netlify.toml`). `frontend/scripts/netlify-redirects.mjs` writes `dist/_redirects` at build time: `/api/*` proxied to the API origin with status 200, then the single-page fallback. The proxy keeps the API same-origin for the browser, so the HttpOnly session cookie and the API's `Origin` check work unchanged.
- **API**: `backend/Dockerfile` (Node 24, `npm ci --omit=dev`, `src/server.ts`). `render.yaml` at the repository root is a Render Blueprint: one web service, health check on `/api/health`, a 1 GB disk at `/data` for the SQLite file and uploads. `PLUM_HOST=0.0.0.0` makes the server reachable inside the container; `PLUM_TRUST_PROXY=1` keys rate limits on the browser's address as Netlify forwards it in `x-nf-client-connection-ip` (`X-Forwarded-For` as the fallback).
- **Secrets** stay in the hosts' dashboards. The only browser-visible value is `VITE_REOWN_PROJECT_ID`.

## Steps

1. **Render.** New → Blueprint → this repository. Render reads `render.yaml`. Fill the `sync: false` values: `ROBINHOOD_RPC_URL` (the Alchemy mainnet URL), `MOBULA_API_KEY`, `PLUM_ORIGIN` and `PLUM_PUBLIC_URL` (both the Netlify site URL, `https://<site>.netlify.app` or the custom domain, no trailing slash). `SESSION_SECRET` is generated. Note the service URL, `https://plum-api.onrender.com` or similar.
2. **Netlify.** Add site from Git → this repository; `netlify.toml` sets base, command and publish. Environment: `VITE_REOWN_PROJECT_ID`, `PLUM_API_URL` (the Render service origin, https, no path). Deploy.
3. **Reown.** At dashboard.reown.com add the Netlify origin to the project's allowed domains, or the wallet picker refuses to open there.
4. **Check** on the live site: `/api/health` answers through the proxy and its `client` field is your own public IP, not a Netlify or Render address (if it is, every visitor shares one rate limit; see Boundaries); the Explore CRT shows the latest graduation; Connect wallet → sign in → the header shows the address (this proves the proxied `Origin` header and cookie survive Netlify); open Create a coin and read the live terms. Stop before signing a transaction unless a real launch is intended.

## Boundaries

- One Render instance. Rate limits and the spotlight cache are per process; the intents worker must not run in two instances against one database.
- Uploads live on the Render disk and are served from `PLUM_PUBLIC_URL/api/uploads/<id>` through the Netlify proxy. Token logos written onchain point at that URL, so the site must stay up for them to resolve; an IPFS pin behind the `ImageStore` adapter is the durable alternative.
- The Netlify proxy forwarding `Origin` and `Cookie` is expected but only proven by step 4. If sign-in returns 403 `bad_origin`, the proxy dropped the header; the fallback is a custom domain for the API on the same site (`api.<domain>`) with `PLUM_ORIGIN` unchanged and the cookie moved to `SameSite=None; Secure`.
- Render's disk cannot be attached to the free plan and blocks horizontal scaling; both are fine for one instance. A service with a disk restarts in place on deploy, so each deploy is a few seconds of downtime; intents in flight survive in SQLite and reconcile when the worker returns.
- Netlify ends a proxied request after 26 s. The API's RPC timeout is 10 s with retries, so a provider outage surfaces as the API's own 502 rather than Netlify's.
- The RPC provider's throughput cap, not its monthly credit, is what a burst of creators hits. Reads are gated to eight at a time with backoff on 429, which carried 100 simultaneous preparations on the current plan; if Alchemy's dashboard shows sustained 429s after launch, raise the plan's compute units per second. `/api/health` shows `client` so a shared-address problem is visible without logs.
