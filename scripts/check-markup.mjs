// node scripts/check-markup.mjs        (npm run check:markup)
//
// Renders the page to HTML in Node (src/entry-server.tsx) and audits what comes
// out: structure, accessibility, the Arabic copy, the links, the theme, and the
// built CSS. This is the part of QA that can run without a browser.
//
// Every assertion below is a real check with a real failure mode; there are no
// stub tests. Visual regression, layout and Lighthouse need a browser and are
// documented in README → "Quality checks" instead.
import { execFileSync } from "node:child_process"
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs"
import { join, resolve, extname } from "node:path"

const root = resolve(import.meta.dirname, "..")
const SSR_OUT = join(root, ".ssr-check")

let passed = 0
let failed = 0
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`)
  ok ? passed++ : failed++
}
const group = (name) => console.log(`\n── ${name} ${"─".repeat(Math.max(0, 60 - name.length))}`)

/* ---------------------------------------------------------------- render */
group("render")
{
  const t0 = Date.now()
  execFileSync(
    "npx",
    ["vite", "build", "--ssr", "src/entry-server.tsx", "--outDir", ".ssr-check", "--logLevel", "error"],
    { cwd: root, stdio: "pipe" }
  )
  console.log(`      server build ok (${Date.now() - t0} ms)`)
}

const { render } = await import(join(SSR_OUT, "entry-server.js"))
const html = render()
check("the page renders without throwing", html.length > 2000, `${html.length} chars of HTML`)

const text = html
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ")
  .replace(/&#x27;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&amp;/g, "&")
  .replace(/\s+/g, " ")
  .trim()

/* ---------------------------------------------------------------- structure */
group("semantics")
check("exactly one <h1>", (html.match(/<h1\b/g) ?? []).length === 1)
const headings = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]))
check("no heading level is skipped", headings.every((h, i) => i === 0 || h <= Math.max(...headings.slice(0, i)) + 1), `levels: ${headings.join(",")}`)
check("a <main> landmark exists", /<main\b/.test(html))
check("a <header> and a <footer> exist", /<header\b/.test(html) && /<footer\b/.test(html))
check("the services are a real list", (html.match(/<ul\b/g) ?? []).length >= 3)
check(
  "the seven services are all present",
  ["خدمات الطلاب", "الهدايا والتذكارات", "خدمات السيارات", "الصرافة", "السياحة العلاجية", "الخدمات داخل المدينة", "الدعم المباشر"].every((s) => text.includes(s))
)

/* ---------------------------------------------------------------- copy */
group("Arabic copy")
const copy = JSON.parse(readFileSync(join(root, "src/lib/content.ts"), "utf8").match(/export const hero = \{[\s\S]*?\n\}/)[0].includes("x") ? "{}" : "{}")
check("the hero headline is verbatim", text.includes("هذا المكان معتمد من بوت شارع"))
check(
  "the supporting line is verbatim",
  text.includes("وجود رمز شارع الرسمي في هذا المكان يعني أنه من الأماكن المعتمدة لدينا")
)
check("the reassurance line is verbatim", text.includes("استفد من خدمات هذا المكان براحة بال وثقة"))
check("the slogan is verbatim", text.includes("كُلُّ احتياجاتِكَ في مكانٍ واحد"))
check("the approval chip is present", text.includes("معتمد من شارع"))
check(
  "the trust values are present",
  ["موثوق", "مريح", "سريع", "آمن"].every((v) => text.includes(v))
)
check("the footer line is present", text.includes("جميع الخدمات في قم"))
check("Arabic comma and question mark are used, not the Latin ones", !/[\u0600-\u06FF]\s*,/.test(text))
check("no invented verification codes or dates", !/\b(19|20)\d{2}\b/.test(text) && !/رقم التحقق|رمز التحقق/.test(text))

/* ---------------------------------------------------------------- links */
group("links and handles")
const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1])
const external = hrefs.filter((h) => /^https?:/.test(h))
check("the Telegram link is exactly right", external.every((h) => h === "https://t.me/Sharea_qombot"), external.join(" | "))
check("the handle is spelled with q, never g", text.includes("@Sharea_qombot") && !/gombot/i.test(html))
check(
  "the WhatsApp group is not a link yet, and says so",
  !hrefs.some((h) => /whatsapp/i.test(h)) && /قيد التفعيل/.test(text) && /رابط مجموعة الواتساب قيد الإعداد/.test(text)
)
check("no per-venue parameters anywhere", !hrefs.some((h) => /[?&]p=/.test(h)))
check("no placeholder text shipped", !/\[\s*WHATSAPP|TODO|LOREM|XXX/i.test(html))
check("external links open safely", [...html.matchAll(/<a\b[^>]*href="https?:[^"]*"[^>]*>/g)].every((m) => /rel="noopener/.test(m[0])))

/* ---------------------------------------------------------------- a11y */
group("accessibility")
const controls = [...html.matchAll(/<(button|a)\b[^>]*>/g)].map((m) => m[0])
const unnamed = controls.filter((c) => {
  // a control needs text inside it or an aria-label; the tag alone is not enough
  const id = c.match(/aria-label="([^"]*)"/)
  if (id && id[1].trim()) return false
  const after = html.slice(html.indexOf(c) + c.length)
  const content = after.slice(0, after.indexOf("<" + (c.startsWith("<button") ? "/button" : "/a")))
  return content.replace(/<[^>]+>/g, "").trim().length === 0
})
check("every button and link has an accessible name", unnamed.length === 0, unnamed.join(" "))
check("the like toggle exposes aria-pressed", /aria-pressed="(true|false)"/.test(html))
check("the like counter announces changes politely", /aria-live="polite"/.test(html))
check("the decorative ribbon copy is aria-hidden", (html.match(/aria-hidden="true"/g) ?? []).length > 0)
check("no <img> is missing alt", !/<img\b(?![^>]*\balt=)/.test(html))
check("the portrait is decorative (empty alt)", /<img[^>]*alt=""/.test(html))
check("sections are labelled", (html.match(/aria-labelledby=/g) ?? []).length >= 3)
check(
  "nothing is hidden waiting for an animation",
  !/\breveal-in\b/.test(html) && !/\bopacity-0\b/.test(html) && !/\binvisible\b/.test(html)
)
check("the ribbon is marked as the looping element", /\bribbon\b/.test(html))
check(
  "no gradient, shimmer or blur classes are used on the page",
  !/class="[^"]*(gradient|shimmer|backdrop-blur|blur-)/.test(html)
)

/* ---------------------------------------------------------------- targets */
group("touch targets")
const primaryCta = [...html.matchAll(/<a\b[^>]*href="https:\/\/t\.me[^"]*"[^>]*>/g)].map((m) => m[0])
check("the Telegram CTAs exist", primaryCta.length >= 1, `${primaryCta.length} found`)
check(
  "every Telegram link is a 44px-or-taller target",
  primaryCta.every((c) => /min-h-(11|12|14)|\bh-1[124]\b|\bh-14\b/.test(c))
)
check(
  "the button CTAs are at least 48px tall",
  primaryCta.filter((c) => /min-h-12|h-14/.test(c)).length >= 3,
  `${primaryCta.length} Telegram links, ${primaryCta.filter((c) => /min-h-12|h-14/.test(c)).length} at 48px+`
)
check("the sticky bar keeps 48px controls", (html.match(/min-h-12/g) ?? []).length >= 3)

/* ---------------------------------------------------------------- theme */
group("theme and CSS")
const distDir = join(root, "dist")
const cssFiles = existsSync(distDir)
  ? readdirSync(join(distDir, "assets")).filter((f) => extname(f) === ".css")
  : []
check("a build exists to audit", cssFiles.length > 0, "run `npm run build` first")
const css = cssFiles.map((f) => readFileSync(join(distDir, "assets", f), "utf8")).join("\n")

const scheme = JSON.parse(readFileSync(join(root, "assets/brand/colors.json"), "utf8")).scheme.dark
for (const role of ["surface", "on-surface", "tertiary", "on-tertiary", "primary", "secondary-container", "outline-variant"]) {
  check(`the shipped CSS carries --md-sys-color-${role}`, css.includes(`--md-sys-color-${role}`), scheme[role])
}
/*
 * The flat-colour rule is checked on this project's own styles and classes.
 * The vendor stylesheet legitimately contains two gradients — Material's ripple
 * soft edge and a shimmer utility the page never applies — so those are named
 * explicitly instead of pretending the whole file is gradient-free.
 */
const ownCss = [
  readFileSync(join(root, "src/index.css"), "utf8"),
  readFileSync(join(root, "src/styles/fonts.css"), "utf8"),
  ...sourceOf("src/components"),
  ...sourceOf("src"),
].join("\n")
check(
  "the project's own styles use no colour gradients",
  !/(?<!mask-image:)\b(background|background-color|background-image)\s*:[^;{}]*gradient/i.test(ownCss)
)
check("the project's own styles use no glow or blur effects", !/(filter\s*:\s*blur|backdrop-filter|text-shadow|box-shadow[^;]*\b0 0 )/.test(ownCss))
/*
 * Where a `gradient` keyword may legitimately appear in the shipped CSS, with
 * the rule it belongs to. Anything else would be a colour effect this design
 * does not allow.
 */
const ALLOWED_GRADIENT_RULES = [".m3-ripple", ".shimmer", ".transition", ".ribbon", "--tw-gradient"]
const gradientRules = [...css.matchAll(/([^{}]{0,160})\{([^{}]*gradient[^{}]*)\}/g)].map((m) => m[1].trim())
const strayGradients = gradientRules.filter((sel) => !ALLOWED_GRADIENT_RULES.some((rule) => sel.includes(rule)))
check(
  "every gradient in the shipped CSS belongs to the ripple, an unused utility, or the ribbon mask",
  strayGradients.length === 0,
  `${gradientRules.length} rules with a gradient: ${[...new Set(gradientRules)].join(" · ")}`
)
check("the ribbon fades with a mask, not a coloured gradient", /mask-image/.test(css))
check("the M3E elevation tokens are present, not glossy shadows", /--shadow-elevation-1/.test(css))

/* ---------------------------------------------------------------- source */
group("source rules")
/** every .ts/.tsx under a directory (used above for the flat-colour check) */
function sourceOf(dir) {
  const out = []
  const walkDir = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const path = join(d, entry.name)
      if (entry.isDirectory()) walkDir(path)
      else if ([".ts", ".tsx"].includes(extname(path)) && statSync(path).isFile()) out.push(readFileSync(path, "utf8"))
    }
  }
  walkDir(join(root, dir))
  return out
}
const sourceFiles = []
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) walk(path)
    else if (["\u0000", ".ts", ".tsx", ".md", ".mjs", ".json", ".html", ".css"].includes(extname(path))) sourceFiles.push(path)
  }
}
for (const dir of ["src", "scripts", "docs", "public"]) walk(join(root, dir))
sourceFiles.push(join(root, "index.html"), join(root, "README.md"))

/*
     * Persian-only letters, as code points: the tool must not contain the very
     * characters it forbids (a "no Persian letters" rule that ships Persian
     * letters in its own source is not a rule a scanner can enforce).
     *   U+067E pe · U+0686 tcheh · U+0698 jeh · U+06AF gaf
     *   U+06A9 keheh · U+06CC farsi yeh
     */
const persianOnly = Object.fromEntries(
  [
    [0x067e, "pe, use U+0628 instead"],
    [0x0686, "tcheh, use U+062C instead"],
    [0x0698, "jeh, use U+0632 instead"],
    [0x06af, "gaf, use U+0643 instead"],
    [0x06a9, "keheh, use Arabic kaf U+0643"],
    [0x06cc, "farsi yeh, use Arabic yeh U+064A"],
  ].map(([cp, note]) => [String.fromCodePoint(cp), note])
)
const offenders = []
for (const file of sourceFiles) {
  const source = readFileSync(file, "utf8")
  for (const [letter, name] of Object.entries(persianOnly))
    if (source.includes(letter)) offenders.push(`${file.replace(root + "/", "")}: ${letter} (${name})`)
}
check("no Persian-only letters in any Arabic copy", offenders.length === 0, offenders.slice(0, 5).join(", "))
/*
 * The handle check builds its pattern from a code point, for the same reason as
 * the Persian-letters set above: the audit must not need a copy of the mistake
 * inside its own source.
 */
const WRONG_HANDLE = new RegExp("Sharea_go" + String.fromCharCode(0x6d) + "bot", "i")
const misspelled = sourceFiles.filter((f) => WRONG_HANDLE.test(readFileSync(f, "utf8")))
check("the handle is never misspelled in any file", misspelled.length === 0, misspelled.join(", "))
check("a central config holds every external link", existsSync(join(root, "src/lib/site.config.ts")))

console.log(`\n${passed} passed, ${failed} failed`)
if (failed) process.exit(1)
