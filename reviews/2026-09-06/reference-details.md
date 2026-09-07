# Detailed Visual Reference Audit

Companion to [the synthesis](<C:/Users/Still_yesterday/Desktop/Pons v2/reviews/2026-09-06/RESEARCH-REVIEW.md>).

This appendix preserves the detailed observations from two independent review scopes. Both concern the supplied desktop evidence, not newly tested websites. Dates in the component audits use UTC; the review date in Pacific time is September 6, 2026. All 364 library run/support files are represented in the unified [coverage record](<C:/Users/Still_yesterday/Desktop/Pons v2/reviews/2026-09-06/file-coverage.json>); the remaining 12 repository files are addressed in the synthesis and coverage record. Temporary inspection aids are not required to locate the original evidence.

## Part 1: Aethir, Celestia, LayerZero, Wormhole, io.net

Reviewed September 7, 2026. Scope: every file recursively under `reports-examples/pons-design-reference-library-2026-09-06/evidence/runs/2026-09-06-pons-infrastructure-design/` (E below) and `reports-examples/pons-design-reference-library-2026-09-06/supporting-work/2026-09-06-pons-infrastructure-design/` (S below). No external browsing, source edits, bundled-script execution, product design or final direction selection occurred.

### Coverage and confidence

- 92 files: 70 raster images and 22 text/code/JSON files.
- All 22 text files read in full, including five source records, five candidate records, four frame indexes, full manifest, findings, README, checkpoint, three helper scripts and zero-geometry diagnostic.
- 69 images successfully decoded and visually inspected. All 52 raw viewport frames were individually viewed at legible native scale. All five full pages, four reduced review images and the failed Celestia browser capture were viewed as complete consecutive native-width crops covering every row. Five first views, the board and io.net geometry-diagnostic image were viewed directly.
- One image, `S/celestia-corrupt-attempt.png`, is not reviewable: PNG IDAT checksum failure in PIL and invalid/unsupported image data in `view_image`. It remains preserved; its existence cannot count as completed visual inspection.
- Two exact-byte duplicate pairs inside this scope: `E/screenshots/wormhole.png` = `E/segments/wormhole/0.png`; `E/screenshots/ionet.png` = `S/ionet-dimension-attempt.png`. Both members of both pairs were rendered and seen. Reductions and stitch derivatives are not counted as independent design examples.
- Coverage is documented per supplied relative path in adjacent `file-coverage.json`, with size, hash, dimensions, method, status, notes and duplicates. Scratch crops are review aids, not added source evidence.

The supplied material supports judgments about these desktop marketing homepages. It does not establish that their designs caused token success, that a Pons product gap exists, that displayed claims are accurate, or that an interactive product works. These limits are mostly acknowledged well by the original report.

### Aethir

**Observed structure.** Announcement strip and dark sticky navigation; large left-aligned serif proposition with a luminous green particle globe on the right; two audience actions; full-width lime statistics band; alternating Earth/AI and Atmosphere/gaming explanations; partnership/video block; documentation resources; provider route and benefits; resource cards; lime closing call to action; extensive dark footer. The progression is richer than the first-view board conveys. (`E/segments/aethir/0.png` through `12.png`.)

**Identity and typography.** A sharp, segmented lime A mark pairs with a plain sans-serif wordmark. Very large editorial serif headlines, serif numerical statistics, clipped-corner buttons and translucent resource panels provide a consistent tension between expressive and technical. The serif voice, not just neon green, makes this stand apart. Exact font families are not established by screenshots. The standalone A reappears in the body, and its angular cuts also inform button corners (`0.png`, `6.png`, `11.png`). This is a useful example of extending a mark into an interface without making the entire page a logo illustration.

**What works for a complementary Pons product.** Strong separation between audiences; confident headline scale; a coherent material treatment used in several compositions; clear product nouns beneath the atmosphere. Separate explorer/creator or user/developer routes could follow the same principle if those audiences are validated. This is a visual principle, not a recommendation to inherit Aethir's service categories.

