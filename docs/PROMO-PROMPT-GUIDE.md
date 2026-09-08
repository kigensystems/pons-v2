# Plum film: direction, model choice, and prompt guide

**Superseded creative direction:** the user rejected the Macintosh-led concept below. Read [PROMO-HANDOFF.md](PROMO-HANDOFF.md) for the current infrastructure/world montage direction and the three completed OpenArt tests. This document preserves the earlier proposal and dated model research.

Research checked September 7, 2026 (Pacific time). Discussion draft: the concept, duration, format, model, and spending have not been approved. No video generation was submitted during this research.

## Recommendation

Make a short commercial that feels like a broadcast you half-remember: mysterious and slightly unsettling at first, then reassuring when the supplied rainbow mark and **Plum** appear, followed by **a familiar feeling.**

Start with **Gemini Omni 1.1 Flash** for the main production test, compare the same hero shot with **H3 Max by fal**, and keep **Wan 3.0** as the third candidate. This is a recommendation based on current controls and evaluation evidence, not a claim that these models have been tested on Plum. Use approved still frames to guide the video, then assemble the film and exact branding in an editor.

## What the sites contribute

The refreshed local Plum opening, Explore, and About were visually inspected, as were [Shader's opening and About](https://www.shader.se/). Plum's current identity is forest-green darkness, warm ivory Macintosh plastic, cream paper, luminous Apple Garamond, Chicago controls, and a rainbow plum mark. Shader contributes optical softness, highlight bloom, grain, spatial haze, and a slightly uncanny corporate nostalgia. Its About portrait adds the feeling of an old company brochure.

Carry the material treatment, light, and restraint into the film. Keep the compact Macintosh and Plum's own mark. Aim for a carefully photographed early-1990s commercial seen through an aging broadcast transfer. A heavy VHS damage layer would obscure the materials we want people to feel. The emotional move is anticipation becoming recognition.

Current identity: [DESIGN.md](../DESIGN.md). Earlier supplied assets and unreviewed Kling studies: [PROMO-VIDEOS.md](PROMO-VIDEOS.md). The earlier 15-second duration was a proposal; the 24-second structure below is another proposal.

## Current model evidence

Artificial Analysis's retrieved **text-to-video with audio** table lists Wan 3.0 at **1238 ±10**, Gemini Omni Flash at **1238 ±6**, and H3 Max at **1235 ±10**. The confidence intervals overlap; the displayed order does not establish a decisive winner. These are broad blind preferences, not a test of nostalgic commercials or Macintosh fidelity. [Text-to-video leaderboard](https://artificialanalysis.ai/video/leaderboard/text-to-video)

Its **image-to-video with audio** table places H3 Max first, at **1200 ±9**, followed by Seedance 2.0 720p at 1192, MiniMax H3 at 1187, Gemini Omni Flash at 1181, and Wan 3.0 at 1176. The same page's no-audio summary lists Gemini Omni Flash at 1362 and Wan 3.0 at 1358. Do not compare numerical scores across these different tracks. The Google entry is named **Gemini Omni Flash**, not explicitly **1.1**, so it is not independent proof of the new version's ranking. [Image-to-video leaderboard](https://artificialanalysis.ai/video/leaderboard/image-to-video)

| Candidate | Verified capability | Implication for Plum |
| --- | --- | --- |
| **Gemini Omni 1.1 Flash** | Google's August 27 update adds first/last frames, extensions in ten-second increments to forty seconds total, 360p drafts, video references, and output upscaling to 4K. Conversational video editing is supported. | My first production test: useful controls for a slow reveal, revising a near-successful shot, and retaining an approved composition. Exact hardware fidelity remains to be tested. |
| **H3 Max by fal** | An August 26 fal post-trained version of MiniMax H3. Its current image-to-video schema exposes first and last images, a seed, 480P/768P/1080P, and prompt expansion. | First challenger: particularly relevant image-to-video evidence and a promising iteration option. H3 Max and base MiniMax H3 are distinct models. |
| **Wan 3.0** | Alibaba documents 2–30-second generation, first/last frames, multiple reference modalities, audio control, and 480P/720P/1080P. | Strong candidate if we choose a longer continuous shot or richer reference composition. Its text-to-video placement alone is insufficient to select it for this film. |

Sources: [Google's 1.1 announcement](https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/), [fal's H3 Max release](https://fal.ai/learn/devs/introducing-h3-max-by-fal), [H3 Max input schema](https://fal.ai/models/minimax/h3-max/image-to-video/api), [Alibaba's current model reference](https://www.alibabacloud.com/help/en/model-studio/video-generate-edit-model).

Access: Google documents Omni 1.1 in Flow for AI Plus/Pro/Ultra subscribers and through AI Studio/API. H3 Max has a fal playground/API; Wan 3.0 is available through Alibaba Cloud Model Studio. Account access and the chosen provider's checkout price have not been tested. Alibaba lists standard Wan 3.0 at $0.05/second for 480P, $0.10 for 720P, and $0.20 for 1080P: one five-second 1080P attempt is $1, before retries or other production work. This is a dated reference price, not an approved budget. [Alibaba release and pricing](https://modelstudio.alibabacloud.com/intl/blog/wan3-ai-video-generation-model/)

## Concept choices

1. **The remembered broadcast — recommended.** Abstract screen light gradually becomes an ordinary Macintosh in a quiet, hazy room. Recognition resolves the unease. This connects directly to the site and gives us a small, controllable cast of objects.
2. **The room after everyone left.** An empty family room at dusk, a curtain moving, the glow of an unseen screen. More human and emotionally nostalgic, with a wider environment to art-direct.
3. **The signal from somewhere else.** An unfamiliar landscape or phosphor-like space resolves into a CRT. More dreamlike, but needs restraint to remain recognizably Plum.

For the first route, propose **24 seconds**, four picture beats, and a simple ending. Assume X/social first from the existing promo brief until the destination is confirmed. A 4:3 picture fits the proposed broadcast treatment; choose the actual delivery canvas before preparing reference frames. If a provider offers only 16:9, compose for a centered 4:3 crop. A vertical version needs deliberate reframing.

| Edit time | Picture | Sound and feeling |
| --- | --- | --- |
| 0–5 s | Tight view of dim light reflected in curved CRT glass. The object is not immediately recognizable. | Quiet room tone, a faint electronic hum, one distant sustained note. Curiosity. |
| 5–10 s | Close detail of ivory keys and the lower bezel. Light slowly travels over the keys; the objects remain still. | A small mechanical click; the note becomes slightly unstable. Unease without a jump scare. |
| 10–17 s | Slow reveal of the actual Macintosh on its desk. Haze stays behind it, with readable contact shadows. | The sound becomes warmer as the familiar object is recognized. |
| 17–20 s | Camera settles. The screen holds a calm ivory glow. Cut or dissolve into the end card. | The unstable note resolves into a quiet original chord. |
| 20–22 s | Exact supplied mark beside **Plum**, set using the current wordmark treatment. | Give the identity a clear two-second hold. |
| 22–24 s | **a familiar feeling.** appears beneath the lockup. | Soft tail and room tone. Let the ending breathe. |

These times are editorial targets. Generate enough handles around each shot and trim in the edit; a model prompt is not a frame-accurate timeline.

## How we would build it

1. Agree on the concept and destination, then choose the opening, hero reveal, and final composition as stills. Use Plum's existing generated Macintosh artwork as the subject reference. Avoid using a website screenshot with navigation/text baked in as the actual first frame.
2. Prepare a small reference set: a clean hero composition, a CRT detail, and a keyboard detail, all with matching light and grade. A still should already look close to the intended film before asking a video model to animate it. No new reference assets have been generated for this draft.
3. Test one difficult shot before producing the whole film: the slow Macintosh reveal, using the same input image and motion brief across candidates. Two takes per model is a proposed initial comparison, subject to a confirmed cost. Match duration/canvas as closely as supported; record differences. Review the pictures muted first, then the sound.
4. Choose based on recognizable hardware, stable keys/bezel, credible emitted light and contact, calm camera motion, and the requested feeling. Judge usable shots and revision effort. A generic leaderboard score cannot decide these points.
5. Generate the selected shots, then cut, composite, grade, and mix in a conventional editor such as Resolve or the user's existing editor. Put consistent grain, subtle diffusion, and any tape-transfer texture across the finished edit. Build the final logo and type deterministically from the original assets. Generated sound can be audition material; the final emotional timing should be controlled in the mix.

If two attempts keep distorting the Macintosh, simplify the move to a small push or a locked frame. If that still fails, keep the hero object in a controlled composite or licensed 3D render and use generated atmosphere around it. Preserve the purchased model's separate licensing restrictions; this proposal uses the existing generated artwork for AI reference, not the purchased no-AI model.

## Prompt construction

Use this order: **reference role → framing → one camera move → one visible event → light/material → period treatment → sound → exclusions**. Describe what the viewer can see and hear, rather than only stacking mood adjectives. Google explicitly documents framing, motion, style, lighting, location, action, and targeted conversational edits. [Official Omni prompt guide](https://deepmind.google/models/gemini-omni/prompt-guide/)

Reusable style paragraph:

> An early-1990s television commercial, carefully photographed on film and softly transferred to broadcast video. A quiet forest-green room, warm ivory plastic, cream phosphor light, restrained optical diffusion, gentle highlight bloom, fine organic grain, subdued saturation. The atmosphere is dreamy and mildly uncanny, with slow, deliberate pacing. The scene feels physically ordinary and emotionally half-remembered.

Do not assume a provider accepts a separate negative-prompt field. Put essential exclusions in ordinary prompt language unless the selected interface documents one. Set duration, resolution, and canvas in the actual controls where available.

### First comparison prompt: Macintosh reveal

Use an approved hero still as the first frame. Crop/compose it beforehand to leave room for the intended move.

> Use the supplied image as the exact starting composition and Macintosh reference. One continuous shot. The camera makes a very slow, shallow pullback, revealing slightly more of the desk while keeping the computer at the same three-quarter angle. The Macintosh, keyboard, mouse, cables, screen shape and key layout remain unchanged and motionless. The CRT gradually brightens to a quiet cream glow. Its light softly reaches the inner bezel and the nearest keys, falling away naturally across the desk. The computer has a stable contact shadow. Thin haze drifts slowly behind it; the foreground stays readable. An early-1990s filmed television commercial with forest-green shadows, warm ivory plastic, subtle optical diffusion and fine grain. Quiet, mysterious, then gently reassuring. Audio: low room tone, a faint electronic hum and a soft mechanical click; no speech or music. No cuts, added objects, floating hardware, dramatic orbit, rapid zoom, text, titles, logo overlays or flashing glitches.

### Insert prompt: the glass

> One continuous extreme close-up of the curved CRT glass from the supplied detail frame. Camera almost still, with a barely perceptible sideways drift. A dim cream reflection slowly becomes brighter along the curve; most of the glass stays dark green. A soft focus transition reveals the edge of the ivory bezel near the end. The materials stay solid and physically unchanged. Early-1990s filmed commercial, gentle diffusion, restrained bloom and fine grain. Quiet room tone and a low electronic hum. No symbols, readable text, faces, particles, lightning, rapid movement or cuts.

### Insert prompt: the keys

> Use the supplied keyboard detail as the exact first frame. Locked-off close-up. The keyboard remains completely still while soft CRT light slowly brightens the tops of a few ivory keys and falls off into the forest-green room. Keep every key and gap consistent. Gentle depth of field, warm worn plastic, subtle film diffusion, fine grain. The image feels like a small forgotten moment from an early-1990s commercial. Quiet room tone and one offscreen mechanical click. No hand, typing, moving keys, extra rows, text overlays or camera orbit.

### Model-specific adjustments

- **Omni 1.1:** use first/last frames when both compositions are settled. Start with a low-resolution draft for timing, then inspect an appropriate final-resolution sample for materials. Revise one visible problem with conversational editing, for example: “Keep the composition, camera path, geometry and timing. Reduce the haze so the keyboard and desk contact stay clear. The screen remains the main light source.” Reinspect the whole clip; preservation is a requested behavior, not a guarantee.
- **H3 Max:** set the first image and, where useful, the last image in the actual fields. The documented default is five seconds and 768P; 1080P is latent refinement from 768P. Start with balanced prompt expansion and keep the returned expanded prompt for comparison, since an automatic rewrite can add unwanted drama. A seed is useful for tracking a run, not a promise of matching output across models.
- **Wan 3.0:** explicitly request one continuous shot and a narrow action even though the model supports longer narratives. Use its first/last-frame or reference mode for the hero object. Its audio toggle supports a silent picture study. Keep exact branding in the editor; Alibaba itself identifies audio texture and text accuracy as ongoing limitations.

## End card and sound finishing

Use [the supplied mark](../assets/promo/plum-mark.png), which currently matches [the site's mark](../frontend/public/images/plum-mark.png) byte-for-byte. Place it beside bold italic Apple Garamond **Plum** on deep forest green, then reveal **a familiar feeling.** below. Apply a modest common glow and grain so the card belongs to the footage; keep the edges and words legible. The source mark is 256 × 256: keep its displayed size sensible rather than treating it as a native 4K asset.

Build the sound arc across the edit: ordinary room tone → uncertain electronic note → quiet, familiar resolution. Use an original short chord or chime, with the same sound introduced earlier and resolved at the identity reveal. Avoid a recognizable copyrighted commercial recording or startup sound. A voiceover is optional; the first proposed cut lets the final words work visually.

## Inspection and local-preview limitations

The repository was merged with `origin/main` at `0c482fe`, preserving the existing local promo/mark commit. Frontend dependencies were installed without changing the lockfile. Build and lint passed; the build reports a large-chunk warning. This was visual research, not a wallet or launch-flow test.

The local root `.env` lacks `VITE_REOWN_PROJECT_ID`, and the imported wallet setup throws before the pages mount without it. For visual inspection only, the production build was made with an all-zero placeholder supplied to that build process. No `.env` or application code was edited. The preview at `http://127.0.0.1:4173/` renders the current aesthetic, but wallet connectivity is not configured; Explore's registry was unavailable and the CRT showed NO SIGNAL. The real project ID and a rebuild are needed for a normally configured preview. Site inspection does not imply that its live data or product claims were verified.

Next discussion decision: choose the remembered broadcast, the empty room, or the more abstract signal; then confirm the destination and duration before preparing frames or spending on generation.
