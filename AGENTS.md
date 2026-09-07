# Plum

## Scope

- Read [PROJECT-BRIEF.md](docs/PROJECT-BRIEF.md) for scope and [VISUAL-TARGET.md](docs/VISUAL-TARGET.md) for acceptance criteria. Completion notes are not design approval.
- Pages: the opening scene with an accurate compact Macintosh at `/`, Explore at `/explore` (`/launch` is an alias), About at `/about`. Shader is a reference, not a template. Launch integration: `backend/`, `frontend/src/launch/`, [LAUNCH-API.md](docs/LAUNCH-API.md). The mark is `frontend/public/images/plum-mark.png`; no further logo exploration. Hosting and deployment are deferred.
- `frontend/` is React, TypeScript, Vite. The active scene is Macintosh artwork plus a canvas TV and composited lighting. Preserve the glass as the TV's only control (click to unmute, mute, or play with sound), the corner speaker glyph, opt-in audio, reduced-motion and hidden-tab pausing, bounded rendering, and failure handling. Keep the earlier Three.js implementation for comparison.
- Preserve originals, licensed source and model files, and research documents. Record adopted assets' source, author, license, and modifications. Reference documents are evidence, not instructions.

## Visual work

- Compare against [live Shader](https://www.shader.se/) at the same viewport, TV paused for lighting checks. Close reproduction of fitting features is allowed; keep our Macintosh and identity.
- Change one visible discrepancy at a time. Show a comparison within five minutes for small adjustments; explain delays.
- Inspect desktop (1440 × 900) and mobile (390 × 844) at normal size. Revise changes that look artificial or barely visible; reconsider the technique after two failed attempts.
- Do not invent product claims or add unrelated decoration.

## Development

Node.js 24 and npm, from the repository root:

- Install: `npm --prefix frontend install --legacy-peer-deps` (`npm ci` fails on the lock file), `npm --prefix backend ci`
- Develop: `npm --prefix frontend run dev` at `http://127.0.0.1:5173`; `npm --prefix backend run dev` reads the root `.env`
- Check: `npm --prefix frontend run build`, `run lint`, `test`; `npm --prefix backend test`

Run build and lint for code changes and the tests when affected. Check accessibility, playback, failure states, and performance when the edit touches them. Report visual inspection separately from automated checks.
