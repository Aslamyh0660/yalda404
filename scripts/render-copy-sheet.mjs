// node scripts/render-copy-sheet.mjs      (npm run check:arabic)
//
// Renders every Arabic string of the page with the exact WOFF2 the site serves,
// into one image per font at two sizes: docs/copy-sheet-{body,heading}.png.
//
// Why: letter joining, ligatures and diacritic placement are decided by the
// font's shaping tables, so a spelling mistake or a broken subset shows up in
// the picture, not in the source. Reading the sheet is the proofreading pass for
// docs/copy-review.md; the automated checks (no Persian-only letters, verbatim
// strings, punctuation) run in scripts/check-markup.mjs.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { Resvg } from "@resvg/resvg-js"

const root = resolve(import.meta.dirname, "..")

/* every Arabic string the page renders, in page order */
const content = readFileSync(join(root, "src/lib/content.ts"), "utf8")
const strings = [...content.matchAll(/"([^"\n]*[\u0600-\u06FF][^"\n]*)"/g)].map((m) => m[1])
const unique = [...new Set(strings)]

const FONTS = {
  "IBM Plex Sans Arabic 400": "public/fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2",
  "IBM Plex Sans Arabic 600": "public/fonts/ibm-plex-sans-arabic-arabic-600-normal.woff2",
  "Noto Kufi Arabic 600": "public/fonts/noto-kufi-arabic-arabic-600-normal.woff2",
}

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

function sheet(family, fontFile, size) {
  const lineHeight = Math.round(size * 2.4)
  const width = 1400
  const height = unique.length * lineHeight + 80
  const body = unique
    .map((text, i) => {
      const y = 60 + i * lineHeight
      return `<text x="${width - 40}" y="${y}" text-anchor="end" font-family="${family}" font-size="${size}" fill="#F5EEDC">${escape(text)}</text>`
    })
    .join("\n  ")
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="#0a1c33"/>
  ${body}
</svg>`
  return new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    fontFiles: [join(root, fontFile)],
  })
    .render()
    .asPng()
}

mkdirSync(join(root, "docs"), { recursive: true })
const outputs = [
  ["docs/copy-sheet-body.png", "IBM Plex Sans Arabic", FONTS["IBM Plex Sans Arabic 400"], 26],
  ["docs/copy-sheet-heading.png", "Noto Kufi Arabic", FONTS["Noto Kufi Arabic 600"], 30],
]
for (const [out, family, file, size] of outputs) {
  const png = sheet(family, file, size)
  writeFileSync(join(root, out), png)
  console.log(`wrote ${out} (${unique.length} strings, ${family} ${size}px)`)
}
console.log(`\n${unique.length} unique Arabic strings render — proofread them in the sheets.`)
