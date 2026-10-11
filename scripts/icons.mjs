// node scripts/icons.mjs            write the bundled icon data
// node scripts/icons.mjs --check    verify it is up to date (CI)
//
// Only the Material Symbols Rounded glyphs this page uses are bundled — no icon
// font, nothing fetched at runtime. Same job as the M3E script
// (shadcn-m3e scripts/icons.mjs), with one difference: M3E downloads the glyph
// bodies from the Iconify API, this version reads them from the
// `@iconify-json/material-symbols` package, which ships the identical data, so
// icons can be regenerated offline and the build is reproducible.
//
// What counts as "used": name="x" / icon="x" in JSX, the strings in
// name={a ? "x" : "y"}, `icon: "x"` fields, ["x", "Label"] pairs and a
// `// @icons x y z` line for names built at runtime.
//
//   icon-data.app.ts   what this page uses (this script writes it)
//   icon-data.ts       what the M3E components use (ships with the registry)
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs"
import { join, relative, resolve } from "node:path"

const root = resolve(import.meta.dirname, "..")
const SRC = join(root, "src")
const COMPONENTS = join(SRC, "components", "m3e")
const APP_OUT = join(COMPONENTS, "icon-data.app.ts")
const CORE_FILE = join(COMPONENTS, "icon-data.ts")
const PREFIX = "material-symbols"
const CHECK = process.argv.includes("--check")

/* ---------- what the code uses ---------- */
function iconNames(source, where, seen) {
  const out = []
  const push = (name, from) => {
    out.push(name)
    if (seen && !seen.has(name)) seen.set(name, from)
  }
  const scan = (text, attr, from) => {
    for (const m of text.matchAll(new RegExp(`\\b${attr}="([a-z0-9_]+)"`, "g")))
      push(m[1], from)
    for (const m of text.matchAll(new RegExp(`\\b${attr}=\\{([^{}]*)\\}`, "g")))
      for (const n of m[1]
        .replace(/[!=]==?\s*"[^"]*"/g, "")
        .matchAll(/"([a-z][a-z0-9_]*)"/g))
        push(n[1], from)
  }
  const from = where ?? "source"
  scan(source, "icon", from)
  for (const tag of source.matchAll(/<Icon\b[^>]*>/g))
    scan(tag[0].replace(/\s+/g, " "), "name", tag[0].replace(/\s+/g, " ").slice(0, 80))
  const logical = new Set(out)
  for (const m of source.matchAll(/\bicon:\s*"([a-z0-9_]+)"/g)) {
    logical.add(m[1])
    if (seen && !seen.has(m[1])) seen.set(m[1], `${from}: ${m[0]}`)
  }
  for (const m of source.matchAll(/\["([a-z0-9_]+)",\s*"[A-Za-z]/g)) logical.add(m[1])
  for (const m of source.matchAll(/\/\/\s*@icons\s+([a-z0-9_ ]+)/g))
    for (const n of m[1].trim().split(/\s+/)) logical.add(n)
  return logical
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) walk(path, files)
    else if (/\.tsx?$/.test(entry.name) && !/icon-data/.test(entry.name))
      files.push(path)
  }
  return files
}

/*
 * Only this app's own files are scanned: the vendored M3E library is skipped,
 * because its glyphs are already in icon-data.ts and its helper code contains
 * name-like arrays (`["display", "headline", …]` in cn.ts) that are not icons.
 */
const LIBRARY_DIRS = [COMPONENTS, join(SRC, "lib", "m3e")]

const used = new Set()
/** where each name was seen, so a bad name can be reported with its context */
const origins = new Map()
for (const file of walk(SRC)) {
  if (LIBRARY_DIRS.some((dir) => file.startsWith(dir))) continue
  for (const name of iconNames(readFileSync(file, "utf8"), file.replace(root + "/", ""), origins))
    used.add(name)
}

/* ---------- the glyph data ---------- */
const collection = JSON.parse(
  readFileSync(join(root, "node_modules", "@iconify-json", "material-symbols", "icons.json"), "utf8")
)
const coreKeys = existsSync(CORE_FILE)
  ? new Set([
      ...Object.keys(JSON.parse(readFileSync(CORE_FILE, "utf8").slice(
        readFileSync(CORE_FILE, "utf8").indexOf("= ") + 2,
        readFileSync(CORE_FILE, "utf8").lastIndexOf("\n\nexport default")
      )).icons ?? {}),
      ...Object.keys(JSON.parse(readFileSync(CORE_FILE, "utf8").slice(
        readFileSync(CORE_FILE, "utf8").indexOf("= ") + 2,
        readFileSync(CORE_FILE, "utf8").lastIndexOf("\n\nexport default")
      )).aliases ?? {}),
    ])
  : new Set()

/** logical name -> the two Iconify glyph names (outline + filled) */
const wanted = new Map()
for (const name of [...used].sort()) {
  const base = name.replaceAll("_", "-")
  wanted.set(`${base}-outline-rounded`, name)
  wanted.set(`${base}-rounded`, name)
}

const icons = {}
const aliases = {}
const missing = []
for (const [glyph, logicalName] of wanted) {
  if (coreKeys.has(glyph)) continue // already shipped by the M3E components
  const body = collection.icons?.[glyph]?.body ?? (() => {
    const parent = collection.aliases?.[glyph]?.parent
    return parent ? collection.icons?.[parent]?.body : undefined
  })()
  if (!body) {
    missing.push(`${glyph}  (used as "${logicalName}")  ← ${origins.get(logicalName) ?? "?"}`)
    continue
  }
  icons[glyph] = { body }
}

if (missing.length) {
  console.error("no such glyph in Material Symbols Rounded:")
  for (const m of missing) console.error(`  ${m}`)
  console.error("\ncheck the spelling, or the variants list in @iconify-json/material-symbols")
  process.exit(1)
}

const sortKeys = (o) =>
  Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)))

const data = {
  prefix: PREFIX,
  width: 24,
  height: 24,
  icons: sortKeys(icons),
  ...(Object.keys(aliases).length ? { aliases: sortKeys(aliases) } : {}),
}

const render = (value) => `import type { IconifyJSON } from "@iconify/react/offline"

// Generated by scripts/icons.mjs (npm run gen:icons). Do not edit.
// Icons used by this app, outside the M3E components.
// Material Symbols Rounded, Apache-2.0, via Iconify.
const data: IconifyJSON = ${JSON.stringify(value, null, 2)}

export default data
`

/** the icon names already in the written file */
function writtenKeys() {
  if (!existsSync(APP_OUT)) return null
  const text = readFileSync(APP_OUT, "utf8")
  try {
    const json = JSON.parse(text.slice(text.indexOf("= ") + 2, text.lastIndexOf("\n\nexport default")))
    return Object.keys(json.icons ?? {}).sort()
  } catch {
    return null
  }
}

const want = Object.keys(data.icons)
const have = writtenKeys()
const same = have && have.length === want.length && have.every((k, i) => k === want[i])

if (CHECK) {
  if (!same) {
    console.error(`${relative(root, APP_OUT)} is out of date, run: npm run gen:icons`)
    process.exit(1)
  }
  console.log(`icon data is up to date (${want.length} app icons bundled)`)
} else if (!same) {
  writeFileSync(APP_OUT, render(data))
  console.log(`wrote ${relative(root, APP_OUT)} (${want.length} app icons bundled)`)
} else {
  console.log(`${relative(root, APP_OUT)} is up to date (${want.length} app icons)`)
}