**What to challenge.** The content still uses broad promises; lime color plus globe is not itself an original idea. A substantial embedded-video section interrupts the visual system, and its supplied poster is visibly blurry (`5.png`). The resource area can be visually noisy behind translucent text panels. The strong-returns language and huge metrics are unverified claims, not copy patterns to import. Hero CTAs in the report lead to forms; visual CTA presence does not prove self-service access. The initial blank hero and second-pass recovery are reported, although the blank state itself is not in the selected sequence. Motion timing, loading behavior, keyboard access and mobile were not supplied or tested.

**Capture quality.** The selected 13-frame composite is largely coherent and includes the footer. Small particle seams remain possible. It is a better layout reference than the io.net capture but remains a sequence of static frames, with the same blurred video poster. Aethir's first screenshot and segment 0 differ subtly in particle state rather than being exact duplicates.

### Celestia

**Observed structure.** Centered sans-serif hero over black, a luminous fibre conduit, three performance claims, a sharp white fundraising block, three dark customer/use-case cards, chain-logo rail, two application/comparison panels, dark benefits and team sections, two large technical-offering banners, news cards and a fibre-wave footer (`E/segments/celestia/0.png` through `12.png`). The black/white transitions create hierarchy; not every section relies on a different effect.

**Identity and typography.** Restrained geometric/grotesk sans-serif headings and small body copy let the high-detail object dominate. Fibre strands recur in the hero, ecosystem cards, technical offering and footer. There is also a gyroscopic orb for Private Blockspace, so the system is more than a single fibre sculpture. The selected first view and raw sequence omit top navigation entirely. The failed browser full-page artifact nevertheless preserves a compact navigation and a small fine spherical-lattice symbol with a tracked uppercase Celestia wordmark at its top (`S/celestia-browser-attempt.png`, first crop). That diagnostic is useful for noticing the lockup; it is not a trustworthy full-page layout.

**What works for this project.** The transition from an evocative object to named use cases and investigation routes is valuable. A meaningful service metaphor can provide continuity across a site while concrete application examples do the explanatory work. The original report is right to separate potential throughput from measured throughput. An equivalent new product should have its own object grounded in its actual job, not a recolored fibre conduit.

**What to challenge.** The first selected viewport lacks both navigation and a primary action; it should not become the model for a landing page's functional first screen. Some faint border, label and body treatments are weak in the raster. Comparison panels contain strong performance/forward-revenue claims and attributed material that were not independently checked. Several sections are conventional three-card grids; acclaim for the overall identity does not make every card layout distinctive. The new project should not need invented investors, team pedigree or production statistics to fill the template.

**Capture quality and discrepancies.** Selected full page is usable with repeated scrollbar, slight fibre seams and small clipping in the moving logo rail. The failed browser capture repeats fundraising, ecosystem, feature, team, news and footer bands and leaves a large right black field; it must not guide proportions or page length. The corrupt capture cannot be opened. The report discloses these failures, so they are limitations rather than concealed contradictions. Claims of cinematic animation cannot be independently evaluated for smoothness or pacing from this static packet.

### LayerZero

**Observed structure.** Small black symbol, concise top navigation and developer action; centered two-line hero and converging hairline geometry; grayscale company-mark rail; a split section with a repeated fixed left title/diagram and four numbered right-side products; dedicated ATLAS copy and large linework frame; two oversized contact/build blocks; plain grouped footer (`E/segments/layerzero/0.png` through `11.png`).

**Identity and typography.** Almost monochrome. The compact interlocking vertical symbol, neutral sans typography, tiny monospaced-style numeric/utility labels, straight edges and very fine lines create a precise tone. Lines change orientation between the hero, product explanation and ATLAS frame while retaining a related grammar. Exact font families and whether labels are technically monospace were not verified from CSS.

**What works.** Strong restraint; clear spacing and typographic hierarchy; bounded navigation; explicit product staging. Console and ATLAS visibly say they launch later this year (`3.png`, `7.png`). That distinction matters: an existing token does not make every associated feature currently available. A separate infrastructure brand can appear credible without dark mode, glowing gradients or 3D art.

**What to challenge.** The grand global-finance promise is broad and would be interchangeable if copied into an unvalidated product. The hero gives little concrete product detail. Much of the page's distinction is motion/whitespace presentation; it is not an example of a dense working application. The pinned section spans many captures for four relatively brief descriptions, catches text in faded states and complicates quick scanning. Adopting the visual precision does not require adopting this scroll behavior. The company logos are claims requiring evidence, not generic trust decoration.

