# Pons companion — frontend study

A separate product complementing Pons. The working title is temporary. Current work focuses on a Shader-inspired opening scene featuring a faithful classic compact Macintosh.

Read [the project brief](docs/PROJECT-BRIEF.md) for the selected direction and [AGENTS.md](AGENTS.md) for working instructions.

## Repository

Private GitHub repository: [kigensystems/pons-v2](https://github.com/kigensystems/pons-v2). The local `origin` points there, and `main` tracks `origin/main`.

The repository includes the committed application, documentation, and asset preparation scripts. Licensed source files, Blender studies, and the exported GLB remain local and ignored; `reports-examples/` and `reviews/` remain local and untracked. Restore the licensed model separately on a fresh checkout using [the asset instructions](assets/source/macintosh-512k/README.md).

## Local development

Use Node.js 24 and npm. From this directory:

```sh
npm --prefix frontend ci
npm --prefix frontend run dev
```

Open the local URL printed by Vite. The opening study renders the purchased Macintosh 512K in real 3D, with an emissive CRT, mist, grain, and warm serif typography. It uses Three.js WebGPURenderer with a WebGL2 backend fallback. The licensed model is generated locally; see `assets/source/macintosh-512k/README.md` when restoring a fresh checkout.

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
