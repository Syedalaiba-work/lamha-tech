# LAMHA Technologies — Immersive Redesign 2.0

Branch `redesign/immersive-2.0`, cut from production commit `2a7a3f7`. Nothing here is deployed.

## 1. Reference analysis

Both references were inspected in a real (headless Edge, software WebGL) browser on 2026-10-22: desktop 1440×900 scroll journeys, 390×844 mobile journeys, pointer movement, menu click, and `prefers-reduced-motion`. Screenshots live outside the repo (session scratchpad).

### Lusion (lusion.co)

| Aspect | Observed |
| --- | --- |
| First screen | Lavender-white page; the WebGL scene sits in an inset, rounded "screen" with margins, not full-bleed. A dense cluster of glossy plastic connector pieces (white, black, electric blue) reacts to the pointer (the cluster re-arranges and the stage darkens on movement). Black triangular corner wipes on load. |
| Type | One family (Aeonik), regular weight. Section titles at 144 px with −2 % tracking; the intro paragraph is small (36 px h1, ~15 px body). Huge contrast between title and body sizes. |
| 3D and the page | One fixed full-viewport canvas behind the DOM. A thick blue 3D ribbon weaves through the "Bold Ideas, Brought to Life" title, so type and 3D share depth. |
| Scroll story | Hero → manifesto title → reel → editorial two-column project grid (image, tag line, title) → a tablet that the camera zooms into → black space scene with an astronaut → the words "Step into a new world…" split apart and fly past the camera → a grid-tunnel fly-through with colour shifts and a lens ring. |
| Navigation | Wordmark left; three small pills right (theme, "Let's talk", "Menu"). The menu click target in headless mode hit a hidden element, so the open menu was **not verified**. |
| Mobile | Single column; the 3D cluster fills the first screen; reel and project tiles stack. |
| Loading / reduced motion | Black preloader with a percentage counter and progress bar. Under reduced motion and software GL it stalled at 64 % for 7 s+, i.e. the page does not degrade gracefully there. |
| Footer | **Not reached**: the custom scroll caps travel per wheel event; footer not verified. |

### Wezero (wezerostudio.com)

| Aspect | Observed |
| --- | --- |
| First screen | White. A full-bleed, ~345 px black wordmark across the top; "ADIGITAL · AGENCY" in condensed caps either side of a geometric emblem (two black diamonds and a blue circle). Coordinates of Islamabad in a micro label. |
| Type | Anton (condensed caps) for display, Space Grotesk for body, one script word ("Matter", "Work") as an accent. Display copy is enormous and set in caps. |
| 3D | None. No canvas at all: the impact comes entirely from type scale, colour and layout motion. |
| Scroll story | Full-screen blue colour wipe → motto in giant caps on blue → "We build experiences that *Matter*" → services as a scroll-scrubbed word list (active word turns blue, a tilted image card changes) → "WHAT WE DO" in staggered giant words → full-width capability panels (black, orange, blue, green) that stack over each other with outlined diamond diagrams and vertical labels → closing statement → CTA → minimal footer (emblem, email, LinkedIn, "Start a project"). |
| Navigation | "MENU" opens a full-screen black overlay with giant condensed links (current page in blue), LinkedIn/email and a "Let's talk" pill. |
| Mobile | Same system scaled down; type stays oversized; wipes and stacked panels intact. |
| Reduced motion | Page renders statically; no broken states observed. |

### What the quality bar actually consists of

1. **Scale contrast**: display type 6–20× body size, used sparingly, with very generous space.
2. **One idea per screen**: each viewport says one thing; sections are full-height chapters, not stacks of cards.
3. **Depth between type and image**: 3D (Lusion) or overlapping layers (Wezero) interleave with headlines.
4. **Choreographed transitions**: colour wipes, stacked panels, zoom-throughs; the *transition* is the content.
5. **Reduced chrome**: tiny nav, no visible grid of cards, labels kept minimal.
6. **A single, owned visual motif** (connector pieces; diamonds + circle) repeated with discipline.

## 2. Audit — why the current LAMHA site falls short

Measured on production (`2a7a3f7`) at 1440×900 and 390×844.

