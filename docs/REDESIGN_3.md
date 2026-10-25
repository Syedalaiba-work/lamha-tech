# LAMHA Technologies — Redesign 3.0 "Systems in Motion"

Branch `redesign/immersive-3.0`, cut from `redesign/immersive-2.2` (`d4cce8c`), which contains 2.0 → 2.1 → 2.2. Production stays on `main` (`2a7a3f7`); the 2.0, 2.1 and 2.2 branches are untouched. Nothing in this document has been pushed or deployed.

This document is the working record for the whole-site overhaul: audit (§1), reference study (§2), creative direction and systems (§3–§5), route-by-route specification (§6), production pipeline (§7) and, at the end, validation and remaining limits.

---

## 1. Audit (2026-10-24, from the code, not from earlier screenshots)

### 1.1 Public routes (all verified in `src/app/(site)`)

| Route | Content source | 2.2 composition | Problems |
| --- | --- | --- | --- |
| `/` | `HomeJourney` (pinned WebGL: Problems → Ideas → Systems → Impact), `Manifesto`, `ServiceIndex`, `SystemMap`, `People`, `CTASection` | The strongest page: one continuous 3D journey | After the journey the page falls back to list sections; no media; footer is a plain block |
| `/services` | `data/services.ts` (13 services, 3 families) | Hero + small module stage, numbered index rows, process strip, LRise, CTA | Same skeleton as every inner page; the three families look identical |
| `/services/[slug]` × 13 | `ServiceDetail` + `ServiceVisual` (13 SVG visuals) | Long single template | Family identity only by accent colour; no demonstration beyond the SVG |
| `/solutions`, `/solutions/[slug]` × 4 | `data/solutions.ts` | PageHero + `AudienceGlyph` + lists | Problem → help → model story is told as stacked lists |
| `/products` | static copy (no approved products) | Hero + two-engines text + "will be published here" block | Honest but visually empty |
| `/technology` | `data/technology.ts` | Hero + categories + principles | Reads as a catalogue |
| `/work` | `data/projects.ts` (empty by design) | "First case studies are in preparation" | Nothing to look at; no experiments |
| `/about`, `/about/leadership`, `/about/leadership/[slug]` × 4 | `site.ts`, `leadership.ts` + owner CMS | Text-led sections, portraits | Corporate rhythm; portraits small |
| `/careers`, `/careers/[slug]` × 3 | `data/jobs.ts` (status `demo`, badged) + `ApplicationForm` (CV upload) | Blue hero, cards, list | Fine but generic |
| `/contact` | `ContactForm` | Hero + channels + form | OK, no atmosphere |
| `/start-a-project` | `ProjectForm` (multi-field, uploads) | Long form | Functional, no guidance rail |
| `/privacy`, `/terms` | static | PageHero + prose | Plain |
| 404 (`app/not-found.tsx`), `(site)/error.tsx`, `global-error.tsx` | — | Minimal | Generic |

Also served: `sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx`, `apple-icon.tsx`, JSON-LD (`lib/seo.ts`), `/media/[id]` (CMS media), `/api/{contact,projects,applications,health,cron/backup}`, the owner portal under `/admin` (auth, CMS, inquiries, applications, backups, audit). The portal is internal and keeps its own UI; it is out of the visual scope but must keep working.

### 1.2 Shared chrome and behaviour

- `Header`: transparent, tone from the surface beneath (`.dark-section`), hides on scroll down. Inline nav on XL, Start a Project, Menu.
- `SiteMenu`: full-screen navy dialog (focus trap, Escape, return focus); giant links + every service + contacts.
- `Footer`: server component, owner-editable content (`getContent`), giant supporting line, four nav columns.
- `Preloader`: full-screen navy intro for ~1.25 s on every hard load — **it covers real content**.
- `PageTransitions` + `template.tsx`: cover → navigate → reveal curtain; skips modified clicks, external links, reduced motion.
- `SmoothScroll` (Lenis, off for touch and reduced motion), `ScrollProgress`, `MotionConfig reducedMotion="user"`.
- 3D: `JourneyScene` (home), `ModuleStage`/`ModuleVisual` (inner heroes), `AssemblyScene` (fallback path), `SceneBoundary`, `ShaderWarmup`, quality tiers and `?perf` probe (2.2).
- No-JS / failure: initial HTML carries the content (2.2), noscript + 2.5 s CSS failsafe, `data-js-only` for pointer-only UI.
- Media: **none**. `public/` holds logos, favicons and four leadership photographs only. No video, no rendered imagery.
- Type: Montserrat 500–800 (display), Inter (body), JetBrains Mono (loaded, little used).

