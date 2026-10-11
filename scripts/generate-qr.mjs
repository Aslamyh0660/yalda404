// node scripts/generate-qr.mjs        (npm run qr)
// QR_URL=https://… npm run qr         encode a different URL
//
// ONE universal QR code for every approved Sharea location: all printed stands
// carry this same code, and it opens the same page (see README → "One universal
// QR code"). Nothing here is per-venue, and the code encodes a URL only — it is
// not a proof of a venue's identity, and neither the code nor the page claims
// otherwise.
//
// Writes to assets/qr/:
//
//   sharea-qr-brand.svg / .png   navy modules on the light gold, small logo in
//                                the middle, error correction H (30%)
//   sharea-qr-plain.svg / .png   black on white, no logo, error correction M —
//                                the fallback for difficult printing, fax-quality
//                                scans, or places a stylised code is not accepted
//
// Both keep the standard 4-module quiet zone. Verify with `npm run verify:qr`.
import { readFileSync, mkdirSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import QRCode from "qrcode"
import { PNG } from "pngjs"
import { Resvg } from "@resvg/resvg-js"

const root = resolve(import.meta.dirname, "..")

/** the URL the printed code opens: from the config, or QR_URL */
function targetUrl() {
  if (process.env.QR_URL) return process.env.QR_URL
  const config = readFileSync(join(root, "src/lib/site.config.ts"), "utf8")
  const match = /SITE_URL\s*=\s*"([^"]+)"/.exec(config)
  if (!match) throw new Error("SITE_URL not found in src/lib/site.config.ts")
  return match[1]
}

const URL_TO_ENCODE = targetUrl()
const colors = JSON.parse(readFileSync(join(root, "assets/brand/colors.json"), "utf8"))
const scheme = colors.scheme.dark

const OUT = join(root, "assets", "qr")
mkdirSync(OUT, { recursive: true })

/* ---------- one QR matrix per variant ---------- */
async function matrix(text, level) {
  const qr = QRCode.create(text, { errorCorrectionLevel: level })
  return {
    size: qr.modules.size,
    get: (x, y) => qr.modules.get(x, y),
  }
}

/**
 * SVG for a QR matrix: one path of unit squares, one module wide, drawn with
 * crisp edges so printing at any size stays sharp. `logo` puts a small mark in
 * the middle — never more than ~16% of the width, so the H level's 30% of
 * recoverable modules is far more than the mark removes.
 */
function toSvg({ matrix: qr, dark, light, logo, quiet = 4 }) {
  const total = qr.size + quiet * 2
  const path = []
  for (let y = 0; y < qr.size; y++)
    for (let x = 0; x < qr.size; x++)
      if (qr.get(x, y)) path.push(`M${x + quiet} ${y + quiet}h1v1h-1z`)

  /*
   * The centre mark. Two rules decide its size and shape:
   *  - the mark is a white disc (it clears the modules it sits on), a light
   *    gold ring, and the portrait inside the ring. On the gold code the white
   *    disc is what makes the ring and the portrait readable at print size;
   *  - the mark stays well under the ~16% of the width that error correction
   *    level H can recover with room to spare, and the disc carries a 6%
   *    margin around the ring so no dark module touches it.
   */
  const logoBox = logo ? Math.round(total * 0.16) : 0
  const disc = logoBox * 1.4
  const ringWidth = disc * 0.1
  const portrait = disc - ringWidth * 2 - disc * 0.16
  const logoMarkup = logo
    ? `<g>
    <circle cx="${total / 2}" cy="${total / 2}" r="${disc / 2}" fill="#ffffff"/>
    <circle cx="${total / 2}" cy="${total / 2}" r="${(disc - ringWidth) / 2}" fill="none" stroke="${colors.goldLight}" stroke-width="${ringWidth}"/>
    <clipPath id="qr-portrait"><circle cx="${total / 2}" cy="${total / 2}" r="${portrait / 2}"/></clipPath>
    <image href="${logo}" x="${(total - portrait) / 2}" y="${(total - portrait) / 2}" width="${portrait}" height="${portrait}" clip-path="url(#qr-portrait)" preserveAspectRatio="xMidYMid slice"/>
  </g>`
    : ""

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" role="img" aria-label="رمز QR لصفحة شارع">
  <title>Sharea — ${URL_TO_ENCODE}</title>
  <rect width="${total}" height="${total}" fill="${light}"/>
  <path d="${path.join("")}" fill="${dark}"/>
  ${logoMarkup}
</svg>`
}

/* ---------- PNG: exact module grid, no interpolation blur ---------- */
function toPng(svg, total, targetPixels) {
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: targetPixels },
    shapeRendering: 0, // crisp edges
  })
    .render()
    .asPng()
  return png
}

const portrait = join(root, "public/brand/profile.png")
const portraitUri = `data:image/png;base64,${readFileSync(portrait).toString("base64")}`

const brandMatrix = await matrix(URL_TO_ENCODE, "H")
const plainMatrix = await matrix(URL_TO_ENCODE, "M")

const brandSvg = toSvg({
  matrix: brandMatrix,
  dark: scheme.surface,
  light: colors.goldLight,
  logo: portraitUri,
})
const plainSvg = toSvg({
  matrix: plainMatrix,
  dark: "#000000",
  light: "#ffffff",
  logo: null,
})

writeFileSync(join(OUT, "sharea-qr-brand.svg"), brandSvg)
writeFileSync(join(OUT, "sharea-qr-plain.svg"), plainSvg)

/** one PNG pixel per module means no anti-aliasing at all — best for printing */
const MODULE_PX = 32
const brandTotal = brandMatrix.size + 8
const plainTotal = plainMatrix.size + 8

const brandPng = toPng(brandSvg, brandTotal, brandTotal * MODULE_PX)
const plainPng = toPng(plainSvg, plainTotal, plainTotal * MODULE_PX)
writeFileSync(join(OUT, "sharea-qr-brand.png"), brandPng)
writeFileSync(join(OUT, "sharea-qr-plain.png"), plainPng)

console.log(`encoded: ${URL_TO_ENCODE}`)
console.log(
  `brand: ${brandMatrix.size}×${brandMatrix.size} modules, ECC H, ${MODULE_PX}px/module → ${brandTotal * MODULE_PX}px`
)
console.log(
  `plain: ${plainMatrix.size}×${plainMatrix.size} modules, ECC M, ${MODULE_PX}px/module → ${plainTotal * MODULE_PX}px`
)
console.log(`wrote assets/qr/sharea-qr-brand.{svg,png} and assets/qr/sharea-qr-plain.{svg,png}`)
console.log("now run: npm run verify:qr")
