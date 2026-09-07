# Frontend

React + TypeScript + Vite. The current opening scene uses rendered Macintosh artwork, DOM screen graphics, and CSS/SVG atmospheric layers. Three.js and React Three Fiber are installed for the upcoming real 3D model and are not imported into the current page bundle.

Use Node.js 24. Run `npm ci`, then `npm run dev` from this directory. Run `npm run build` for TypeScript checks and production output, `npm run lint` for Oxlint, and `npm run preview` to serve the production build locally.

The atmosphere button pauses/resumes all ambient animation. Reduced motion starts paused; the user can explicitly enable it. Hidden tabs pause animation. The scene has responsive desktop/mobile compositions and an artwork failure message. No scroll sections, API calls, or product workflows are implemented.

See the [project brief](../docs/PROJECT-BRIEF.md) before extending the scene and [asset record](public/ASSETS.md) for source/license details. The Macintosh is temporary rendered artwork, not yet a live 3D model. Future model imports go in `../assets/source/macintosh-512k/`.