**Capture quality.** Full composite repeats parts of the same heading and product panels many times, including clipped text and buttons. This agrees with the manifest's scroll-sequence caveat. Individual raw frames are the reliable source for each state. Do not treat the roughly 6,934-pixel composite as a literal static-page design, and do not interpret duplicate headings as intended markup. Final footer is present. Motion, reduced-motion behavior and accessibility are untested.

### Wormhole

**Observed structure.** Bold italic all-caps wordmark, task-oriented navigation and transfer/build routes; very pale lavender isometric grid with layered tiles; institutional-logo rail and large metrics; connection explanation and connected-chain rail; forward market chart; four feature cards; W-token panel; Portal transfer illustration; social/community area, newsletter and footer (`E/segments/wormhole/0.png` through `13.png`).

**Identity and typography.** Heavy slanted wordmark contrasts with rounded/geometric sans headings. Dark plum text and actions anchor near-white/lavender surfaces. The same stacked planes and isometric grid connect the hero, explanatory diagram, token graphic and dark Portal background. A W token symbol is shown in the token panel. This is a cohesive family, though some pale icon/border choices lose visual strength.

**What works.** Of these five, this supplies the clearest example of connective infrastructure leading to a particular end-user action. The Portal preview shows inputs, token amounts, a transfer button and status feedback, so the visitor can picture a job. Distinguishing a protocol from a named user-facing application is especially relevant to a separate product complementing Pons; it must not imply an official affiliation or an integration we have not built.

**What to challenge.** The concrete UI arrives late, after broad claims and projections. Four large cards say secure/open-source/decentralized/customizable, exactly the kind of generic content that could survive a brand-name swap. The diagram is visually suggestive but its unlabeled tiles do not explain data provenance by themselves. Token visibility does not validate token necessity for our product. Transaction-submitted graphics are a marketing illustration; no successful transaction was tested. A prototype needs explicit sample/simulation labeling.

**Capture quality.** Chart labels and a few shallow basal bands appear, but meaningful bars do not finish rendering. The large transfer-volume metric and final community title are partly faded in the composite; raw metric frame `2.png` is fully revealed. The stitcher preserves earlier overlap pixels and therefore can retain an incomplete animation state even when a later raw frame is clearer. The final near-bottom frames differ by small scroll/hover changes and are not independent page sections. The report's broad warnings are accurate, but first views should not be treated as sufficient evidence for the product-preview judgment.

### io.net

**Observed structure.** Top price/availability promotion, highly customized black stencil-like wordmark, spare nav and black action; white beveled tiles connected around the io symbol with blue/violet edge accents; explicit savings/waitlist proposition; customer marks; benefits; GPU catalogue cards; dated price/deployment table; container/virtual-machine/Ray routes; AI platform input example; workflow/marketplace/training modules; closing action; partial footer (`E/screenshots/ionet.png`, all of `E/full-page-screenshots/ionet-stitched.png`).

**What works.** The catalogue exposes recognizable purchasable objects and fields: GPU model, amount, VRAM, storage and rate. Deployment choices have different actions. Even with a weak long capture, this demonstrates how infrastructure can be described through constraints and next steps, not just atmospheric art. Product-first clarity is the useful principle for a launch record, review screen or creator workflow once the job is defined.

**What to challenge.** Numerous third-party logos and availability/savings claims underpin the impression of maturity. They cannot be transferred. The price table explicitly says prices correct as of July 30, 2025; the report correctly refuses to treat it as current pricing. Some catalogue rates refer to amounts/clusters while others are per card or deployment mode, so labels matter. Generic AI platform/code decorations should not be copied into a Pons tool that has a different user job. The original report mentions an inquiry overlay and compliance badges; the saved raster establishes badges but does not let this review independently replay the overlay.

**Capture quality.** The 1,264 x 7,355 artifact places actual content in approximately the left two thirds, repeats benefit/catalogue/deployment/input/closing bands, loses some pieces, retains a displaced sticky header, leaves a huge bottom void and has a partial footer. These are material defects, not a whitespace design to imitate. Isolated GPU and deployment components remain interpretable. `ionet-stitched.png` is a filename, not evidence that the supplied stitch script was used. No raw io.net scroll sequence is supplied. The dimension diagnostic lists all geometry as zero, while its image is a perfectly valid duplicate of the selected first view.

