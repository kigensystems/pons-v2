# Opening scene visual target

## Reference and current state

- Opening-to-Explore scroll transition: [behavior and validation](SCROLL-TRANSITION.md), [desktop through the glass](screenshots/scroll-through-desktop.jpg), [mobile through the glass](screenshots/scroll-through-mobile.jpg). Native scroll zooms toward the CRT and reveals Explore; reverse scrolling restores the opening. This is separate from the unresolved lighting feedback below.

- Lead reference: [live Shader opening](https://www.shader.se/). Compare its luminous CRT, contact with the surface, dreamy haze, warm materials, and processed typography. Keep our compact Macintosh and identity. This document covers the opening; the separately authorized Explore and About pages are documented in [LAUNCH-DESK.md](LAUNCH-DESK.md).
- Current implementation: original Macintosh artwork with live TV, composited glow, and SVG shadows. Preserve working TV and opt-in audio.
- Latest CRT cleanup: [desktop before](screenshots/crt-clean-before-desktop.png), [desktop after](screenshots/crt-clean-after-desktop.png), [mobile before](screenshots/crt-clean-before-mobile.png), [mobile after](screenshots/crt-clean-after-mobile.png). Same paused opening picture at each viewport. Painted glow outlines and broad washes are removed; small highlight diffusion stays inside the glass, and the key reflection uses a luminance mask. These are implementation evidence awaiting user assessment.
- Rejected CRT-brightness pass: [desktop](screenshots/crt-after-desktop.png), [mobile](screenshots/crt-after-mobile.png). User feedback: "The edges + reflections just look really bad, very low quality." Do not treat the earlier visual inspection as acceptance.
- Directional-light baseline: [desktop](screenshots/directional-after-desktop.png), [mobile](screenshots/directional-after-mobile.png). Front-to-side shadow transition and darker, less defined floor are retained in the CRT pass.
- Previous atmosphere pass: [desktop](screenshots/atmosphere-after-desktop.png), [mobile](screenshots/atmosphere-after-mobile.png). User feedback: "It looks the exact same." Its global grading and small reflections did not produce sufficient perceived change. Do not treat that pass as visual success.
- Prior contact revision: [desktop](screenshots/contact-after-desktop.png) and [mobile](screenshots/contact-after-mobile.png). Filled shadows sit beneath the transparent artwork and foreground haze sits behind the assembly.
- Previous baseline: [desktop before this edit](screenshots/contact-before-desktop.png) and [earlier mobile](screenshots/image-grounding-mobile.jpg), from the `14299f4` implementation. User feedback: light/reflection changes are not noticeably better, and shadows look fake. The new contact revision awaits assessment; light/reflection feedback remains open. Do not carry earlier completion claims forward as aesthetic approval.

## Acceptance criteria

- The CRT visibly emits light at normal viewing size. Bright footage produces perceptible glow; dark footage emits less. Any keyboard spill should read as light on the keys and housing, not an unrelated color wash.
- The computer, keyboard, and mouse convincingly rest on one surface. Contact edges and shadow direction agree with the image's perspective and baked lighting; no detached dark outlines or floating objects.
- Keep warm ivory casing with readable material detail and a restrained cool fill. The computer should belong in the surrounding scene.
- Let the landscape recede into darkness without losing contact edges. The screen should supply localized light to the inner bezel and nearby keyboard; retain a soft glass reflection and curved-edge falloff without obscuring footage.
- Haze establishes depth behind and around the computer while leaving surface contact readable. Compare softness, grain, and glow with Shader rather than judging each overlay in isolation.
- Desktop and mobile retain clear copy, visible TV and controls, and a coherent composition without horizontal overflow.

For each small adjustment, compare before/after at one viewport first, using the existing Pause TV control for lighting checks. Do not build custom preview tooling for this. Inspect at normal size before checking the second viewport. If the result fails visually, revise the technique. Commands are in [AGENTS.md](../AGENTS.md); current scope is in [PROJECT-BRIEF.md](PROJECT-BRIEF.md).
