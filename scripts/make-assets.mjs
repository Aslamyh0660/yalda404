// node scripts/make-assets.mjs   (npm run assets)
//
// Builds every brand asset from one source of truth:
//
//   assets/brand/*.svg     SVG masters (what you edit / hand to a printer)
//   public/favicon.svg     the favicon browsers get
//   public/icons/*.png     192 / 512 / maskable app icons, apple-touch-icon
//   public/og.png          1200 × 630 Open Graph image
//   public/brand/profile.png  the bot portrait (see below)
//
// Style rules, straight from the brief: flat colours only, Material Symbols
// glyphs, M3 corner radii, generous space, no gradients, no glow, no ornament.
//
// The portrait: put the official Sharea bot profile picture at
// public/brand/profile.png (square, ≥ 512 × 512) and run this script again —
// the lockup, favicon, app icons and the OG image all pick it up. When that
// file is missing, the script writes a clearly-marked placeholder so the build
// never breaks.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { Resvg } from "@resvg/resvg-js"

const root = resolve(import.meta.dirname, "..")
const colors = JSON.parse(readFileSync(join(root, "assets/brand/colors.json"), "utf8"))
const scheme = colors.scheme.dark

// the fonts the assets are set in — the same self-hosted WOFF2 the site uses
const FONTS = [
  "public/fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2",
  "public/fonts/ibm-plex-sans-arabic-arabic-600-normal.woff2",
  "public/fonts/ibm-plex-sans-arabic-latin-400-normal.woff2",
  "public/fonts/noto-kufi-arabic-arabic-500-normal.woff2",
  "public/fonts/noto-kufi-arabic-arabic-600-normal.woff2",
  "public/fonts/cormorant-garamond-latin-600-normal.woff2",
].map((p) => join(root, p))

/* ---------- the Material Symbols glyphs, inlined ---------- */
const collection = JSON.parse(
  readFileSync(
    join(root, "node_modules/@iconify-json/material-symbols/icons.json"),
    "utf8"
  )
)
/** a glyph body, scaled from the 24 × 24 Material grid into a box */
function glyph(name, { size, x, y, fill }) {
  const body =
    collection.icons?.[name]?.body ??
    collection.icons[collection.aliases?.[name]?.parent]?.body
  if (!body) throw new Error(`no glyph ${name}`)
  const inner = body.replace(/^<path\b[^>]*\bd="([^"]+)"\s*\/?>$/, "$1")
  return `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="${fill}">
    <path d="${inner}" fill="currentColor"/>
  </g>`
}

/* ---------- the portrait ---------- */
const PROFILE = join(root, "public/brand/profile.png")
const PLACEHOLDER = join(root, "assets/brand/profile-placeholder.svg")

function writePlaceholder() {
  mkdirSync(join(root, "public/brand"), { recursive: true })
  // an intentional stand-in: a flat navy disc with the Material "smart_toy"
  // glyph in gold. No invented face, no stock photo.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${scheme["surface-container"]}"/>
  ${glyph("smart-toy-rounded", { size: 216, x: 148, y: 148, fill: colors.goldLight })}
</svg>`
  writeFileSync(PLACEHOLDER, svg)
  const png = raster(svg, 512)
  writeFileSync(PROFILE, png)
  console.log(
    "⚠️  public/brand/profile.png was missing: wrote the placeholder.\n" +
      "    Replace it with the official Sharea bot profile picture and run npm run assets again."
  )
}

function raster(svg, width, scale = 1) {
  // note: the flat `fontFiles` form (not the `font: { … }` object) is what
  // resvg-js 2.x honours; with the object form it silently renders no text
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width * scale },
    fontFiles: FONTS,
    background: "transparent",
  })
  return resvg.render().asPng()
}

if (!existsSync(PROFILE)) writePlaceholder()
const portraitDataUri = `data:image/png;base64,${readFileSync(PROFILE).toString("base64")}`

/* ---------- pieces shared by the assets ---------- */

/** the portrait inside the flat light-gold ring; RTL: the mark sits on the right */
function portraitRing({ cx, cy, r }) {
  return `<g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${scheme["tertiary"]}"/>
    <clipPath id="portrait-clip"><circle cx="${cx}" cy="${cy}" r="${r - 5}"/></clipPath>
    <image href="${portraitDataUri}" x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}"
           clip-path="url(#portrait-clip)" preserveAspectRatio="xMidYMid slice"/>
  </g>`
}

/* ---------- 1. logo lockup ---------- */
const lockupW = 640
const lockupH = 168
const lockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${lockupW}" height="${lockupH}" viewBox="0 0 ${lockupW} ${lockupH}">
  <title>Sharea — شارع</title>
  ${portraitRing({ cx: lockupW - 84, cy: lockupH / 2, r: 76 })}
  <text x="${lockupW - 186}" y="76" text-anchor="end" direction="ltr"
        font-family="Cormorant Garamond" font-size="52" font-weight="600"
        letter-spacing="14" fill="${scheme["on-surface"]}">SHAREA</text>
  <text x="${lockupW - 178}" y="128" text-anchor="end"
        font-family="Noto Kufi Arabic" font-size="38" font-weight="500"
        fill="${scheme["on-surface-variant"]}">شارع</text>
</svg>`