### Provenance and helper audit

The report, README, candidate JSONs and checkpoint explicitly frame inclusion as a documented token launch, not commercial success. There are no unsuccessful controls, demand interviews, conversion measurements or validated current Pons API/SDK/contracts in this scope. The proposed independent Pons intelligence/operations tool, launch-record preview, hero wording, charcoal palette and translucent/data-path object remain author proposals; none is a user-selected direction.

All five candidate JSON payloads match their manifest candidate fields. All ten selected first/full-page paths exist. Four indexes cover their recorded page extents with overlapping frames and no material geometric gaps; Wormhole's final recorded bottom is 6712.6665 versus rounded total 6713. That is consistent with the script's pixel rounding, not a meaningful missing region. Declared CSS viewport 1280x720 differs slightly from some 1265x712 transport rasters; this is disclosed and normalized by the helper.

`S/stitch.py` preserves the first image in overlaps and appends the unseen suffix, checks numeric gaps/final coverage, and resizes frames to a single scale. It does not compare overlaps, detect scene shifts, measure rendering completeness, remove every overlay or handle animation semantically. LayerZero repetition and Wormhole incomplete reveals illustrate that limitation. It overwrites selected outputs if executed in its old project layout. It was inspected, not run.

`S/record.mjs` constructs candidate records with hard-coded date, captured outcome, desktop viewport and `visuallyInspected: true`, then calls a separate recorder, appends journal text and runs ready. These are declared observations; this script itself cannot verify them. Multi-step writes are not atomic and the recorder dependency is outside this owned script. `S/board.py` resizes first views into a fixed five-reference presentation with its own editorial recommendation tile. Neither adds independent evidence. All three helpers retain original `outputs/token-research/...` and/or `work/...` paths, so they are supporting provenance, not plug-and-play tools for this repository.

The run README's relative stitch link `../../../../work/2026-09-06-pons-infrastructure-design/stitch.py` is broken in this packaged layout; the actual file is under `supporting-work/`. Other checked relative links in the owned README/findings resolve. Original recorder and git validation outcomes are historical assertions, not tests rerun here. No source files were modified.

### Decision-useful synthesis

1. This sample contains multiple credible visual languages, not evidence that premium infrastructure must be dark or neon. Aethir supports expressive typography; Celestia supports a repeated material motif; LayerZero supports monochrome precision; Wormhole supports a connected brand/application explanation; io.net supports concrete product constraints.
2. Their strongest transferable property is consistency between identity, content and action. Combining all five signature effects would undermine that consistency. One original grammar is more useful than a collage of popular crypto surfaces.
3. Their weaker sections are also instructive: vague global/future promises, empty reassurance cards, inherited logos, unsupported numbers, late product demonstrations and motion-dependent content. A visually strong reference can still contain the patterns this repository wants to avoid.
4. Logo evidence here is limited to in-situ raster marks. There are no owned vectors, construction studies, alternate lockups, favicon tests, light/dark logo comparisons or licensing/uniqueness conclusions in this scope. Do not mistake a mood-board preference for a selected identity.
5. The next consequential decision is the concrete complementary job and primary audience. Until that is settled, identity directions and a representative working screen can be explored as hypotheses, but the supplied report does not authorize treating its suggested feature set, token role or affiliation as established.

## Part 2: Sui, Sei, Pyth, Ondo, Ethena, Render, Akash, Bittensor, EigenCloud, Pendle

Reviewed scope: every file under `evidence/runs/2026-09-06-pons-design-more/` and `supporting-work/2026-09-06-pons-design-more/`, relative to `C:/Users/Still_yesterday/Desktop/Pons v2/reports-examples/pons-design-reference-library-2026-09-06/`.

This is a review of supplied, dated evidence for a separate product that complements Pons. It does not select a product, brand, feature set, or visual direction. No original file was changed, bundled helper executed, or external claim independently refreshed.

### Coverage and method

