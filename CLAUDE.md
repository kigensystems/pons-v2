# CLAUDE.md

Read `AGENTS.md` first. It holds the durable project rules: scope, Shader reference rules, visual standards, validation, and commands. Then read `docs/PROJECT-BRIEF.md` for the selected direction and current handoff. This file only adds what those two do not cover.

## Workflow

Claude Code runs every session on this repo, working directly on `main` in the main checkout. The earlier ChatGPT session and its worktree-and-PR split are retired as of September 7, 2026.

- Edit in the main checkout and commit on `main`. No feature branches or worktrees unless the user asks for one.
- Show visual work in the browser and wait for the user's go-ahead before committing or pushing. Build, lint, and a self-check are not approval.
- `git pull --ff-only origin main` before starting, and push after each approved commit so the other PC stays current.
- Never force-push, rebase, reset, or amend anything already on `origin/main`.
- Keep page styles in the page's own stylesheet. `index.css` holds the opening scene and shared tokens only.
- Add new docs as new files under `docs/`. Update `PROJECT-BRIEF.md` when the direction or handoff changes.
- The user inspects changes in their own Chrome through the Claude in Chrome extension, not the app's Browser pane. Run the dev server as a background process with the sandbox disabled and point them at `http://127.0.0.1:5173`.

## Commands

Run from the repository root. Node 24, npm.

```sh
npm --prefix frontend install --legacy-peer-deps
npm --prefix frontend run dev
npm --prefix frontend run build
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix backend ci
npm --prefix backend run dev
npm --prefix backend test
```

`npm ci` fails on the committed lock file since the wallet dependencies landed; use `install --legacy-peer-deps`, which leaves the lock unchanged.

The backend reads the repository-root `.env` (see `.env.example`) and binds 127.0.0.1:8787; Vite proxies `/api` to it. Open the app at `http://127.0.0.1:5173`, not `localhost`, because the API refuses other origins. Details and the deferred checks: `docs/LAUNCH-API.md`, `docs/LAUNCH-API-HANDOFF.md`.

Build, lint, and the Node test runner are scaffold checks. Visual work is validated in a browser against the live Shader site and the documented targets, as `AGENTS.md` requires. Report the two separately.

## Environment notes

- `origin` is SSH via the `github-kigensystems` host alias. Git network commands fail inside the Bash sandbox; run fetch, pull, and push with the sandbox disabled.
- Git prints a harmless `xcrun_db` cache warning inside the sandbox. Ignore it.
- Do not deploy. Netlify config exists but hosting is deferred.
- The launch API lives in `backend/` and `frontend/src/launch/`. Keep it out of the landing scene. No keys or secrets reach the browser; the only `VITE_` value is the public Reown project id.
