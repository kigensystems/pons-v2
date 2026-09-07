# Pons companion — frontend study

A separate product complementing Pons. The working title is temporary. Current work focuses on a Shader-inspired opening scene featuring a faithful classic compact Macintosh.

Read [the project brief](docs/PROJECT-BRIEF.md) for the selected direction and [AGENTS.md](AGENTS.md) for working instructions.

## Local development

Use Node.js 24 and npm. From this directory:

```sh
npm --prefix frontend ci
npm --prefix frontend run dev
```

Open the local URL printed by Vite. The current opening study combines detailed Macintosh artwork, a live CRT overlay, mist, grain, and warm serif typography. It is a fixed-camera image composition; a live 3D model and GPU renderer are the next phase.

```sh
npm --prefix frontend run build
npm --prefix frontend run lint
npm --prefix frontend run preview
```

The build includes TypeScript checks. Lint uses Oxlint. There is no behavioral test suite yet.

## Layout

- `frontend/`: React, TypeScript, Vite, Three.js, and React Three Fiber.
- `docs/`: selected project decisions.
- `reports-examples/` and `reviews/`: preserved research and reference material.

## Hosting and future data

`netlify.toml` configures Netlify to build `frontend/` and publish its `dist/` output with Node.js 24. No deployment has been performed. A future crypto API is planned, with provider selection and integration deferred.