All **272 files** were reviewed: **50 text/code/JSON files and 222 images**. The images comprise 191 raw scroll frames, 10 hero captures, 10 full-page composites, 9 supporting review images, and 2 comparison boards. SHA256 comparison identifies 161 distinct raw frames and 30 duplicate raw copies; all 10 hero captures duplicate their corresponding raw frame 0. There are 182 distinct image byte sequences across the complete scope.

Every distinct raw frame was visually inspected on labeled sheets at approximately 900 pixels wide per frame. Full-page and review images were inspected through complete column crops, with the raw frames providing more legible context. Both comparison boards were inspected. Exact duplicates are explicitly mapped to their visually inspected representatives in `file-coverage.json`; they were not mistaken for additional visual evidence. All text and script content was read; generated notes were compared field by field with source notes and queue entries, and manifest candidates with supporting candidate files. Source scripts were inspected statically only.

| Reference | Raw frames | Distinct raw frames | Main evidence limitation |
| --- | ---: | ---: | --- |
| Sui | 39 | 32 | Only 25 frames indexed; persistent overlays and an explicit stitch gap |
| Sei | 19 | 19 | Some metric placeholders; still images of tabs, diagram and marquee |
| Pyth | 37 | 20 | Repeated code-section captures; incomplete chart animation |
| Ondo | 31 | 31 | Large fixed disclosure obscures content; sticky product states duplicate |
| Ethena | 10 | 10 | Animated counters and historical/current yield figures are different states/bases |
| Render | 8 | 8 | Creative motion represented by stills; negligible one-pixel stitch tail |
| Akash | 16 | 16 | Page geometry changes; horizontal carousel becomes repeated vertical content |
| Bittensor | 1 | 1 | One viewport, no explanatory journey or motion evidence |
| EigenCloud | 25 | 19 | Invalid 1x1 geometry; severely defective full-page capture |
| Pendle | 5 | 5 | Product-title and counter animation produces incomplete composite text |

### What the references actually contribute

#### Sui: a visual system for a suite

Evidence: `segments/sui/0.png` through `38.png`, `full-page-screenshots/sui-stitched.png`, and `supporting-work/.../sui-notes.json`.

The white droplet outline and wordmark stay simple while the hero supplies the spectacle: electric-blue radial slabs behind a large white sans-serif headline. A blue announcement bar, square buttons, monochrome navigation and small monospaced labels keep the system recognizable. The later page is more useful than the tunnel: large editorial typography gives way to a vertical family of outlined product modules, different line illustrations and named tools, followed by audience panels, resource rows, press content and an extensive footer.

The transferable principle is a related graphic vocabulary mapped to distinct, explained capabilities. The tunnel, AI positioning, oversized manifesto and long suite presentation are not reasons to adopt that style for a smaller complementary product. The small mark need not contain all the complexity of the hero artwork.

Several blank or partially drawn areas appear in frozen frames; these should not be interpreted as deliberate empty design. A fixed event promotion and language/cookie controls repeat through the stitched page because they stay attached to the viewport. The directory contains 14 unindexed supplemental frames, including footer retries, beyond the 25 described by capture metadata. A roughly 95-pixel uncovered band and a tiny tail are recorded by the stitching output. The composite is useful for sequence, not a faithful model of spacing or overlay frequency.

#### Sei: editorial confidence and typographic contrast

Evidence: `segments/sei/0.png` through `18.png`, the full-page composite, and the Sei notes/candidate.

The actual identity depends on more than institutional photography. An emerald/gold city image supports condensed, bold uppercase typography; serif supporting copy, small monospaced navigation, thin rules, burgundy buttons and occasional gold accents create a distinct editorial hierarchy. White sections alternate with black network and metric panels. The circular wave mark remains compact. Partner logos, application tabs, a gold-line network diagram, a topographic map, builder resources and editorial cards provide varied rhythm.

Useful lessons are deliberate type contrast, disciplined image treatment and confidence without constant glow. A complementary product could use similarly strong information hierarchy without borrowing the architecture, mark or institutional claims. The hero's broad economic slogan alone is not very differentiating.

