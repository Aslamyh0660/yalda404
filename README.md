# Sharea · شارع — verified-location landing page

One Arabic, right-to-left, mobile-first page that tells a visitor standing at a
hotel reception desk in Qom that **the place where they found the Sharea QR code
is approved by Sharea** — and sends them into the Telegram bot.

Built with **Vite + React 19 + Tailwind CSS v4 + [shadcn M3E](https://shadcn-m3e.crystaworld.dev)**
(Material 3 Expressive), in a flat navy-and-gold palette with no decorative
animation. No venue data, no routes, no per-venue pages: **one URL for every
approved location**.

| | |
| --- | --- |
| Live site | **not published yet** — the deployment target is <https://aslamyh0660.github.io/sharesa-verify/>; see [Build, deploy, redeploy](#build-deploy-redeploy) |
| Telegram bot | [@Sharea_qombot](https://t.me/Sharea_qombot) — the handle has a **q**, never a g |
| WhatsApp group | **not configured yet** — see [Change the links](#change-the-links) |
| Like backend | Cloudflare Worker + D1, see [Configure the like backend](#configure-the-like-backend) |

---

## Contents

- [What this is](#what-this-is)
- [One universal QR code](#one-universal-qr-code)
- [Quick start](#quick-start)
- [Project layout](#project-layout)
- [Change the links](#change-the-links)
- [Edit the Arabic content](#edit-the-arabic-content)
- [Replace the portrait](#replace-the-portrait)
- [Change the theme colours](#change-the-theme-colours)
- [Add Material icons](#add-material-icons)
- [Configure the like backend](#configure-the-like-backend)
- [Regenerate the QR code](#regenerate-the-qr-code)
- [Build, deploy, redeploy](#build-deploy-redeploy)
- [Quality checks](#quality-checks)
- [Design system notes](#design-system-notes)
- [Licences and credits](#licences-and-credits)

---

## What this is

Printed Sharea stands sit at the reception desks of approved hotels and
businesses. Each stand carries the same QR code. Scanning it opens this page,
which says three things, in this order:

1. the place you are standing in is approved by Sharea;
2. what Sharea's services are;
3. how to open the bot.

The page never claims more than that. A single universal QR code is **not**
tamper-proof proof of a specific venue's identity, so the page does not
pretend otherwise, and it invents no verification IDs, approval dates, prices or
guarantees. See `docs/copy-review.md`.

The seven services, in Arabic: خدمات الطلاب · الهدايا والتذكارات · خدمات السيارات ·
الصرافة · السياحة العلاجية · الخدمات داخل المدينة · الدعم المباشر.

## One universal QR code

```
assets/qr/sharea-qr-brand.svg   navy modules, light-gold field, bot portrait in the centre, ECC H
assets/qr/sharea-qr-brand.png   1568 px, 32 px per module — print this one
assets/qr/sharea-qr-plain.svg   black on white, no logo, ECC M — the fallback
assets/qr/sharea-qr-plain.png   1312 px, 32 px per module
```

Both encode exactly `SITE_URL` from `src/lib/site.config.ts`, both keep the
standard four-module quiet zone, and both are verified by decoding the images
back at several sizes:

```bash
npm run verify:qr
# → PASS sharea-qr-brand.png (1568px, native) → https://…/sharesa-verify/
#   … 16 checks, PNG and rendered SVG, down to 160 px
```

The centre mark is 16 % of the width while error-correction level H recovers
30 % — deliberately conservative. The plain variant exists for difficult
printing (fax-quality scans, low-quality offset, or a venue that will not accept
a stylised code): use it whenever the branded one is not scanned reliably.

Because the payload is only a URL, the code carries no information about the
venue, and printing a new batch means changing one URL in one place.

## Quick start

Requirements: Node 20+ (developed on Node 22), npm.

```bash
npm install

# fonts and generated assets are committed, but you can rebuild them:
npm run fonts        # self-hosts the WOFF2 into public/fonts/
npm run assets       # fonts + icon/app icons + OG image + QR code

npm run dev          # http://localhost:5173
npm run build        # typecheck + production build into dist/
npm run preview      # serve the build, bound to 0.0.0.0
npm run check        # icons, typecheck (app + worker), build, markup audit
```

There are no environment variables to set for the page itself to run. The like
backend is optional and off by default.

## Project layout

```
src/
  App.tsx                    the page: top bar → hero → how-to → ribbon → services → trust → likes → CTA → footer
  main.tsx                   providers (M3eProvider + Toaster) and mount
  entry-server.tsx           renders the page to HTML for the markup checks
  index.css                  Tailwind, M3E tokens, fonts, the page's own utilities
  lib/
    site.config.ts           every external link + feature flags  ← edit links here
    content.ts               every Arabic string                   ← edit copy here
    theme.ts                 M3E theme (brand scheme, asset paths)
    likes.ts                 like counter client (honest failure states)
    m3e/                     the shadcn M3E layer + the generated Sharea scheme
  components/
    brand.tsx                portrait ring, logo lockup, approval badge, gold rule
    Reveal.tsx               the one scroll-in effect
    m3e/                     the shadcn M3E components this page uses (yours to edit)
    site/                    the page's sections
workers/likes/               Cloudflare Worker + D1 migrations + integration tests
assets/
  brand/                     SVG masters (logo, badge, app icon, OG card) + colours.json
  qr/                        the universal QR code, styled + plain, SVG + PNG
public/                      favicon, app icons, og.png, fonts, manifest, robots, sitemap
docs/                        colour mapping, design notes, copy review
scripts/                     asset, colour, icon, QR and QA tooling
```

## Change the links

Everything external is in **`src/lib/site.config.ts`**:

```ts
export const TELEGRAM_URL = "https://t.me/Sharea_qombot"
export const TELEGRAM_HANDLE = "@Sharea_qombot"
export const WHATSAPP_GROUP_URL = ""            // ← paste the invite link here
export const SITE_URL = "https://aslamyh0660.github.io/sharesa-verify/"
export const LIKES_API_BASE = …                 // from VITE_LIKES_API_BASE
```

While `WHATSAPP_GROUP_URL` is empty the page renders a **disabled** WhatsApp
button labelled «قيد التفعيل» with the note «رابط مجموعة الواتساب قيد الإعداد» —
never a button that looks live but leads nowhere. Fill it in and it becomes a
real tonal button (and the sticky bar swaps its disabled icon for a link) on the
next build.

Changing `SITE_URL` also means regenerating the QR code and the metadata:

```bash
# index.html: canonical, og:url, JSON-LD · public/robots.txt · public/sitemap.xml
npm run qr && npm run verify:qr
```

## Edit the Arabic content

All of it lives in **`src/lib/content.ts`** — hero, how-to, the services ribbon
and cards, the trust values, the like card, the calls to action, the footer and
the metadata. Nothing is scattered through components.

House rules for changes (the audit script enforces the mechanical ones):

- Modern Standard Arabic, warm and plain, aimed at visitors from Iraq, the Gulf
  and the Levant.
- Arabic letters only: Arabic kaf **U+0643** and Arabic yeh **U+064A**, never
  the Persian keheh U+06A9 or farsi yeh U+06CC, and none of U+067E, U+0686,
  U+0698 or U+06AF. `npm run check:markup` fails if any of them appears anywhere
  in the repository, including in this sentence.
- Arabic punctuation: ، ؛ ؟ · guillemets «…» for emphasis.
- No invented claims: no verification codes, no approval dates, no prices, no
  "secure/guaranteed" statements about a venue.
- Keep every service name and trust word intact — the audit checks them
  verbatim, and the ribbon and cards share the icons in `content.ts`.

New icons used in content are picked up automatically by `npm run gen:icons`.

## Replace the portrait

`public/brand/profile.png` is the official Sharea bot profile picture slot, and
**the file in this repository is a placeholder** (a flat navy disc with the
Material robot glyph — no invented face). It feeds the lockup, the favicon, the
app icons, the OG card and the QR centre mark.

1. Save the official portrait over `public/brand/profile.png` — square,
   ≥ 512 × 512, PNG.
2. Rebuild the derived assets:

   ```bash
   npm run assets        # icons + apple-touch-icon + og.png + QR code
   npm run verify:qr
   ```

The portrait is never redrawn, retouched or replaced, and it is rendered
untouched inside the flat light-gold ring (`src/components/brand.tsx`).

## Change the theme colours

The colours are **generated, not hand-picked**, by Google's
`material-color-utilities` — the same library shadcn M3E uses.

1. Edit the brand tokens at the top of `scripts/color-report.ts`:

   ```ts
   const BRAND = {
     navy: "#0F2A4A", navySecondary: "#16375F", navyDeep: "#0A1C33",
     gold: "#D4A24C", goldLight: "#F3D48A", goldDeep: "#A87824",
     cream: "#F5EEDC",
   }
   ```

2. Choose the tonal palettes' hues and chromas (also in that file). The current
   values are documented in `docs/color-mapping.md`: the navy palette at hue
   259.1 / chroma 24 and the gold at hue 89.3 / chroma 33 (light gold lives at
   tone 87).
3. Regenerate:

   ```bash
   npm run colors:report     # → src/lib/m3e/sharea-scheme.ts, docs/color-mapping.md
   npm run assets            # QR + icons use the same colours
   npm run build && npm run check:markup
   ```

`docs/color-mapping.md` is rewritten with the full palette table, the role →
tone → hex mapping for both schemes, and the WCAG contrast table for every pair
the page renders. The page ships the **dark** scheme; a light scheme is
generated and contrast-checked alongside it but is not exposed in the UI.

To change only the *shape* or *motion* feel, edit `M3E_THEME` in
`src/lib/theme.ts` — `shapeScale` multiplies every corner radius (`1` is M3,
`0.35` is nearly square) and `motion` switches to M3E's standard spring set.

## Add Material icons

Icons are **bundled glyphs**, never an icon font and never a runtime fetch.

```tsx
import { Icon } from "@/components/m3e/icon"
<Icon name="verified" size={22} />        // outlined (default)
<Icon name="favorite" fill="auto" />      // outlined → filled while selected
<Icon name="favorite" fill size={24} />   // always filled
```

1. Use the icon in your JSX (Material's ligature spelling, `directions_car`).
2. Run `npm run gen:icons` — it scans the app's own files and writes only the
   glyphs that are used into `src/components/m3e/icon-data.app.ts`.
3. `npm run check:icons` verifies in CI that the bundled data is up to date.

The script reads glyphs from the `@iconify-json/material-symbols` package
instead of the Iconify API, so icon generation works offline and reproducibly;
the data is identical. Icons used *inside* the M3E components themselves live in
`icon-data.ts` and ship with the registry.

## Configure the like backend

The counter is real and public. It is a Cloudflare Worker with a D1 database, so
the page never has write credentials; it only knows a public URL.

```bash
cd workers/likes
npx wrangler login
npx wrangler d1 create sharea_likes          # copy the database_id into wrangler.toml
npm run likes:migrate -- --remote            # applies migrations/0001_likes.sql
npm run likes:deploy

# local development and tests
npm run likes:migrate                        # local D1
npm run likes:dev                            # http://127.0.0.1:8787
npm run test:likes                           # 13 integration tests
```

Then point the page at it (see `.env.example`):

```
VITE_LIKES_API_BASE=https://sharea-likes.<your-subdomain>.workers.dev
```

Set the same variable in the deploy environment (for GitHub Pages, a repository
variable/secret consumed by the workflow) and rebuild.

How it behaves:

| Situation | What the visitor sees |
| --- | --- |
| `VITE_LIKES_API_BASE` empty | "الإعجابات غير متاحة الآن" — no number is invented |
| request fails / offline | the same honest unavailable message |
| press the heart | the count comes back from the server |

Rules the implementation keeps: `localStorage` only *discourages* a second like
(the same browser id is a no-op server-side, and the Worker rate-limits each IP),
the API exposes only `GET /count` and `POST /like`, no secrets reach the
frontend, and nothing anywhere claims "one person, one like".

`workers/likes/test.mjs` proves the behaviour against a running Worker: count
endpoint, CORS for the page origin, one-like-per-browser, malformed ids refused,
per-IP rate limiting (429), unknown routes 404.

## Regenerate the QR code

```bash
npm run qr            # encodes SITE_URL
QR_URL=https://example.com/ npm run qr   # or any other URL
npm run verify:qr     # decodes the files back and compares
```

Commit the regenerated files in `assets/qr/`. Keep 32 px per module (or more)
for print, keep the quiet zone, and remember there is exactly **one** code for
every location.

## Build, deploy, redeploy

The site is a static build — any static host works. `vite.config.ts` reads
`BASE_PATH` so the same build serves a domain root or a project subpath.

**GitHub Pages (how this repository is deployed)** — `.github/workflows/deploy-pages.yml`
builds on every push to `main` with `BASE_PATH=/<repo>/` and publishes `dist/`
to Pages. Enable it once in *Settings → Pages → Source: GitHub Actions*.

**Cloudflare Pages / Netlify / Vercel** — connect the repository and use:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 20 or 22 |
| Environment | `BASE_PATH=/` (or leave unset), `VITE_LIKES_API_BASE=…` if the counter is live |

Migrations for the Worker are separate from the site deploy:

```bash
npm run likes:migrate -- --remote && npm run likes:deploy
```

## Quality checks

```bash
npm run check          # icons + typechecks + build + the markup audit
npm run check:markup   # 60+ assertions on the rendered page
npm run check:icons    # bundled icon data is current
npm run verify:qr      # the QR codes decode to the right URL
npm run test:likes     # like backend integration tests
```

`npm run check:markup` renders the real component tree to HTML in Node and then
audits it: one `<h1>`, heading order, landmarks, every control's accessible name,
`aria-pressed` on the like toggle, `aria-live` on the counter, images with `alt`,
nothing hidden behind an animation, 44 px+ touch targets, the exact Telegram
link and no misspelling of the handle, the WhatsApp button's disabled state, no
per-venue parameters, no placeholder text, no Persian-only letters in the Arabic
copy, the brand hexes present in the built CSS, and no colour gradients, glows or
blur in this project's own styles.

**What still needs a browser.** This repository was developed in a sandbox with
no browser available, so the following were **not** measured here and are left to
a machine that has one:

```bash
npm run build && npm run preview
npx lighthouse http://localhost:4173/ --preset=desktop --view
npx lighthouse http://localhost:4173/ --form-factor=mobile --screenEmulation.mobile --view
```

Check at 360 / 390 / 414 / 768 / 1440 px for horizontal overflow, the sticky
bar not covering content, and safe-area insets on a notched phone; and walk the
page with a keyboard (Tab / Enter / Space) and with
`prefers-reduced-motion: reduce`. The markup audit covers the machine-checkable
half of those; the visual half needs a real renderer.

## Design system notes

- **shadcn M3E**, the library this page is built on, distributes components as a
  shadcn registry. This environment cannot reach
  `shadcn-m3e.crystaworld.dev`, so the source was vendored from the upstream
  repository at `github.com/Crysta1221/shadcn-m3e` with
  `node scripts/vendor-m3e.mjs <checkout> --write`, which copies each component
  **and everything it imports** into `src/components/m3e` and `src/lib/m3e` —
  the same files `npx shadcn@latest add @m3e/<name>` would write.
  `components.json` already registers the `@m3e` namespace, so future components
  can be added with the CLI as usual.
- Components used: `app-bar` (top bar) · `button` (+ `ripple`) · `card` · `chip`
  (the «معتمد من شارع» chip) · `separator` · `toast` (snackbar) · `toggle` (the
  like button) · `toolbar` (the sticky bottom bar) · `icon` (bundled Material
  Symbols Rounded) · the theme providers. No `node-vibrant`, no image theming.
- Ships the M3E token layer unchanged (`lib/m3e/m3e.css`): colour roles, the
  M3 Expressive type scale, the corner scale, elevation and the spring motion
  scheme. Page-level additions are three utilities in `src/index.css`
  (`ribbon`, `reveal-in`, safe-area padding).
- Two documented local changes to registry files: `color.ts` defers
  material-color-utilities to an `import()` (so ~20 kB gzip of colour maths
  never reaches a visitor — the Sharea scheme is static), and `app-bar.tsx` takes
  a `titleAs` prop so the branding lockup is not a second `<h1>`.
- Motion: M3E ripple and press shape-morph, one slow services ribbon (pauses on
  hover/touch, static under `prefers-reduced-motion`, duplicated list
  `aria-hidden`), one fade/slide-in on first view, and the M3 icon-fill on the
  like button. No splash, parallax, particles, glows or scroll effects.
- Typography: Noto Kufi Arabic (headings, slogan), IBM Plex Sans Arabic (body,
  UI), Cormorant Garamond (the SHAREA wordmark only) — all OFL, self-hosted
  WOFF2 with per-subset `unicode-range`, `font-display: swap`, and the two
  first-screen files preloaded.

More detail: `docs/design.md`, `docs/color-mapping.md`, `docs/copy-review.md`.

## Licences and credits

- This project's own code: MIT (see `LICENSE`).
- shadcn M3E — MIT, © Crysta1221. The vendored components keep their headers;
  see `NOTICE`.
- Material Symbols Rounded — Apache-2.0 (Google).
- Fonts: IBM Plex Sans Arabic, Noto Kufi Arabic, Cormorant Garamond — SIL Open
  Font License 1.1.
- Colour maths: material-color-utilities — Apache-2.0 (Google).
