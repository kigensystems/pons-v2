# CLAUDE.md

Read `AGENTS.md` (scope, visual rules, commands), `DESIGN.md` (tokens, type, motion budget), then `docs/PROJECT-BRIEF.md` (direction and handoff).

## Workflow

- Work on `main` in this checkout. No branches or worktrees unless asked.
- `git pull --ff-only origin main` before starting; push after each approved commit. Never force-push, rebase, reset, or amend anything on `origin/main`.
- Use the `frontend-design` skill for any new or reshaped UI, with `DESIGN.md` as the brief. List violations of it before showing work.
- Show visual work in the user's Chrome and wait for their go-ahead before committing. Build, lint, and self-checks are not approval.
- Page styles live in the page's own stylesheet; `index.css` holds the opening scene and shared tokens only.
- New docs are new files under `docs/`. Update `PROJECT-BRIEF.md` when direction or handoff changes. Before closing out, correct every doc statement the work made false.

## Inspect and iterate

The user reviews in their own Chrome through the Claude in Chrome extension. Use that browser for your own checks too; it has the console, network, and viewport tools.

1. Start `npm --prefix frontend run dev` in the background with the sandbox disabled (port binding is blocked inside it). Add `npm --prefix backend run dev` when Explore needs the API; it reads the root `.env`.
2. Open `http://127.0.0.1:5173`, not `localhost`; the API refuses other origins. Reuse one tab.
3. Check 1440 × 900 and 390 × 844 with `resize_window`. For lighting comparisons, emulate `prefers-reduced-motion` so the TV holds its poster. Read the console for errors.
4. Keep `https://www.shader.se/` in a second tab when comparing against the reference.
5. One screenshot per iteration at normal size. Save keepers to `docs/screenshots/` only after the user accepts the change.

## Environment

- Node 24, npm. `npm --prefix frontend install --legacy-peer-deps`; `npm ci` fails on the frontend lock file. Other commands are in `AGENTS.md`.
- `origin` is SSH via the `github-kigensystems` host alias. Git network commands need the sandbox disabled. Ignore the `xcrun_db` warning.
- Do not deploy. No secrets reach the browser; the only `VITE_` value is the public Reown project id.
- The launch API lives in `backend/` and `frontend/src/launch/`; see `docs/LAUNCH-API.md`. Keep it out of the landing scene.