Some metrics remain gray placeholders. The comparison diagram juxtaposes unlike workloads such as transactions, trades and prompts; it cannot establish an equivalent performance benchmark. Roadmap labels must not become claims about deployed behavior. Sector quotations and logos need their original context, not reinterpretation as project endorsements. The record does not demonstrate tab behavior, every marquee item, responsive layout or motion.

#### Pyth: data, proof and implementation in one sequence

Evidence: `segments/pyth/0.png` through `36.png`, its composite, and source notes.

A spaced uppercase wordmark, a looped P-shaped emblem and a multicolored burst of data-like bars give the dark hero specificity. The page then moves from publishers to price feeds, charts, case studies, developer quick-start tabs and applications built with the product. Purple, orange, teal and green recur in data categories and brand art. Thin modern sans-serif typography and restrained illuminated borders tie the sections together.

The strongest lesson is the connection between a stated capability, visible output and an implementation path. That sequence is more valuable to a support product than copying rounded dark cards. Multiple entry points can address operators and builders without making them decode the same vague slogan.

The orange award badge, broad logo wall, repeated cards and dim secondary text weaken focus in places. Captured chart cards show sparse or partially animated content; these are not evidence of live feed quality. Frames 12-29 are byte-identical. Repeated capture of the same code region is a capture problem, not additional product depth. The report's visual description is broadly supported, but no saved screenshot validates publisher counts, financial figures, integration availability or operational reliability.

#### Ondo: composed finance storytelling, obstructed by disclosure

Evidence: `segments/ondo/0.png` through `30.png`, composite and Ondo notes.

The white hero has a specific composition: a headline split around nested portrait architectural frames, restrained serif copy and a floating dark rounded navigation bar. The concentric ring mark and clean wordmark remain distinct from the skyline art. Subsequent content combines substantial white space, pastel product charts, serif figures, dark trust sections, photographic quotations, a dotted globe, editorial cards and architectural newsletter imagery.

Useful principles are typographic contrast, information grouping and a consistent relationship between imagery and framing. The nested skyline treatment and institutional positioning are already another brand's expression. They should not become the new product's visual shortcut.

A large fixed disclosure panel obscures the lower-left portion of nearly every later viewport. Its repeated appearances are not repeated legal sections. Sticky product cards change state during capture, and sorting frames by scroll position creates duplicated or cut product elements. Four opening frames share the same scroll position while navigation/animation changes. The full page is therefore weak evidence for exact product layout or copy visibility. The report recognizes premium editorial character; the images add a significant obstruction and motion-capture qualification.

#### Ethena: consistent materials across the entire page

Evidence: `segments/ethena/0.png` through `9.png`, composite and Ethena notes.

The page sustains a silver-blue material vocabulary from its blue globe and pill-like navigation to metallic card rims, reserve imagery and circular motifs. The small angular emblem works in a circle without requiring the hero object to serve as the logo. Centered sans-serif headings, rounded panels and controlled partner colors create cohesion. The narrative moves through statistics, a comparative rate chart, benefits, earning platforms, transparency resources and editorial content.

The transferable value is consistency across hero, proof and detailed content, especially direct access to transparency material. The layout itself is familiar. Removing the financial content would leave a globe-and-cards landing page, so material polish alone is not sufficient differentiation.

Secondary text and legal details appear faint. A historical average and a navigation rate use different numerical bases; neither should be imported as a current financial fact. Some benefit counters are caught mid-state. The references do not prove comparative risk, yield suitability, operational integrations or full interactions. Borrowing the visual coherence should not import implied bank-like certainty or yield promises.

#### Render: show the output the infrastructure enables

Evidence: `segments/render/0.png` through `7.png`, composite and Render notes.

The orbital logo, red sign-in accent and dark hero frame dramatic creative imagery. That imagery supplies most of the distinctiveness. The later page uses a largely conventional white layout, gray rounded cards, repeated cube icons, newsletter form, press marks and role-based footer links. Artist credits are visible for notable visual examples.

The useful principle is concrete output: infrastructure becomes understandable when visitors see what people make with it. A complementary launchpad product could eventually use its own real project artifacts or before-and-after tasks. It should not borrow third-party artwork or imply those works were produced with the new product.

