// node scripts/vendor-m3e.mjs
//
// Copies shadcn M3E registry items into this project as source, the way
// `npx shadcn@latest add @m3e/<name>` does: the files are yours afterwards.
//
// This project's environment can reach github.com and npm but not
// shadcn-m3e.crystaworld.dev, so instead of the shadcn CLI this script reads a
// checkout of the M3E repository (https://github.com/Crysta1221/shadcn-m3e) and
// copies the requested items plus everything they import.
//
//   node scripts/vendor-m3e.mjs /path/to/shadcn-m3e            (dry run)
//   node scripts/vendor-m3e.mjs /path/to/shadcn-m3e --write
//
// Entry points are the components this page actually uses (see ENTRIES).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"

const root = resolve(import.meta.dirname, "..")
const src = process.argv[2]
const WRITE = process.argv.includes("--write")
if (!src) {
  console.error("usage: node scripts/vendor-m3e.mjs <path-to-shadcn-m3e> [--write]")
  process.exit(1)
}

const PKG = join(src, "packages", "m3e")
const COMPONENTS = join(PKG, "src", "components")
const LIB = join(PKG, "src", "lib")
const STYLES = join(PKG, "src", "styles")

/* The M3E items this page uses. Everything else they need comes along. */
const ENTRIES = {
  components: [
    "app-bar", // top app bar
    "button", // filled / tonal / outlined buttons + icon buttons
    "card", // services showcase
    "chip", // "معتمد من شارع" assist chip, service chips
    "icon", // Material Symbols Rounded, bundled
    "icon-registry",
    "icon-data",
    "icon-data.app",
    "separator", // M3 divider
    "toast", // snackbar confirmation (share / copy)
    "toggle", // M3E toggle: the like button (shape morph + icon fill)
    "toolbar", // bottom bar for the sticky CTA
    "m3e-provider",
    "m3-theme-provider",
    "color-mode-provider",
  ],
  lib: ["cn", "color", "baseline"],
}

/*
 * Files that belong to this app, not to the registry: M3E ships them empty and
 * this project fills them (`npm run gen:icons`). Vendoring must never copy the
 * library's own version over them again.
 */
const APP_OWNED = new Set(["icon-data.app.ts", "icon-data.app.js"])

/** `@/components/m3e/button` -> packages/m3e/src/components/button.tsx */
function resolveSpec(spec, from) {
  const m = /^@\/(components|lib)\/m3e\/([^/]+)$/.exec(spec)
  if (!m) {
    if (!spec.startsWith(".")) return null
    const base = resolve(dirname(from), spec)
    for (const ext of [".tsx", ".ts"]) if (existsSync(base + ext)) return base + ext
    return null
  }
  const dir = m[1] === "components" ? COMPONENTS : LIB
  for (const ext of [".tsx", ".ts"]) {
    const p = join(dir, m[2] + ext)
    if (existsSync(p)) return p
  }
  throw new Error(`cannot resolve ${spec}`)
}

const importsOf = (file) =>
  [...readFileSync(file, "utf8").matchAll(/from\s+"([^"]+)"/g)]
    .map((m) => resolveSpec(m[1], file))
    .filter(Boolean)

const wanted = new Set()
const queue = []
for (const [group, names] of Object.entries(ENTRIES))
  for (const name of names) {
    const dir = group === "components" ? COMPONENTS : LIB
    for (const ext of [".tsx", ".ts"]) {
      const p = join(dir, name + ext)
      if (existsSync(p)) {
        queue.push(p)
        break
      }
    }
  }
if (!queue.length) {
  console.error(`no M3E sources found under ${PKG}`)
  process.exit(1)
}
while (queue.length) {
  const file = queue.pop()
  if (wanted.has(file)) continue
  wanted.add(file)
  queue.push(...importsOf(file))
}

/* Registry target path -> this project's path. */
const target = (file) => {
  const rel = relative(PKG, file)
  if (rel.startsWith("src/components/")) return join(root, "src/components/m3e", rel.slice("src/components/".length))
  if (rel.startsWith("src/lib/")) return join(root, "src/lib/m3e", rel.slice("src/lib/".length))
  throw new Error(`unexpected source path ${rel}`)
}

const files = [...wanted].sort()
const kept = []
const base = (p) => p.split("/").pop()
for (const f of files) {
  const owned = APP_OWNED.has(base(f)) && existsSync(target(f))
  console.log(`  ${relative(PKG, f)}  ->  ${relative(root, target(f))}${owned ? "   (kept: this file belongs to the app)" : ""}`)
  if (!owned) kept.push(f)
}
console.log(`${kept.length} files to copy, ${files.length - kept.length} kept`)

/* Styles are copied too: they are the M3E token layer (@m3e/styles). */
for (const css of ["m3e.css", "m3e.generated.css"]) {
  const from = join(STYLES, css)
  const to = join(root, "src/lib/m3e", css)
  console.log(`  src/styles/${css}  ->  ${relative(root, to)}`)
  if (WRITE) {
    mkdirSync(dirname(to), { recursive: true })
    writeFileSync(to, readFileSync(from))
  }
}

if (!WRITE) {
  console.log("\ndry run — pass --write to copy")
  process.exit(0)
}
for (const f of kept) {
  const to = target(f)
  mkdirSync(dirname(to), { recursive: true })
  writeFileSync(to, readFileSync(f))
}
console.log("\ncopied. These files are now yours to edit.")
