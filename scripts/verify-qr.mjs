// node scripts/verify-qr.mjs      (npm run verify:qr)
//
// Decodes the QR codes in assets/qr/ and checks that they carry exactly the
// site URL — the test that matters before anything goes to print.
//
// It decodes each file at several pixel sizes, from a print-resolution export
// down to a small on-screen scan, and both PNG and the rendered SVG, because a
// phone camera sees a re-rendered image, not the file. Nothing here trusts the
// generator: the images are read back and decoded pixel by pixel with jsQR.
import { readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { PNG } from "pngjs"
import jsQR from "jsqr"
import { Resvg } from "@resvg/resvg-js"

const root = resolve(import.meta.dirname, "..")

function expectedUrl() {
  if (process.env.QR_URL) return process.env.QR_URL
  const config = readFileSync(join(root, "src/lib/site.config.ts"), "utf8")
  return /SITE_URL\s*=\s*"([^"]+)"/.exec(config)[1]
}

const EXPECTED = expectedUrl()

/** decode raw RGBA */
function decode(data, width, height) {
  const result = jsQR(new Uint8ClampedArray(data), width, height, {
    inversionAttempts: "attemptBoth",
  })
  return result?.data ?? null
}

function pngBytesToRgba(png) {
  return { data: png.data, width: png.width, height: png.height }
}

function rasterFromSvg(svg, width) {
  const png = PNG.sync.read(
    new Resvg(svg, { fitTo: { mode: "width", value: width }, shapeRendering: 0 })
      .render()
      .asPng()
  )
  return pngBytesToRgba(png)
}

/** nearest-neighbour resize: what a screen or a printer effectively does to a
 *  bitmap QR code when it is displayed smaller than its native size */
function resizeNearest({ data, width, height }, targetWidth) {
  const scale = width / targetWidth
  const targetHeight = Math.round(height / scale)
  const out = Buffer.alloc(targetWidth * targetHeight * 4)
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const sx = Math.min(width - 1, Math.floor(x * scale))
      const sy = Math.min(height - 1, Math.floor(y * scale))
      const s = (sy * width + sx) * 4
      const d = (y * targetWidth + x) * 4
      out[d] = data[s]
      out[d + 1] = data[s + 1]
      out[d + 2] = data[s + 2]
      out[d + 3] = data[s + 3]
    }
  }
  return { data: out, width: targetWidth, height: targetHeight }
}

let failures = 0
function check(label, decoded) {
  const ok = decoded === EXPECTED
  if (!ok) failures += 1
  const shown = decoded === null ? "(nothing decoded)" : decoded
  console.log(`${ok ? "PASS" : "FAIL"}  ${label.padEnd(46)} → ${shown}`)
}

console.log(`expected payload: ${EXPECTED}\n`)

for (const name of ["sharea-qr-brand", "sharea-qr-plain"]) {
  const svg = readFileSync(join(root, "assets", "qr", `${name}.svg`), "utf8")
  const native = PNG.sync.read(readFileSync(join(root, "assets", "qr", `${name}.png`)))
  check(`${name}.png (${native.width}px, native)`, decode(native.data, native.width, native.height))

  // a phone screen that shows the code small, and a low-resolution print
  for (const width of [512, 300, 220, 160]) {
    const scaled = resizeNearest(pngBytesToRgba(native), width)
    check(`${name}.png @ ${width}px`, decode(scaled.data, scaled.width, scaled.height))
  }

  // the vector master, rendered the way a printer would
  for (const width of [1200, 600, 300]) {
    const raster = rasterFromSvg(svg, width)
    check(`${name}.svg @ ${width}px`, decode(raster.data, raster.width, raster.height))
  }
  console.log("")
}

if (failures) {
  console.error(`${failures} check(s) failed`)
  process.exit(1)
}
console.log("all checks passed: every variant decodes to the site URL")