The report's emphasis on creative output is supported; the surrounding interface is less novel than the hero suggests. Repeated generic icons and broad speed/cost language do not provide much differentiation by themselves. The supplied images cannot establish the timing or quality of the hero footage, nor verify performance claims. The one-pixel uncovered tail is a minor capture defect, not a design concern.

#### Akash: the most useful operational explanation in this subset

Evidence: `segments/akash/0.png` through `15.png`, composite and Akash notes.

The opening is comparatively conventional: a geometric white mark, black background, large centered headline and simple deployment action. The stronger material follows. A get-started accordion pairs distinct roles with code or interface previews. A lime-accented pricing comparison uses resource selectors; a numbered sequence explains configuration, bidding and authorization. Actual resource-form imagery, case studies and provider information give the page a job to explain. Editorial collages and an illustrated horizontal carousel add character without replacing those steps.

This is especially relevant to a future creator or operator workbench: make the next action, required inputs and expected result visible. The existing report's cinematic shortlist understates this reference's practical value. The lesson is explanatory precision, not adoption of an AI/cloud theme.

Only selected accordion and workflow states are shown; visible selectors are not proof of tested functionality. The page height changes during collection, and a horizontal carousel produces repeated content in the vertical composite. Pricing comparisons require equivalent resources and dated assumptions before reuse. The supplied evidence does not establish actual savings, workload suitability or deployment success.

#### Bittensor: a memorable artifact with little onboarding

Evidence: `segments/bittensor/0.png`, hero, full-page and supporting review.

A nearly empty white page places a dense black geometric network object centrally, with a small tau mark and tiny uppercase navigation. Negative space and scientific visual language make a strong first impression. The network artwork is not the logo: the small tau carries identity at navigation scale.

This is useful evidence that distinctiveness can come from one controlled visual decision, rather than many decorative components. However, the supplied page offers almost no explanation or guided action for an unfamiliar visitor. It is a weak model for a new product that must explain why a creator needs it. A similarly restrained diagram might serve a specific function inside an otherwise clear product experience.

Only one viewport exists. The various saved representations do not add interaction, animation or deeper content evidence. Apparent full-page completeness means only that the recorded geometry was one viewport tall.

#### EigenCloud: related forms make a product family legible

Evidence: `segments/eigencloud/0.png` through `24.png`, defective full-page file, and source notes.

Useful raw frames show a black hero with a blue-gray block assembly, followed by related sculptural forms assigned to named modules. EigenCompute is blue, EigenAI green, EigenDA purple and EigenLayer steel-blue. The shared proportions and lighting create family resemblance while the color changes express distinct modules. A serif wordmark and dramatic serif footer contrast with rounded sans-serif headings and small monospaced navigation. Named use-case cards, an animated word field and photographic resource panels complete the story.

The report's blue/purple description misses the meaningful green module and the typography's role. The reusable idea is an intelligible family of tools with a common visual grammar. A sculpture should map to an actual capability; copying an abstract pile before defining that capability would recreate the generic infrastructure aesthetic the project wants to avoid.

The full-page PNG is severely defective: large blank areas, missing objects, repeated/fractured text and empty colored panels. Every indexed frame reports width and height of 1, total height 8 and scroll position 0. Its metadata explicitly acknowledges a failed geometry read and native full-page attempt. The raw frame sequence remains useful, but the composite must not be used to infer page hierarchy, section dimensions or intended empty space. Frames 18-24 duplicate one image. Motion and true page length remain unresolved.

#### Pendle: distinguish product modes within one identity

Evidence: `segments/pendle/0.png` through `4.png`, composite and Pendle notes.

Fine wireframe geometry appears in the hero and footer, while a compact split-circle mark carries identity. Two equally weighted product branches use blue for Boros margin trading and teal for V2 spot yield trading. Related orbital artwork, concise purpose statements and consistent App/About actions keep the choices comparable. The branch typography and accent colors distinguish the modes without making them look like unrelated products. Metrics, partner logos and a compact footer follow.

The useful principle is explicit routing when there are genuinely different user jobs. It does not justify inventing two modules for this new product. The supplied marketing page also provides little evidence about the actual working interfaces behind those links.

