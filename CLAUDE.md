# CLAUDE.md

Read `AGENTS.md` first. It holds the durable project rules: scope, Shader reference rules, visual standards, validation, and commands. Then read `docs/PROJECT-BRIEF.md` for the selected direction and current handoff. This file only adds what those two do not cover.

## Two sessions on one repo

A ChatGPT session commits directly to `main` and owns the landing page: `frontend/src/App.tsx`, `frontend/src/MacintoshScene.tsx`, `frontend/src/LoadingScreen.tsx`, `frontend/src/sceneFraming.ts`, `frontend/src/index.css`, `frontend/index.html`, `docs/PROJECT-BRIEF.md`, `docs/SCENE-VALIDATION.md`, and `frontend/public/`. Treat those as its files unless the user reassigns them.

This session works on separate features. Rules:

- Work in a git worktree under `.claude/worktrees/`, never in the main checkout, which ChatGPT is editing. Create `feature/<name>` off `origin/main` for each feature. Never commit to `main` directly except for this file and `.claude/` config.
- Before every push and before opening a PR: `git fetch origin` then `git rebase origin/main`. Resolve conflicts here, never on `main`.
- Never force-push, rebase, reset, or amend anything already on `origin/main`.
- Keep new work in new files or components. Shared files are the conflict risk: `App.tsx`, `main.tsx`, `index.css`, `index.html`, `package.json`, `vite.config.ts`. Touch them with the smallest possible hunk, ideally one import plus one JSX line, and say so in the PR.
- Add new styles in a new stylesheet imported from the new component, not in `index.css`.
- Add new docs as new files under `docs/`, not as edits to `PROJECT-BRIEF.md`.
- Open a PR to `main` when a feature is done and rebased. The user merges PRs; never merge one yourself.
- Keep pushing the feature branch at each verified working state so the other PC and the other session can see it.

## Commands

Run from the repository root. Node 24, npm.

```sh
npm --prefix frontend ci
npm --prefix frontend run dev
npm --prefix frontend run build
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix backend ci
npm --prefix backend run dev
npm --prefix backend test
```

The backend reads the repository-root `.env` (see `.env.example`) and binds 127.0.0.1:8787; Vite proxies `/api` to it. Open the app at `http://127.0.0.1:5173`, not `localhost`, because the API refuses other origins. Details and the deferred checks: `docs/LAUNCH-API.md`, `docs/LAUNCH-API-HANDOFF.md`.

Build, lint, and the Node test runner are scaffold checks. Visual work is validated in a browser against the live Shader site and the documented targets, as `AGENTS.md` requires. Report the two separately.

## Environment notes

- `origin` is SSH via the `github-kigensystems` host alias. Git network commands fail inside the Bash sandbox; run fetch, pull, and push with the sandbox disabled.
- Git prints a harmless `xcrun_db` cache warning inside the sandbox. Ignore it.
- Do not deploy. Netlify config exists but hosting is deferred.
- The launch API lives in `backend/` and `frontend/src/launch/`. Keep it out of the landing scene. No keys or secrets reach the browser; the only `VITE_` value is the public Reown project id.
