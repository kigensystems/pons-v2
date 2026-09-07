# Macintosh opening scene validation

September 6, 2026, Pacific time. Local development only; no deployment.

## Assets and Blender

- Copied all twelve files from `Desktop/Retro Mac 3D` into the project. SHA256 verification before and after processing confirmed that every desktop original and project source copy remained unchanged.
- Blender 5.2.1 imported the FBX, reconnected the supplied textures, and saved an editable full-resolution source blend.
- The Blender studio render was visually inspected for silhouette, keys/legends, vents, floppy slot, cables, and texture placement.
- `node assets/tools/inspect_macintosh_glb.mjs` passed: GLB 2.0, 25,146 triangles, four model primitives, three materials, normalized independent Screen UVs, no required extensions, and texture dimensions within the 2K limit. Export: 4,623,224 bytes.

## Browser and visual checks

- Real model rendered with both the WebGPU backend and explicitly forced WebGL2 backend in Chrome. Renderer and ready state were read from the canvas's development metadata, and screenshots were inspected.
- Desktop views at 1440 × 900 and 2015 × 1027; mobile at 390 × 844. Checked readable headings/controls, model framing, and no horizontal overflow.
- Fixed a focus-induced internal scroll after viewport resizing: the opening now uses `overflow: clip`, keeping the header at the top.
- Compared against the live Shader opening and adjusted CRT emission, bloom, textured fog, light contrast, and object scale.
- Keyboard activation toggled both the CSS atmosphere and canvas rendering state; a visible keyboard focus outline was verified.
- The OS reduced-motion setting starts the scene paused. Users can explicitly resume it. Hidden-tab pausing is implemented using the visibility event.
- A deliberately blocked GLB request showed the still image and a readable retry message. Request blocking was then removed and the model restored.
- No browser warnings or errors were observed during ordinary rendering on either backend. The deliberately blocked request produced the expected test error.

## Build and performance boundaries

- `npm --prefix frontend run build`: passed TypeScript and production compilation.
- `npm --prefix frontend run lint`: passed Oxlint.
- Scene code is split from the React shell. Build output: approximately 61 KB gzip for the shell, 255 KB gzip for the GPU scene module, and 2.8 KB gzip CSS. Vite reports its standard warning for the 927 KB uncompressed scene chunk; this was not suppressed.
- Configured limits: 30-fps ambient rendering, pixel ratio at most 1.5 desktop / 1.25 mobile, bloom at 35% resolution, 1024px shadow map, and render-on-change when paused.
- A foreground Chrome WebGL2 mobile-viewport sample measured 29.9 fps against the 30-fps cap. An earlier occluded-browser sample was throttled to about 1 fps; this was a browser visibility/focus condition, not an equivalent benchmark.
- These checks establish local rendering and behavior. They do not establish battery life, performance on physical mobile devices, network loading performance, or a speed advantage of WebGPU over WebGL2.

## Reproduction and remaining work

- Local preview: `npm --prefix frontend run dev`.
- Force fallback in development: `http://127.0.0.1:5173/?renderer=webgl`.
- Regenerate licensed GLB: `blender --background --python assets/tools/prepare_macintosh.py` (requires the copied purchased source).
- Source files, working Blender files, and the web model remain local and excluded from Git. Restore/regenerate them on a fresh checkout.
- Netlify deployment, public asset packaging, final product copy, name/logo, and API integration are deferred.
