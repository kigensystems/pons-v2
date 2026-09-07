# Plum — an independent Pons companion

A separate product complementing Pons, currently called Plum. The opening features a classic compact Macintosh; Explore and About extend the same visual identity. Explore is backed by the launch API in `backend/`: wallet sign-in through Reown AppKit, a creation desk that prepares real pons launches on Robinhood Chain, and a registry of Plum launches. No launch has been made through it yet.

Read [the project brief](docs/PROJECT-BRIEF.md) for the selected direction and [AGENTS.md](AGENTS.md) for working instructions.

## Repository

Private GitHub repository: [kigensystems/pons-v2](https://github.com/kigensystems/pons-v2). The local `origin` points there, and `main` tracks `origin/main`.

The private repository includes the application, documentation, all research/reference files, purchased model source copies, current Blender studies, and the runtime GLB for use on the owner's other PC. Only redundant Blender save backups are excluded from the asset collection. See [other-PC setup](docs/OTHER-PC-SETUP.md); no separate model restoration or Blender installation is needed to run the scene.

## Local development

Use Node.js 24 and npm. From this directory:

```sh
npm --prefix frontend ci
npm --prefix frontend run dev
```

Open the local URL printed by Vite. `/` shows the original Macintosh artwork with a live canvas TV, mist, grain, and warm serif typography. `/explore` shows the demo collection and creation desk; `/about` introduces Plum. `/launch` is retained as an Explore alias. The earlier Three.js implementation and licensed model are preserved for comparison; [asset instructions](assets/source/macintosh-512k/README.md) explain optional regeneration.

```sh
npm --prefix frontend run build
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend run preview
```

The build includes TypeScript checks. Lint uses Oxlint. Node's test runner checks playback, lighting, screen geometry, camera framing, and the illustrative fee calculation. Visual and interaction checks for the new pages are recorded in [Explore and About](docs/LAUNCH-DESK.md).

## Layout

- `frontend/`: React, TypeScript, Vite, Three.js, and React Three Fiber.
- `docs/`: selected project decisions.
- `reports-examples/` and `reviews/`: preserved research and reference material.

## Hosting and future data

`netlify.toml` configures Netlify to build `frontend/` and publish its `dist/` output with Node.js 24. No deployment has been performed. The launch API is documented in [LAUNCH-API.md](docs/LAUNCH-API.md); its current state and deferred checks are in [LAUNCH-API-HANDOFF.md](docs/LAUNCH-API-HANDOFF.md). The earlier [integration report](docs/PLUM-INTEGRATION.md) holds the provider evidence, Plum-only Explore membership and cost notes. Credentials belong only in the ignored root `.env`; [.env.example](.env.example) is a blank template.
