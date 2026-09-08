// Writes dist/_redirects for Netlify: the /api proxy to the launch API (same-origin for the browser,
// so the session cookie and the Origin check keep working) and the single-page fallback.
// PLUM_API_URL is set in the Netlify site's environment; without it the API rule is left out.
import { writeFileSync } from 'node:fs'
const api = (process.env.PLUM_API_URL ?? '').replace(/\/+$/, '')
if (api && !/^https:\/\/[^\s/]+$/.test(api)) throw new Error('PLUM_API_URL must be an https origin with no path')
const rules = [...(api ? [`/api/*  ${api}/api/:splat  200`] : []), '/*  /index.html  200']
writeFileSync(new URL('../dist/_redirects', import.meta.url), rules.join('\n') + '\n')
console.log(`_redirects: ${api ? `API proxied to ${api}` : 'no API proxy (PLUM_API_URL unset)'}, SPA fallback`)
