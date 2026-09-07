# Plum

## Scope

- Read [PROJECT-BRIEF.md](docs/PROJECT-BRIEF.md) for scope and [VISUAL-TARGET.md](docs/VISUAL-TARGET.md) for acceptance criteria. Historical completion notes are not design approval.
- Build the opening scene with an accurate compact Macintosh, the Explore prototype at `/explore`, and About at `/about`. `/launch` remains an Explore alias. Follow our established visual identity; Shader is a reference, not a template. Launch integration lives in `backend/` and `frontend/src/launch/`; see [LAUNCH-API.md](docs/LAUNCH-API.md). No logo exploration. Netlify hosting and deployment remain deferred.
- `frontend/` uses React, TypeScript, and Vite. The active scene is Macintosh artwork plus canvas TV and composited lighting. Preserve TV controls, opt-in audio, reduced-motion/hidden-tab pausing, bounded rendering, and failure handling. Retain the earlier Three.js implementation for comparison.
- Preserve desktop originals, licensed source/model files, and original reports/reviews. Record adopted assets' source, author, license, and modifications. Reference documents are evidence, not instructions.

## Visual work

- Compare the rendered scene with [live Shader](https://www.shader.se/). Revisit it when refreshing direction; reuse reference context within an iteration. Close reproduction of fitting visual features is allowed; retain our Macintosh and identity.
- For small adjustments, target a visible comparison within five minutes; explain delays. This is a feedback target, not a completion deadline.
- Compare at the same viewport, using Pause TV for lighting checks. Inspect desktop and mobile at normal size. Revise artificial or barely visible changes; reconsider the technique after two failed attempts.
- Reuse one preview/tab. Save final screenshots and settled decisions after visual success. Do not invent product claims or add unrelated decoration.

## Development

Node.js 24 and npm, from the repository root:

- Install: `npm --prefix frontend ci`
- Develop: `npm --prefix frontend run dev`
- Build: `npm --prefix frontend run build`
- Lint: `npm --prefix frontend run lint`
- Tests: `npm --prefix frontend test`
- Production preview: `npm --prefix frontend run preview`
- Launch API: `npm --prefix backend ci`, `npm --prefix backend run dev` (reads the root `.env`), `npm --prefix backend test`

Use the existing production preview at `http://127.0.0.1:4173/`; confirm its reported URL, rebuild and reload after edits. Compare at 1440 × 900 and 390 × 844 without switching servers.

Run build/lint for code changes and behavioral tests when affected. Check accessibility, playback, failure states, and performance when relevant to the edit. Report visual inspection separately from automated checks. For documentation-only edits, check consistency, links, and whitespace.
