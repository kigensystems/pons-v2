# Pons companion — frontend study

A separate product complementing Pons. The working title is temporary. Current work focuses on a Shader-inspired opening scene featuring a faithful classic compact Macintosh.

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

Open the local URL printed by Vite. The opening study renders the purchased Macintosh 512K in real 3D, with an emissive CRT, mist, grain, and warm serif typography. It uses Three.js WebGPURenderer with a WebGL2 backend fallback. The ready-to-use licensed model is included; [asset instructions](assets/source/macintosh-512k/README.md) explain optional regeneration.

```sh
npm --prefix frontend run build
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend run preview
```

The build includes TypeScript checks. Lint uses Oxlint. Node's test runner checks screen geometry and camera framing. These checks do not establish GPU performance or visual quality on another device.

## Layout

- `frontend/`: React, TypeScript, Vite, Three.js, and React Three Fiber.
- `docs/`: selected project decisions.
- `reports-examples/` and `reviews/`: preserved research and reference material.

## Hosting and future data

`netlify.toml` configures Netlify to build `frontend/` and publish its `dist/` output with Node.js 24. No deployment has been performed. A future crypto API is planned, with provider selection and integration deferred.