/* ---------- 2. approval badge ---------- */
const badgeW = 560
const badgeH = 104
const badgeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${badgeW}" height="${badgeH}" viewBox="0 0 ${badgeW} ${badgeH}">
  <title>معتمد — SHAREA</title>
  <rect x="3" y="3" width="${badgeW - 6}" height="${badgeH - 6}" rx="${(badgeH - 6) / 2}"
        fill="${scheme["surface-container-low"]}" stroke="${scheme["tertiary"]}" stroke-width="3"/>
  ${glyph("verified-rounded", { size: 40, x: badgeW - 62, y: 32, fill: scheme["tertiary"] })}
  <text x="${badgeW - 78}" y="66" text-anchor="end"
        font-family="Noto Kufi Arabic" font-size="38" font-weight="500"
        fill="${scheme["tertiary"]}">معتمد</text>
  <rect x="330" y="30" width="2" height="44" fill="${scheme["outline-variant"]}"/>
  <text x="300" y="68" text-anchor="end" direction="ltr"
        font-family="Cormorant Garamond" font-size="34" font-weight="600"
        letter-spacing="8" fill="${scheme["on-surface"]}">SHAREA</text>
</svg>`

/* ---------- 3. app icon (also the favicon shape) ---------- */
function appIconSvg(size, { maskable = false } = {}) {
  const pad = maskable ? size * 0.2 : 0
  const ringR = (size - pad * 2) / 2
  const corner = maskable ? 0 : Math.round(size * 0.24)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <title>Sharea</title>
  <rect width="${size}" height="${size}" rx="${corner}" fill="${scheme.surface}"/>
  ${portraitRing({ cx: size / 2, cy: size / 2, r: ringR })}
</svg>`
}

/* ---------- 4. Open Graph card ---------- */
const ogW = 1200
const ogH = 630
const ogRight = ogW - 72
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ogW}" height="${ogH}" viewBox="0 0 ${ogW} ${ogH}">
  <title>شارع | هذا المكان معتمد</title>
  <rect width="${ogW}" height="${ogH}" fill="${scheme.surface}"/>

  <!-- lockup, top right (RTL) -->
  ${portraitRing({ cx: ogRight - 42, cy: 90, r: 42 })}
  <text x="${ogRight - 100}" y="82" text-anchor="end" direction="ltr"
        font-family="Cormorant Garamond" font-size="40" font-weight="600"
        letter-spacing="10" fill="${scheme["on-surface"]}">SHAREA</text>
  <text x="${ogRight - 96}" y="120" text-anchor="end"
        font-family="Noto Kufi Arabic" font-size="26" font-weight="500"
        fill="${scheme["on-surface-variant"]}">شارع</text>

  <!-- the statement -->
  <text x="${ogRight}" y="268" text-anchor="end"
        font-family="Noto Kufi Arabic" font-size="62" font-weight="600"
        fill="${scheme["on-surface"]}">هذا المكان معتمد</text>
  <text x="${ogRight}" y="348" text-anchor="end"
        font-family="Noto Kufi Arabic" font-size="62" font-weight="600"
        fill="${scheme.tertiary}">من بوت شارع</text>

  <text x="${ogRight}" y="418" text-anchor="end"
        font-family="IBM Plex Sans Arabic" font-size="30" font-weight="400"
        fill="${scheme["on-surface-variant"]}">وجود رمز شارع الرسمي في هذا المكان يعني أنه من الأماكن المعتمدة لدينا</text>

  <!-- the slogan and the handle -->
  <rect x="${ogRight - 420}" y="470" width="420" height="2" fill="${scheme.tertiary}"/>
  <text x="${ogRight}" y="536" text-anchor="end"
        font-family="Noto Kufi Arabic" font-size="36" font-weight="500"
        fill="${scheme.tertiary}">كُلُّ احتياجاتِكَ في مكانٍ واحد</text>
  <text x="${ogRight}" y="584" text-anchor="end" direction="ltr"
        font-family="IBM Plex Sans Arabic" font-size="26" font-weight="500"
        fill="${scheme["tertiary-dim"]}">t.me/Sharea_qombot</text>
</svg>`

/* ---------- write everything ---------- */
mkdirSync(join(root, "assets/brand"), { recursive: true })
mkdirSync(join(root, "public/icons"), { recursive: true })

writeFileSync(join(root, "assets/brand/logo-lockup.svg"), lockupSvg)
writeFileSync(join(root, "assets/brand/approval-badge.svg"), badgeSvg)
writeFileSync(join(root, "assets/brand/app-icon.svg"), appIconSvg(512))
writeFileSync(join(root, "assets/brand/og-image.svg"), ogSvg)

const favicon = appIconSvg(64)
writeFileSync(join(root, "public/favicon.svg"), favicon)

const outputs = [
  ["public/favicon-32.png", raster(favicon, 32), 32],
  ["public/icons/icon-192.png", raster(appIconSvg(192), 192), 192],
  ["public/icons/icon-512.png", raster(appIconSvg(512), 512), 512],
  [
    "public/icons/icon-maskable-512.png",
    raster(appIconSvg(512, { maskable: true }), 512),
    512,
  ],
  ["public/icons/apple-touch-icon.png", raster(appIconSvg(180), 180), 180],
  ["public/og.png", raster(ogSvg, ogW), ogW],
]
for (const [path, png] of outputs) {
  writeFileSync(join(root, path), png)
  console.log(`${path.padEnd(38)} ${(png.length / 1024).toFixed(1)} KB`)
}

// a preview of the OG card next to the master, handy when reviewing the copy
writeFileSync(join(root, "assets/brand/og-image.png"), raster(ogSvg, ogW))
console.log("assets/brand/*.svg (masters) + assets/brand/og-image.png (preview)")
