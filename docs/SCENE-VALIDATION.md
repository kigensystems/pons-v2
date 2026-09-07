# Macintosh opening scene validation

## Current pass — September 6, 2026 follow-up

Local development and local production preview only. The user's final interaction direction supersedes the earlier visible controls: the computer stays stationary, dragging changes the camera viewpoint, and the ordinary opening has no visible toolbar or pause button. Focus was pulled back to show the bezel and enclosure.

### Automated validation

- `npm --prefix frontend run build`: passed TypeScript and Vite production compilation.
- `npm --prefix frontend run lint`: passed Oxlint.
- `npm --prefix frontend test`: six Node tests passed. They cover actual curved vertices, translated/rotated/nonuniform and mirrored transforms, exported UV orientation, portrait/landscape refitting, depth, and invalid geometry/viewport inputs. No new dependency was added.
- `git diff --check`: passed.
- Production output: shell 61.47 KB gzip, scene 258.06 KB gzip, CSS 2.84 KB gzip. The existing scene-chunk size warning remains (934.52 KB uncompressed); it was not suppressed.

### Visual and interaction validation

- Revisited the live [Shader opening](https://www.shader.se/) and visually compared it with the generated image and retained Blender `baseline`/`glass` studies. Inspected actual loaded canvas renders rather than only the loading still. The cream/lavender treatment, dark glass reflections, quieter type, and reduced foreground mist were iterated in Chrome. The result remains a lighting/material study of the purchased asset, not an exact recreation of the generated image.
- Inspected 1440 × 900 desktop and 390 × 844 mobile views, plus the normal wide desktop window. Checked whole-computer framing, the pulled-back monitor view, readable text, keyboard focus, and no horizontal overflow.
- Confirmed both WebGPU and forced WebGL2 in the **production build** using the renderer's reported backend. Inspected desktop views on both and mobile views during development/production checks. Ordinary production rendering returned no browser warnings/errors before intentional download-failure tests.
- With reduced motion enabled, the opening starts paused. Arrow keys and touch dragging changed the camera; the model's full world transform remained unchanged. Paused direct input advanced frame counts, then stopped drawing when idle. Yaw clamps at ±36°, elevation at ±12°; the keyboard positive-yaw clamp was exercised.
- Touch selection hit the actual CRT, entered monitor view, and Escape returned to the computer. Focus after a changed viewpoint remained aligned to the screen; viewport resizing refit it. Screen geometry includes the real approximately 4.9° tilt, and its exported UVs place V=0 at the top. The final focus fit uses at most 46% of each viewport axis in normalized screen bounds, retaining space around the CRT.
- Verified reset cancels an in-progress mouse drag. Screen-reader instructions and keyboard equivalents live in the DOM canvas. Enter toggles monitor focus, Escape/Home reset, and Space explicitly pauses/resumes atmosphere. Pointer input does not show the keyboard focus outline.
- A real hidden-tab check reported `document.hidden: true`, motion paused, and frame count **1165** unchanged across separated reads; showing it again resumed frames. The test browser's focus-emulation override was temporarily disabled for this check, then restored.
- Deliberately blocked the production lazy scene module: the error boundary retained the still, displayed a readable message, and keyboard activation of **Reload 3D scene** restored live 3D after unblocking. Repeated this with the GLB request blocked; the scene's own fallback/reload path recovered too. Failure screenshots were inspected on mobile. All request blocking was removed afterward.

### Rendering boundaries

- Fixed a canvas intrinsic-size/percentage-height feedback loop discovered during fresh inspection. The canvas now occupies a definite absolute viewport, and drawing-buffer dimensions are capped at 4096px in addition to the 1.5 desktop / 1.25 mobile pixel-ratio limits. Confirmed the mobile cap under emulated device pixel ratio 3.
- Ambient and input-driven draws share a 30-fps ceiling; idle paused and hidden scenes do not loop. Static softbox reflections are baked once into a 128px PMREM. Bloom remains at 35% resolution and the shadow map at 1024px. The purchased model remains four primitives / 25,146 triangles; no geometry or texture files were rewritten.
- Foreground WebGPU development metadata sampled approximately 30 fps (30.1 in one two-second interval). A foreground WebGL2 mobile-viewport sample recorded 2,005 frames in 66.83 seconds, approximately **30.0 fps**. An occluded WebGL2 tab first read approximately 1 fps; that was browser throttling and was not used as the foreground sample.
- These are local desktop-GPU observations with emulated mobile viewports. Physical-phone performance, battery use, network conditions, and comparative WebGPU efficiency remain unverified.

### Reproduce and preserve

- Develop: `npm --prefix frontend run dev` at `http://127.0.0.1:5173/`.
- Production: build, then `npm --prefix frontend run preview`. `?renderer=webgl` explicitly selects the fallback on either server.
- Drag changes viewpoint; selecting the monitor focuses it and selecting again returns. Double-click resets. Keyboard behavior is described above.
- Licensed GLB, purchased originals, and Blender studies remain local and ignored. `reports-examples/` and `reviews/` remain untouched and untracked. No remote is configured. No deployment, extra sections, scroll behavior, logo, or API integration was added.

## Earlier checkpoint — historical checks

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