Thin lines, faint labels and small button borders deserve care. Some titles and counters are captured mid-animation, so the stitched version loses content visible in later raw frames. Partner marks are partially clipped in a transitional state. These are capture-state limitations, not reasons to reproduce incomplete typography. Superlative trust language or unqualified no-risk wording cannot be imported as product facts.

### Provenance, generated reports and helper audit

The README and findings appropriately identify these as current websites reviewed on a dated run, not reconstructions of their launch-era design. The sample was selected around token-associated infrastructure/protocol projects, not controlled commercial success. That distinction is essential: a launched token does not validate a visual choice, a buyer need, a support-product opportunity or the need for another token.

The queue provides specific launch/token source pointers. They include Sui and Sei mainnet references, Pyth distribution history, an Ondo exchange-listing source plus foundation material, Ethena's token announcement, Render's migration information, Akash's mainnet reference, current Bittensor emissions material, Eigen transferability information and Pendle circulation/vesting material. These are different kinds of events. The Bittensor and Pendle entries do not establish exact original launch dates. The underlying linked pages are not supplied as archived source documents in this scope and were not independently refreshed here; dates and claims should remain attributed to the queue until verified when consequential.

All ten supporting candidates match their manifest candidate fields. Generated design-note source fields match their corresponding note and queue fields; added category/style/URL fields were also read. The two checkpoint files cover the first and second groups of five. This is internally consistent bookkeeping, not independent validation. The manifest records desktop capture at nominal 1280x720 and a date, while observedAt is null. Actual raster widths/heights vary. A `captured` outcome does not certify that every derivative is good, particularly EigenCloud.

The three helpers were read completely without execution:

- `record.mjs` sets `outcome: captured` and `visuallyInspected: true` directly when creating candidates, then calls a separate recorder and appends journal/ready state. The Boolean is an assertion made by that process, not a machine test of visual inspection. Existing persisted records are consistent, but the code does not itself establish quality or an atomic multi-file transaction.
- `stitch.py` sorts frames by scroll position, scales using the first frame's geometry, crops overlap and fills/labels uncovered space. It does not validate invalid dimensions, remove every fixed overlay, reconcile animation states or recover obscured content. Its comment about avoiding sticky-header repetition should not be read as solving independent fixed elements. EigenCloud's 1x1 geometry is incompatible with ordinary reliable stitching.
- `compile.py` authors the shortlist and descriptions, creates five-hero comparison boards, composes generated notes, copies run/support directories and writes the gallery/catalog. Copying diagnostics along with useful files explains why the bundle contains more evidence than its clean presentation exposes. It does not perform visual quality checks, source verification or end-to-end link/interaction checks.

All three use historical `outputs/...` and `work/...` paths rather than this relocated library layout; compilation also assumes local Windows fonts. Their presence does not make the bundle a portable, reproducible build. The boards are legible but emphasize hero art, which hides Akash's workflows, Pyth's developer path and Pendle's product routing. Their captions and ranking are editorial judgments, not another independent source.

### Implications for the complementary product

The broadest recurring pattern is not a specific color: strong references make typography, logo, illustration and interface content tell the same product story. Small monochrome navigation marks coexist with elaborate artwork. Those should be evaluated separately; a cinematic object is not automatically a usable favicon or original identity.

The set also shows how easy it is to converge on the same dark hero, floating navigation, glowing object, rounded card and partner-strip template. Six references lean dark; three lean editorial/light or mixed, and Bittensor uses white scientific minimalism. A palette or material swap alone would not create a distinct concept.

The most transferable evidence is functional: Akash explains a workflow, Pyth connects data to implementation, Pendle makes product choices explicit, Sui and EigenCloud relate modules, and Sei/Ondo establish hierarchy through type and composition. Ethena shows system-wide material consistency; Render shows tangible outputs. These can inform future alternatives without adopting another company's mark, artwork, product vocabulary or claims.

These files do not establish the new product's first user, missing launchpad gap, verified integration, primary task or demand. They also do not supply complete application UX: no mobile states, keyboard traversal, measured contrast, reduced-motion behavior, loading/error states, performance, conversion evidence or controlled comparison. Static screenshot sequences indicate changing content, but do not establish animation timing, quality or interaction success. Future concept work should therefore compare original expressions on the same concrete user task once that task is defined, while retaining this research as evidence rather than a prescription.