### 1.3 Integrations that must survive

Contact/project/application APIs with validation, rate limiting, email notification and file uploads (`lib/server/{uploads,storage,files,email,notify}`), owner CMS (`getContent`, team profiles, site settings), authentication/RBAC for `/admin`, analytics (`lib/analytics`, `TrackedLink`, `ViewTracker`), SEO metadata, canonical URLs and structured data, backups and cron.

---

## 2. Reference study

### 2.1 Lusion — lusion.co (inspected live on 2026-10-24, headless Edge on the machine's Intel Iris Xe GPU; home, /about, /projects, /projects/oryzo_ai, phone viewport)

- **Loading**: a black screen with a 3-digit counter (000 → 100) and a thin progress bar; on this connection the full load took **about 70 s** before anything else appeared. Impressive on fast networks, but the content is fully hidden until assets finish — the opposite of what LAMHA needs.
- **Scroll**: virtual (document height = viewport, `scrollY` stays 0); everything is driven by wheel/touch into a WebGL + DOM scene. Two fixed full-screen canvases.
- **Hero**: a large rounded "window" inset from the page edges containing the real-time 3D scene (glossy black/white/blue connector pieces), with `+` registration marks on a column grid and a centred "SCROLL TO EXPLORE".
- **Typography**: one family (Aeonik), **weight 400 everywhere**; display 144 px with −2.88 px tracking, 115 px section titles, 86 px uppercase for "Step" labels, 36 px intro, 22 px body, 14–18 px UI. Hierarchy comes from size and space, not weight. Headline lines are deliberately indented ("Bold Ideas," pushed right over "Brought to Life").
- **Colour**: pale lavender-white field (#F0F1FA family), near-black type, one saturated accent per moment (blue tube, cyan loop, red project tile).
- **Signature motion**: a thick 3D "tube" stroke that draws itself across sections as you scroll; play-reel block whose title splits around a play button ("PLAY ● REEL") over a full-width video; project media that scales from card to full bleed.
- **Work**: two-column grid of large rounded media cards, tag line in small caps (CONCEPT • WEB • DESIGN …), title 40 px with an arrow on hover.
- **Chrome**: logo left; two pills right ("LET'S TALK" dark, "MENU" light) plus a sound toggle.
- **Unverified** in this session: menu animation, page-to-page transition, hover states on cards (headless capture without real pointer timing), mobile scroll (virtual scroll ignored synthetic touch scrolling).

### 2.2 Wezero — wezerostudio.com

- **Status on 2026-10-24**: the domain does not resolve (NXDOMAIN, also on Google public DNS); no Wayback snapshot exists. The observations below come from the captures made in this project on **2026-10-23** (desktop 1440 × 900, phone 390 × 844, menu open, reduced motion), stored with the 2.1 review material.
- **Typography**: Anton (condensed, uppercase) for statements, a 345 px heavy lowercase wordmark across the hero, Space Grotesk for body, and a script face (Satisfy) for single accent words ("Matter", "Work") — contrast between three voices.
- **Structure**: full-viewport colour panels that **stack over each other** (blue "WEB DEV", green "DIGITAL STRAT"), each with a diamond line-drawing diagram; a manifesto set in large condensed caps on a full blue field; coordinates (Islamabad, 33.6692 N, 73.0774 E) in the header.
- **Motion**: colour wipes between panels, sticky stacking, no WebGL.
- **Footer**: diamond + circle emblem, contact list, "Got a project in mind?" CTA.

### 2.3 What actually creates the quality (and what LAMHA should not copy)

1. **Restraint in type**: one family at very large sizes and modest weights, deliberate line breaks and indents. Not more fonts or effects.
2. **Media that is the content**: Lusion's page is mostly rendered imagery and film; the DOM is a quiet frame around it. LAMHA had no media at all.
3. **A single object language** carried through every section (Lusion's connectors and tube).
4. **Section changes as events**: colour panels that stack (Wezero), media that scales to full bleed (Lusion).
5. **Not to copy**: hiding the site behind a 70 s loader; virtual scrolling that breaks native scroll, find-in-page and assistive tech; proprietary assets, the tube, the PLAY ● REEL split, Wezero's script accent and diamond emblem.

---

## 3. Creative direction — "Systems in Motion"

LAMHA turns problems into progress by giving them structure. The site makes that literal with one object language — the **L-module** and the **diamond node** from the brand device (used as sculpture, never as a rebuilt logo) — in three forms:

- **Film**: original looping films rendered in Blender/Cycles from code (`art/blender/lamha_films.py`): modules assembling into an interlocked system, a lattice re-sorting itself, an endless staircase, an exploded module, glass over form, an ensemble locking together.
- **Real-time 3D**: the home journey (scatter → clusters → lattice → staircase) and inner-page stages.
- **Drawing**: the L-aperture (an L-shaped mask that frames film and expands), L-corner registration marks on a visible engineering grid, and line diagrams for solutions and process.

Typography carries the argument: **"Problems" is set thin and loose; "Progress" is set heavy and tight** — the variable weight axis is the story of the company.

## 4. Systems

### 4.1 Type (brand guidelines 06: Inter family)

| Role | Face | Setting |
| --- | --- | --- |
| Display | Inter Tight, variable 100–900 | 500 by default at 4–15 vw, tracking −0.045 to −0.06 em, line-height 0.86–0.95; kinetic weight 200 ↔ 800 on narrative words |
| Headings | Inter Tight 600 | 1.4–4.5 rem |
| Body | Inter 400 (opsz) | 16–20 px, 1.55–1.65 line height, 60–68 ch |
| Labels | Inter 600 caps, +0.16 em | 11–12 px; indices "03 — Capabilities" |
| Technical | JetBrains Mono 500 | coordinates, film metadata, specs only |

### 4.2 Grid and frames
12 columns, gutter variable (`--gutter`), max 1560 px. Sections may carry **L-corner registration marks** at their corners and a visible hairline grid on dark "blueprint" surfaces.

### 4.3 Colour
Navy and neutral fields dominate (guidelines 05); brand blue is one moment per page (an accent panel or the Impact stage), never the default background.

### 4.4 Motion tokens
Durations 0.2 / 0.45 / 0.8 / 1.2 s; `expo-out (0.16, 1, 0.3, 1)` for entrances, `quart-in-out (0.76, 0, 0.24, 1)` for wipes. Line reveals rise from a mask with a 60–80 ms stagger. Scroll-linked effects scrub, never auto-play long sequences. Reduced motion: no scrubbing, no parallax, films show their poster with a play control, the WebGL journey is replaced by its static composition.

## 5. Site-wide experience

- **Loading**: no overlay. Content paints immediately (server HTML). A first-visit sequence animates the hero lines and header in CSS (visible without JavaScript); the 3D fades in when its shaders are compiled; a hairline at the top reports asset loading.
- **Header**: logo; studio coordinates and live Islamabad time (desktop); "Start a project" and "Menu" pills; hides on scroll down; tone follows the surface beneath.
- **Menu**: full-screen navy panel opened by an **L-wipe**; giant numbered links; hovering a link plays that section's film inside an L-aperture; services by family; contacts and time.
- **Page transitions**: an L-shaped navy wipe carrying the destination's name, then the reveal. Back/forward, modified clicks, external links and reduced motion behave natively.
- **Footer reveal**: the page lifts off a fixed footer on wide screens (normal flow on phones and reduced motion): a giant "Start a project" line, contacts, live time, navigation and legal.

## 6. Route-by-route specification

| Route | Hero | Sections (in order) | Signature interaction |
| --- | --- | --- | --- |
| `/` | Pinned WebGL journey; "Problems" (thin, loose) → "Progress." (heavy) | Reel in an L-aperture that expands to full bleed · manifesto with scroll-lit words · three capability panels that stack (film + service list each) · studio studies strip (labelled internal) · process (six steps building a module) · people · final CTA → footer reveal | Aperture expansion; stacking panels; kinetic weight |
| `/services` | "Thirteen services. Three families." with a triptych of family films in tall apertures | One full-height chapter per family: film behind a scrim, services as large rows with hover previews · process · CTA | Chapter colour change per family |
| `/services/[slug]` | Family-specific: **Engineering** = blueprint (navy grid, mono annotations, engineering film); **Experience** = glass over pale blue (experience film); **Growth** = staircase (blue accent band, growth film) | Overview · interactive `ServiceVisual` demonstration · capabilities as spec sheet / board / steps by family · process notes · deliverables · FAQ · related | Different layout grammar per family, not just colour |
| `/solutions` | "Every organisation has its own problem shape." | Four audiences as chapters, each with a scatter → structure diagram | Diagram assembles on scroll |
| `/solutions/[slug]` | Audience headline + glyph | Problems (scattered cards) → How we help (assembled) → engagement models → CTA | Chapter transition from scatter to grid |
| `/products` | Exploded-module film, dark | Two engines · how products are born (four stages) · publication status (honest) · CTA | Film-led |
| `/technology` | "Technology for the problem, not the trend." | Interactive system map · categories as a layered stack · principles · R&D film band | Hover tracing through the map |
| `/work` | "Work" with an honest status line | Client work status · **Studio studies**: six films presented editorially (technique, what it explores, which capability it relates to), each labelled "Internal study — not client work" | Full-width media with scroll scaling |
| `/about` | "We give problems structure." + ensemble film | Who we are (editorial) · mission & vision · principles · how we work · leadership portraits · two engines · at a glance · CTA | Portrait parallax |
| `/about/leadership`, `/[slug]` | Portrait-led editorial | Biography, roles, featured projects as published | — |
| `/careers` | "Build what comes next." + ensemble film | Why LAMHA · values · open positions (demo badge kept) · how we hire · CTA | — |
| `/careers/[slug]` | Role title | Responsibilities, requirements, benefits; sticky application panel with the existing form and CV upload | — |
| `/contact` | "Let's talk." with live time and channels | Channels · form (unchanged behaviour) | Form stays plain and obvious |
| `/start-a-project` | "Start a project." | Guidance rail (what happens next) + existing `ProjectForm` | — |
| `/privacy`, `/terms` | Editorial title | Long-form with sticky contents | — |
| 404 / error | Scattered modules, "A problem we haven't solved yet." | Links back | — |

## 7. Production pipeline

| Asset | Tool | Location |
| --- | --- | --- |
| Films (six loops) | Blender 5.2 + Cycles (OptiX, NVIDIA RTX A1000), generated by `art/blender/lamha_films.py` | Frames rendered locally (not committed) |
| Encoding | ffmpeg 7.1 (imageio-ffmpeg build, used locally only) via `art/encode_films.py`: H.264 MP4 (faststart), VP9 WebM, JPEG posters | `public/media/films/` |
| Real-time 3D | three r186 / R3F, procedural geometry (`brand-geometry.ts`) | `src/components/three/` |

---

## 8. What was built

| Area | Implementation |
| --- | --- |
| Type system | Display face changed from Montserrat to **Inter Tight, variable 100–900** (Inter family, as the guidelines allow). Weight now carries meaning: `Kinetic` drives the weight axis from scroll, `.weight-hover` lets rows gain weight when attended to, and the home hero is set as "Problems" thin and loose against "Progress." heavy and tight (a CSS animation of a registered `--wght` property, so it also runs without JavaScript). Mono (JetBrains) only for coordinates, film metadata and indices. |
| Studio films | Six original loops (`art/blender/lamha_films.py`, Blender 5.2 / Cycles on the RTX A1000; 1,250 frames, about 6 h of GPU time): *Systems in motion* (assembly), *Lattice sort* (an odd–even transposition network), *Glass over form*, *Endless stair*, *Exploded module*, *Ensemble*. Encoded by `art/encode_films.py` to H.264 + VP9 at full size and 480p, with JPEG posters (12 MB on disk in total; a page loads only the films it shows, when they near the viewport). `Film` keeps the poster without JavaScript or under reduced motion, plays only while visible, has a pause control, and uses the 480p encode wherever the frame is small. |
| L-aperture | Media seen through the brand's L-form (`LAperture`, `.l-aperture-inset`): CSS-variable clip-paths that open from an L to a rectangle to the full frame, driven by scroll. Used for the home reel, capability panels, page heroes, the menu preview and the "next chapter" cards. |
| Loading | The full-screen preloader is gone. Content paints from the server HTML at once; the header and hero lines run a short CSS intro; a 2 px hairline at the top reports asset and 3D readiness (`LoadHairline`, completes on `lamha:3d-ready`). |
| Menu | Opens with an L-wipe; giant numbered links; hovering or focusing a link plays that section's film in an L-aperture (mounted only while open); services by family, contacts, live time. Focus trap, Escape and focus return kept. |
| Page transitions | An L-shaped navy wipe grows from the bottom-left carrying the destination's name, then the curtain lifts. Back/forward, modified clicks, external links and reduced motion behave natively (verified: forward then back restores `/services` at the top; forward returns). |
| Header | Logo; studio coordinates (33.6844° N, 73.0479° E) and live Islamabad time; Start a project; Menu with an L glyph. Tone follows the surface beneath. |
| Footer | Revealed: on wide, tall screens it is pinned beneath the page and the page lifts off it; ordinary flow on phones and short windows. Owner-editable supporting line set light → heavy. |
| Home | Pinned 3D journey (new typography) → manifesto → **reel** (assembly film through an inset L that opens to full bleed; headline in the L's empty quadrant) → **capabilities** as three stacking worlds (film, colour and aperture per family) → **studio studies** (pinned horizontal track, labelled internal) → **process line** that draws itself → people → step-through CTA → footer reveal. |
| Services | Triptych of family films; one chapter per family with its own field; rows with the service illustration following the pointer. |
| Service detail (13) | Three grammars: **blueprint** (navy drawing grid, registration marks, capabilities as a datasheet), **glass** (pale-blue field, the interactive demonstration behind frosted glass, capabilities as type that gains weight), **staircase** (navy with a blue band, capabilities stepping upward). Each page: family film band, the service's own process notes on the process line, system map, and the next service with its film. |
| Solutions | Audience names weighted by organisation scale (startups light → enterprise heavy). Detail pages: **Problem → system** diagram — the audience's real problems arrive scattered and tilted, fall into line as you scroll, and connectors draw across to how LAMHA helps. |
| Work | Honest client-work status, then the six **studio studies** presented editorially (idea, technique, format, related capability), each labelled "Internal study — not client work". No invented clients, metrics or testimonials. |
| About, Technology, Products, Careers, Contact, Start a project, Leadership, 404 | Distinct heroes (ensemble film through an L; blueprint system map; dark R&D studio; the blue careers moment; navy contact with live time; kinetic invitations), principle rows that gain weight, the "next chapter" close on every page, glass-surface contrast tokens. Forms and their behaviour unchanged. |

## 9. Validation (local production build, 2026-10-25)

| Check | Result |
| --- | --- |
| Typecheck / lint / unit tests / build | pass / pass / 118 of 118 / pass |
| Initial HTML (17 routes) | every route: no hidden streamed segments, no skeleton, `h1` and full content in the server HTML. Multi-line headlines now carry spaces between lines (they read "technologycompany" to screen readers before the fix). |
| No JavaScript / scripts blocked | home and services fully readable without JavaScript; with all script chunks blocked the CSS failsafe reveals the page |
| Reduced motion | static hero and stacked chapters, no pinning; films show posters with a play control; the manifesto no longer dims words |
| No WebGL | SVG hero and chapters; films unaffected (video, not WebGL) |
| Desktop 1440 × 900, 16 routes | 0 console errors (one deliberate 404), 0 horizontal overflow |
| Phone 390 × 844, 8 routes | 0 console errors, 0 horizontal overflow |
| Keyboard | skip link first, logical order, visible focus ring on every stop; menu dialog semantics unchanged |
| Contrast scan, 15 routes | real failures found and fixed: totals in section indices (60 % opacity); brand blue and mid greys on the pale-blue field (now `surface-glass` tokens). Remaining flags are scanner artefacts (it composites the header's translucent dark background over white). |
| Contact form | inline errors, focus to the first invalid field, valid submission succeeds (test record deleted) |
| Page weight after load (desktop) | home 1.44 MB, services 1.62 MB, about 1.10 MB, work 1.10 MB, contact 1.46 MB; phone: home 1.26 MB, about 0.74 MB |
| LCP (local) | 0.21–0.34 s |
| 3D on Intel Iris Xe (headless Edge, ANGLE D3D11) | journey 121 fps in all four phases (median 8.3 ms, 95th percentile 8.7 ms); cold-load shader linking 1.2 s → 0.5 s with the 2.2 warm-up |
| Film integrity | every frame of every film scanned for frame-to-frame spikes; motion-blur artefacts at rotation wrap points found, fixed in the script and re-rendered |

## 10. Remaining limitations

- **Not tested on real devices**: no iPhone, Android phone, Safari/WebKit, Firefox or screen reader was run. Phone results are Chromium device emulation on a laptop; GPU figures are this laptop's Intel Iris Xe in headless Edge (the discrete RTX A1000 was used only to render films).
- **Wezero could not be re-inspected**: the domain no longer resolves; its analysis relies on captures from 2026-10-23.
- **Lusion details unverified**: menu and page-transition animations, card hover states and phone scrolling (its virtual scroll ignores synthetic touch scrolling).
- **No client case studies**: Work shows the studio's own studies, clearly labelled. Real projects need client approval and material.
- **No commissioned footage or photography**: films are procedural renders of the brand modules. Team photography beyond the four leadership portraits, real product screens and a people/office film would lift About, Careers and Work further.
- **Films are fixed renders**: changing one means re-rendering in Blender (about 8–16 s per frame on this GPU); scripts and parameters are committed for that.
- **Footer reveal** is limited to wide screens taller than 780 px by design (the footer has to fit one viewport to be revealed cleanly).
- **PMREM shader compile** (about 0.4 s on the Iris Xe) remains on the first home visit.

## 11. Final pre-release review (2026-10-25)

Scope: the exact branch head, clean `.next`, local production build (`next start`), no database configured.

**Git**: linear history `main` 2a7a3f7 → 2.0 356c287 → 2.1 6998fe1 → 2.2 d4cce8c → 3.0. The remote has only `main` (still 2a7a3f7); no redesign branch was pushed. Outside the site UI, the only dependency change since `main` is `postprocessing@6.39.5` (exact pin, added in 2.1). Unchanged since `main`: `prisma/` (no new migrations), `src/app/api`, `src/app/admin`, `src/lib` (auth, RBAC, storage, email, analytics), `proxy.ts`, `next.config.ts` (CSP), `vercel.json`, sitemap/robots/manifest/OG image. Form components changed only in styling.

**Defects found and fixed in this review**

| Defect | Fix |
| --- | --- |
| *Systems in motion* (home reel, menu, Contact, Work) jumped at its 10-second loop point: the scatter tumble added half a turn per loop, so the last frame did not match the first (seam difference 12.4 against a typical frame step of 2.6). The same latent bug existed in *Ensemble* (hidden there because its modules are off-screen at the seam). | `drift()` now uses whole turns per loop; both films re-rendered and re-encoded; seams re-measured. |
| Services, Work, About and Leadership heroes are light but used the breadcrumb's on-navy tone: the current-page label measured 1.3:1. | `tone="light"` on those four breadcrumbs (no breadcrumb is left on the default tone). |
| Keyboard focus could land on the reel's "All studio studies" link while its caption bar was still transparent. | The caption shows whenever it contains focus. |

**Verified at the reviewed head**: lint, typecheck, 118/118 tests, clean build (44 pages); crawl of 161 internal URLs (50 HTML pages, every link and asset referenced in server HTML, all 30 film files): all 200, no redirects; browser sweep of 39 routes on desktop and 33 on phone emulation: one `h1` each, no console errors, no failed requests, no horizontal overflow, every film decodes; the browser made no request to any third-party host; initial HTML on 17 routes; no-JavaScript, blocked-scripts, reduced-motion and no-WebGL states; menu keyboard semantics (open, focus in, 40-Tab trap, Escape, focus return, scroll lock); contact, project and application forms (validation, focus, no request on invalid submit; one valid contact submission to local file storage, deleted afterwards); contrast on 17 routes; CSP allows the self-hosted films; byte-range requests return 206; no secrets in the diff.
