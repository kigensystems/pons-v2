# Opening scene visual target

## Reference and current state

- Lead reference: [live Shader opening](https://www.shader.se/). Compare its luminous CRT, contact with the surface, dreamy haze, warm materials, and processed typography. Keep our compact Macintosh and existing opening-only scope.
- Current implementation: original Macintosh artwork with live TV, composited glow, and SVG shadows. Preserve working TV and opt-in audio.
- Latest captured baseline: [desktop](screenshots/image-grounding-desktop.jpg) and [mobile](screenshots/image-grounding-mobile.jpg), from commit `14299f4`. These are implementation evidence, not approved design.
- User feedback on this baseline: light/reflection changes are not noticeably better, and the shadows look fake. These remain unresolved. Do not carry earlier completion claims forward as aesthetic approval.

## Acceptance criteria

- The CRT visibly emits light at normal viewing size. Bright footage produces perceptible glow; dark footage emits less. Any keyboard spill should read as light on the keys and housing, not an unrelated color wash.
- The computer, keyboard, and mouse convincingly rest on one surface. Contact edges and shadow direction agree with the image's perspective and baked lighting; no detached dark outlines or floating objects.
- Keep warm ivory casing with readable material detail and a restrained cool fill. The computer should belong in the surrounding scene.
- Haze establishes depth behind and around the computer while leaving surface contact readable. Compare softness, grain, and glow with Shader rather than judging each overlay in isolation.
- Desktop and mobile retain clear copy, visible TV and controls, and a coherent composition without horizontal overflow.

For each small adjustment, capture a matching before/after at one viewport first; hold the TV frame fixed for light comparisons. Inspect at normal size before checking the second viewport. If the result fails visually, revise the technique before writing completion evidence. The workflow and preview address are in [AGENTS.md](../AGENTS.md); scope and historical decisions remain in [PROJECT-BRIEF.md](PROJECT-BRIEF.md).