| Problem | Evidence |
| --- | --- |
| Template repetition | Every inner page (14 routes) opens with the same navy hero: ~44 px heading left, two buttons, a small 3D cluster right. |
| Type is timid | Home h1 is ~48 px; section titles 30–40 px. Nothing approaches the 144–345 px moments of the references. |
| Cards everywhere | Services (13 numbered cards with outlined numerals), principles (6 cards), engagement table, technology rows: the page reads as a catalogue. |
| 3D is decoration | Hero modules scatter across the navy field; they never anchor a composition or interact with type. |
| Micro mono labels | 8–11 px uppercase mono labels on nearly every block add noise, not hierarchy. |
| Dark-first | Every hero is navy, contradicting the light-first brand direction. |
| Length without rhythm | Home is ~18,600 px tall (desktop) / ~26,500 px (mobile) with uniform section rhythm. |
| Strengths to keep | Real copy and data model, owner-editable content, accessible navigation, reduced-motion support, WebGL fallbacks, fast build, LAMHA L-module geometry. |

## 3. Creative direction — "Problems into Progress"

LAMHA's own mark is an angular **L-form with a chamfered inner corner** plus **two blue diamond nodes**. The redesign makes that the single owned motif (as connectors are for Lusion and diamonds-plus-circle for Wezero) and stages the tagline literally: scattered L-modules (*problems*) assemble into a lattice (*systems*) and rise as a staircase (*progress*).

