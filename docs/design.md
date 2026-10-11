# Sharea — design notes

A flat, minimal, quiet-luxury page in Material 3 Expressive: navy surfaces,
light-gold accents, generous space, almost no animation. This file records the
decisions behind it so they can be changed deliberately.

## 1. Luxury navy-and-gold research, and what was chosen

Reputable references for luxury hospitality and premium brand palettes converge
on the same construction: a midnight navy field, a champagne/antique gold accent
(never a bright web gold), and an ivory or cream text colour rather than pure
white.

| Source | Palette it proposes | What was taken |
| --- | --- | --- |
| [Luxury Color Palette Guide](https://zoviz.com/blog/luxury-brand-colors-meanings) | Midnight Navy `#0F172A` (heritage, trust) · Ivory Cream `#F4EADE` · Brut Champagne `#EBDAB0` (hospitality warmth) | navy field, cream text, champagne-not-yellow gold; and its rule that "web gold" `#FFD700` reads neon and cheap |
| [25 luxury combinations](https://www.blendnow.com/blog/luxury-color-palette-25-elegant-color-combinations) — "Sapphire Lounge" | Midnight Navy `#102542` · Sapphire `#1E3A5F` · Champagne `#D8C3A5` · Ivory `#FAF8F5` · Brass `#C79C5A`, "for luxury hotels" | the closest published match to our brand tokens, and confirmation that the navy→sapphire→champagne→cream ladder is the hospitality convention |
| [Luxury palettes for branding & UI](https://designrockdh.com/luxury-color-palettes-branding-ui-ux/) — "Midnight Navy & Platinum" | Navy `#0A192F` background · Slate Navy `#112240` elevated surfaces · Champagne accent `#D4AF37` | the *surface ladder* idea (page → card → raised card in navy steps) and the note that flat gold accents beat gradients on screens |
| [Gold/navy palettes](https://filmora.wondershare.com/video-creative-tips/gold-navy-blue-color-palette.html) | "Champagne Harbor Night" `#041427` `#0f2747` `#c8a663` `#f9e4c8`; "Midnight Gala Luxe" `#0b1a33` `#12264f` `#d4af37` `#f4f1e8` | our deep navy `#0A1C33` sits exactly between these two families, and the gold range `#c8a663`–`#f3d48a` matches the brief's "very light, soft gold" |

**Final choice.** The brief's own tokens were kept, because they already sit in
the champagne-navy family these sources describe:

| Brand token | Hex | Role in the design |
| --- | --- | --- |
| primary royal/midnight navy | `#0F2A4A` | primary palette source (HCT hue 259.1) |
| secondary navy | `#16375F` | secondary palette + the neutral palette's hue |
| deep background navy | `#0A1C33` | the page background (reproduced exactly at neutral tone 10) |
| main gold | `#D4A24C` | "brass" accent, used as `tertiary-dim` (pressed state) |
| light gold (signature) | `#F3D48A` | the accent colour: buttons, icons, the approval badge (`tertiary`, tone 87) |
| deep gold | `#A87824` | not used as a role; the tonal family's dark end |
| warm off-white | `#F5EEDC` | `on-surface` text, instead of pure white |

The gold is deliberately *light* and slightly desaturated (HCT chroma 33, hue
89.3). Raw `#D4A24C` at text sizes on navy falls short of WCAG AA; tone 87 of the
same hue (`#f8d786`) passes at 12.3:1 and reads as champagne rather than as
yellow. Details and the full contrast table: `docs/color-mapping.md`.

## 2. Material 3 mapping

Google's `material-color-utilities` (the library shadcn M3E uses) derives every
role from five tonal palettes, rather than from hand-picked hexes:

| Palette | Hue | Chroma | Why |
| --- | --- | --- | --- |
| primary | 259.1 (brand navy) | 24 | keeps the navy recognisably navy in both schemes |
| secondary | 259.5 | 26 | the secondary navy, landing on `#334866` at `secondary-container` |
| tertiary | 89.3 (brand light gold) | 33 | light gold: tone 87 = `#f8d786`, within 7 Δ of `#F3D48A`, AA on navy |
| neutral | 259.5 | 22 | **tone 10 reproduces `#0A1C33` exactly** (Δ 0.0), so the background *is* the brand navy |
| neutral-variant | 259.5 | 16 | desaturated blue-gray for `on-surface-variant` `#bcc7dc` and outlines |
| error | 25 | 84 | M3's error red, unchanged |

Two roles carry a deliberate brand choice on top of the generated scheme:

- `on-surface` / `on-background` = `#F5EEDC` (the brand cream; M3 would pick the
  neutral palette's tone 90, which is a cool gray).
- `on-tertiary` = `#0A1C33` (brand navy on gold; M3 would use gold tone 20),
  verified at 12.3:1.

Everything else comes straight from the M3 tone mapping, which is what makes the
result feel like a Google product rather than a themed website.

## 3. shadcn M3E: what is used, and how it is wired

Source: <https://shadcn-m3e.crystaworld.dev> (studied page by page: installation,
usage, icons, theming, colour, motion, and each component used). Components come
from the `@m3e` registry as source; `components.json` registers the namespace.

| Item | Used for |
| --- | --- |
| `styles` (`lib/m3e/m3e.css`) | every token: colour roles, M3E type scale, corner scale, elevation, springs, state layers |
| `cn` | the M3E-aware `cn()` (knows `text-label-large` is a size, not a colour) |
| `theme` (`M3eProvider`) | colour mode + the generated scheme; a third variant, `sharea`, serves the static brand scheme |
| `icon` | `<Icon name="…">` over bundled Material Symbols Rounded glyphs |
| `app-bar` | the top bar (small, `scrolled` swaps to surface-container + elevation 2) |
| `button` | filled gold CTAs, tonal buttons, text buttons, icon buttons |
| `chip` | the «معتمد من شارع» assist chip (flat, outlined, 32 dp) |
| `card` | the how-to card and the seven service cards (outlined on surface-container-low) |
| `separator` | dividers inside the how-to list |
| `toast` | the snackbar for "link copied" / "thanks" |
| `toggle` | the like button (M3E shape morph: square at rest, round when selected) |
| `toolbar` (docked) | the sticky mobile action bar |
| `ripple` | comes with the buttons and the toggle; the only press animation |

Deliberately **not** used: `use-image-theme` and `node-vibrant` (the theme is
fixed and seed-based), the full registry, and any component the page does not
render.

Two local changes to registry files, both documented in the files themselves:

1. `lib/m3e/color.ts` — dynamic schemes moved to `color-dynamic.ts`, loaded with
   `import()`. The Sharea scheme is static, so material-color-utilities (~20 kB
   gzip) never ships in the initial bundle.
2. `components/m3e/app-bar.tsx` — a `titleAs` prop, because M3E renders the app
   bar title as `<h1>` and this page's real heading is the approval statement.

## 4. Typography

| Face | Where | Weights | Why |
| --- | --- | --- | --- |
| Noto Kufi Arabic | headings, slogan, service titles | 500, 600 | geometric, engineering-grade Kufi: reads as "system UI", pairs with M3 |
| IBM Plex Sans Arabic | body, UI, buttons, labels | 400, 500, 600 | excellent Arabic legibility at small sizes on phones |
| Cormorant Garamond | the SHAREA wordmark only | 600 | quiet-luxury Latin serif for the brand name; never used for Arabic |

Mapped onto the M3 type scale: the hero headline is `headline-medium` (mobile) →
`headline-large`; the statement is `headline-medium`; body copy is
`body-medium` / `body-large`; labels are `label-large` and `body-small`. Arabic
line height is raised to 1.75 in `src/index.css` because Arabic needs more
leading than Latin at the same size.

Self-hosted WOFF2 only, one unicode-range per subset, `font-display: swap`, and
the two first-screen files preloaded. Subsetting is by *subset* (Arabic / Latin),
never by glyph: Arabic shaping tables (initial/medial/final forms, lam-alef
ligatures, marks) stay intact.

## 5. Motion

Allowed and used: M3E ripple and press shape-morph; a 52-second services ribbon
that pauses on hover/touch and stands still under `prefers-reduced-motion`; a
single 500 ms fade/slide-in per section, which is only added *after* JavaScript
decides the section is below the fold, so content never waits for it and never
disappears without it; and the M3 icon-fill transition on the like button.

Not used: splash sequences, parallax, scroll-driven drawing or hijacking,
particles, light sweeps, glows, shimmer, seal animations, and any animation
library.

## 6. Layout

Mobile first: one column, 20 px gutters, 48 px minimum targets, a docked bottom
toolbar for the thumb zone with `env(safe-area-inset-bottom)` breathing room
(`body` keeps the same space free so the bar never covers content), and a
`scroll-padding-bottom` so a focused control never hides behind it. From `md` up
the sticky bar disappears and the layout opens to a centred column (max 3–5
`ch`-scaled widths) with a three-column service grid. Sections are separated by
space, thin outlines and one gold rule — no ornament, no patterned background,
no imagery beyond the portrait.

## 7. Never claimed

The page invents no verification codes, approval dates, venue records, prices,
discounts or security guarantees, and it does not imply that a universal QR code
proves a venue's identity. Three sentences in the how-to card state plainly what
the code does and does not mean; `docs/copy-review.md` records the wording.