- **Light-first**: white and Cloud (#F5F8FC) carry most screens; Navy (#0B1B3A) is reserved for cinematic chapters; Blue (#1769E0) appears as full-screen moments, never as decoration.
- **Typography**: Montserrat (brand display face) at 700–800, up to `clamp(4.5rem, 16vw, 16rem)` with −0.06 em tracking; Inter for reading text at 17–20 px. Mono labels removed except for numerals/time.
- **Signature transitions**: (1) the **L-wipe** — the next surface grows out of an L-shaped mask; (2) **split headlines** that pull apart on scroll; (3) **stacked chapters** that slide over each other; (4) the **step-through** — the final CTA's L-frame scales until the visitor passes through it into the footer; (5) a navy **L-curtain** page transition.
- **3D**: one WebGL scene per page at most. Home hero: a pointer-reactive instanced sculpture of L-modules and diamond nodes in ceramic white, navy enamel and blue glass, lit like a product shot on a light stage, scroll-morphing Problems → Systems → Progress while giant words sit behind and in front of it. Everything else uses CSS/SVG so phones stay fast.
- **Interaction**: hover-revealed service previews, magnetic primary buttons, scroll-scrubbed lists, keyboard-equivalent states for every hover effect. No custom cursor (removed earlier at the owner's request).

## 4. Page-by-page plan

| Route | Composition |
| --- | --- |
| Home | (1) Light pinned hero: giant "Problems" / "Progress." around the 3D assembly; words split as the sculpture assembles. (2) L-wipe into a navy manifesto that lights word by word. (3) "From Ideas to Systems. From Systems to Impact." as three stacked chapters (Cloud → Navy → Blue) mapped to the six real process stages. (4) Services as a giant scroll/hover index of 13 services in 3 families with a live preview. (5) Technology system map (dark). (6) How we engage: three engagement models as editorial rows. (7) People + careers. (8) Step-through final CTA into the footer. |
| Services | Typographic hero ("13 services. Three families."), then three full-bleed family chapters with giant hover rows and previews. |
| Service detail | Family-coloured hero with the service's own visual at large scale, outcome statement, sticky in-page index, editorial capability list, process rail, deliverables, FAQs. |
| Solutions / detail | Audience chapters (Startups, SMEs, Enterprise, Custom) as stacked panels; detail pages lead with the audience problem statement. |
| Technology | Interactive system map hero (categories as nodes), principles as kinetic statements. |
| Products & R&D | Honest "built for ourselves" narrative: two engines (client work / internal R&D) as a split composition. No invented products. |
| Work | No approved case studies exist: an intentional, designed "selected work is being prepared" state plus the real way to see capability (services, start a project). No invented clients. |
| About / Leadership | Narrative chapters: positioning, mission and vision as giant statements, the three service families, real leadership portraits as an editorial strip. |
| Careers / detail | Giant hero, values as statements, open roles as large rows; the existing application flow untouched. |
| Contact / Start a project | Premium split: giant invitation + direct contacts; the existing forms in a calm, high-contrast panel. Forms, validation and actions unchanged. |
| Privacy / Terms | Editorial reading layout. |

Constraints honoured: real copy only, all routes/SEO metadata/forms/auth/admin/integrations untouched in behaviour, reduced-motion and no-WebGL paths for every new effect, keyboard focus states for every hover effect, no horizontal overflow, contrast ≥ WCAG AA.

## 5. What was implemented

**Design system** — `globals.css`: oversized display scale (`text-mega` up to 17 rem, `text-giant`, `text-display`), Montserrat 800, sans labels (mono "terminal" labels retired), wider container, `chamfer` utilities (the L-form's 45° corner), paper/cloud light fields, blue-surface contrast remapping, film grain removed. Buttons carry the chamfer and a sweep fill; inputs are square with ink borders.

**Shell** — header picks its tone from the surface beneath it; inline nav on wide screens plus a full-screen **site menu** (giant links, every service by family, contacts, local time; focus trap, Escape, focus return, scroll lock). New preloader (the L-form draws, nodes land, chamfered curtain lifts). Client navigations get a navy **L-curtain**. Footer continues the CTA's navy with the supporting line at giant scale.

**Signature effects** — `AssemblyScene` (new WebGL hero: instanced brand L-modules in ceramic and navy enamel plus blue diamond nodes, studio lighting, contact shadows, pointer-repulsion springs, scroll formations Problems → Systems → Progress); `LRise` (sections rise with the L-form as their top edge); stacked sticky chapters with dwell spacers; the **step-through** CTA (the L-module scales until the visitor passes into navy) on every page; the rising-staircase process; the interactive **system map** of real capability categories (layers, cross-cutting columns, 3D tilt, per-service focus); hover/focus row sweeps with service previews. All scroll choreography uses one JS-driven progress source (`useScrollProgress`).

**Pages** — Home (hero → manifesto → Ideas/Systems/Impact → service index → technology map → engagement → leadership + careers → step-through), Services, 13 service pages (family-coloured heroes: Engineering navy, Experience cloud, Growth blue), Solutions (stacked audience chapters with scale glyphs) and 4 solution pages, Work (honest "in preparation" state; no placeholder project tiles), Technology (map as hero), Products (two-engines composition), About (narrative chapters), Leadership + profiles, Careers + roles (application flow unchanged), Contact, Start a Project (forms unchanged), Privacy, Terms, 404, loading state.

**Removed** — 30 obsolete files (old particle/accent 3D scenes, card grids, ghost numbers, decode text, spotlight, marquee, mobile drawer).

## 6. Validation (local, 2026-10-23)

| Check | Result |
| --- | --- |
| Typecheck / lint / unit tests | pass / pass / 118 of 118 |
| Production build | pass, 44 pages |
| Routes rendered (desktop 1440×900) | 19 public routes + 404, 0 console errors, 0 horizontal overflow |
| Phone 390×844 and tablet 820×1180 | home + 8 key pages: 0 overflow, 0 errors; layouts re-checked after fixing grid placement |
| Contrast scan (22 pages) | 0 failures except the 8 px "Technologies" descriptor inside the logo lockup (logotype exemption; ≈6.9:1 on navy) |
| Keyboard | skip link first; visible focus on every stop; hidden hero phases inert; menu opens with Enter, traps Tab, closes with Escape and returns focus |
| Reduced motion | static composed hero (no pinning), all chapters readable |
| No WebGL | SVG fallback composition, 0 errors |
| Contact form | inline errors + focus to first invalid field; valid submission succeeds (local file store, test record removed) |
| Light share of home (same sampler) | 88 % light (live site 80 %) |
| Home JS transferred | 521 KB (live 532 KB) |
| SEO metadata | every page's `metadata` / `generateMetadata` identical to production |

## 7. Remaining gaps compared with the references

Honest assessment: the site now has a distinct, coherent, art-directed system and a genuine interactive 3D signature, and it is clearly stronger than production. It does **not** yet match Lusion's level of 3D production. Specifically:

- **3D craft**: Lusion uses bespoke modelled assets, post-processing (depth of field, bloom, chromatic effects) and multi-scene camera journeys (zoom into a device, tunnel fly-through). LAMHA has one procedural instanced sculpture without post-processing; other "3D" moments are CSS/SVG.
- **Cross-section transitions**: curtains, L-rises, stacking and the step-through are DOM transitions, not continuous WebGL scenes.
- **Assets**: no approved video/reel, no case studies, no vector logo master (BLOCKED, unchanged), and the service hover previews reuse the existing UI-style SVG illustrations. Commissioned imagery would raise the ceiling more than further code.
- **Type**: Montserrat (brand-mandated) is less distinctive than the references' custom/condensed faces.
- **Not verified**: real GPUs/phones (all measurements used software GL), Safari, a screen-reader walkthrough, Lusion's footer and menu.
