/**
 * npm run colors:report
 *
 * Turns the Sharea brand palette into a Material 3 color scheme with Google's
 * material-color-utilities — the same library shadcn M3E generates its schemes
 * with (src/lib/m3e/color.ts).
 *
 * What it does
 *  1. reads the HCT values of the brand tokens (hue / chroma / tone),
 *  2. builds the five M3 tonal palettes from those hues, at the chroma the
 *     brand needs (the navy palette at chroma 22 reproduces the deep navy
 *     #0A1C33 exactly, at tone 10),
 *  3. lets material-color-utilities map every M3 role onto a tone of those
 *     palettes (the official dark and light tone mappings),
 *  4. applies the handful of documented brand tone choices (the warm cream
 *     text, the light gold accent tone, navy text on gold),
 *  5. checks WCAG contrast for the pairs the page actually renders,
 *  6. writes src/lib/m3e/sharea-scheme.ts (what the site ships) and
 *     docs/color-mapping.md (palette + tone + hex + contrast tables).
 *
 * Run it after changing a brand color; nothing here ships to the browser.
 */
import {
  Hct,
  MaterialDynamicColors,
  TonalPalette,
  DynamicScheme,
  Variant,
  argbFromHex,
  hexFromArgb,
  type DynamicColor,
} from "@material/material-color-utilities"
import { mkdirSync, writeFileSync } from "node:fs"

/* ---------- 1. brand tokens (section 5 of the brief) ---------- */
const BRAND = {
  navy: "#0F2A4A", // primary royal / midnight navy
  navySecondary: "#16375F", // secondary navy
  navyDeep: "#0A1C33", // deep background navy
  gold: "#D4A24C", // main gold
  goldLight: "#F3D48A", // light gold — the signature
  goldDeep: "#A87824", // deep gold
  cream: "#F5EEDC", // warm off-white text
} as const

const hctOf = (value: string) => Hct.fromInt(argbFromHex(value))
const hexOf = (argb: number) => hexFromArgb(argb)

/* ---------- 2. tonal palettes ---------- */
const HUES = {
  navy: 259.1, // brand navy
  navySecondary: 259.5, // brand secondary navy
  goldLight: 89.3, // brand light gold
  red: 25, // M3 error red
}
const CHROMAS = {
  primary: 24,
  secondary: 26,
  tertiary: 33,
  neutral: 22,
  neutralVariant: 16,
  error: 84,
}

type PaletteName = "primary" | "secondary" | "tertiary" | "neutral" | "neutralVariant" | "error"
const PALETTES: Record<PaletteName, TonalPalette> = {
  primary: TonalPalette.fromHueAndChroma(HUES.navy, CHROMAS.primary),
  secondary: TonalPalette.fromHueAndChroma(HUES.navySecondary, CHROMAS.secondary),
  tertiary: TonalPalette.fromHueAndChroma(HUES.goldLight, CHROMAS.tertiary),
  neutral: TonalPalette.fromHueAndChroma(HUES.navySecondary, CHROMAS.neutral),
  neutralVariant: TonalPalette.fromHueAndChroma(HUES.navySecondary, CHROMAS.neutralVariant),
  error: TonalPalette.fromHueAndChroma(HUES.red, CHROMAS.error),
}

/* ---------- 3. every role, from the M3 tone mapping ---------- */
const mdc = new MaterialDynamicColors()
const ROLES: [string, DynamicColor][] = [
  ...mdc.allColors,
  mdc.surfaceVariant(),
  mdc.surfaceTint(),
  mdc.shadow(),
  mdc.scrim(),
].map((c) => [c.name.replaceAll("_", "-"), c] as [string, DynamicColor])

function generatedScheme(dark: boolean, spec: "2021" | "2025" = "2021") {
  const scheme = new DynamicScheme({
    sourceColorHct: hctOf(BRAND.navy),
    contrastLevel: 0,
    isDark: dark,
    specVersion: spec,
    variant: Variant.TONAL_SPOT,
    primaryPalette: PALETTES.primary,
    secondaryPalette: PALETTES.secondary,
    tertiaryPalette: PALETTES.tertiary,
    neutralPalette: PALETTES.neutral,
    neutralVariantPalette: PALETTES.neutralVariant,
    errorPalette: PALETTES.error,
  })
  const out: Record<string, string> = {}
  for (const [name, color] of ROLES) out[name] = hexOf(color.getArgb(scheme))
  // 2021 has no *-dim roles; M3E falls back to the base role
  for (const k of ["primary", "secondary", "tertiary", "error"])
    out[`${k}-dim`] ??= out[k]
  return out
}

/* ---------- 4. brand tone choices ---------- */
/** role -> [palette, tone, note] */
type ToneChoice = Record<string, { palette: PaletteName | "brand"; tone: number; note: string }>

const DARK_CHOICES: ToneChoice = {
  surface: { palette: "neutral", tone: 10, note: "brand deep navy, tone 10 of the navy neutral palette" },
  background: { palette: "neutral", tone: 10, note: "same as surface" },
  "surface-dim": { palette: "neutral", tone: 8, note: "one step below surface" },
  "surface-bright": { palette: "neutral", tone: 30, note: "raised navy" },
  "surface-container-lowest": { palette: "neutral", tone: 6, note: "" },
  "surface-container-low": { palette: "neutral", tone: 12, note: "" },
  "surface-container": { palette: "neutral", tone: 14, note: "" },
  "surface-container-high": { palette: "neutral", tone: 17, note: "" },
  "surface-container-highest": { palette: "neutral", tone: 22, note: "" },
  "surface-variant": { palette: "neutralVariant", tone: 30, note: "" },
  "on-surface": { palette: "brand", tone: 94, note: "brand warm off-white #F5EEDC (M3 would use neutral tone 90)" },
  "on-background": { palette: "brand", tone: 94, note: "same as on-surface" },
  "on-surface-variant": { palette: "neutralVariant", tone: 80, note: "desaturated blue-gray" },
  outline: { palette: "neutralVariant", tone: 50, note: "" },
  "outline-variant": { palette: "neutralVariant", tone: 30, note: "card borders" },
  "inverse-surface": { palette: "neutral", tone: 90, note: "" },
  "inverse-on-surface": { palette: "neutral", tone: 20, note: "" },
  tertiary: { palette: "tertiary", tone: 87, note: "the signature light gold (#F3D48A sits at tone 86 of this palette)" },
  "tertiary-dim": { palette: "tertiary", tone: 78, note: "pressed / dim gold" },
  "on-tertiary": { palette: "neutral", tone: 10, note: "brand deep navy on gold (M3 would use gold tone 20); verified ≥ 4.5:1" },
  "tertiary-container": { palette: "tertiary", tone: 30, note: "dark gold-brown container for tonal gold surfaces" },
  "on-tertiary-container": { palette: "tertiary", tone: 90, note: "" },
  "tertiary-fixed": { palette: "tertiary", tone: 90, note: "" },
  "tertiary-fixed-dim": { palette: "tertiary", tone: 80, note: "" },
  "on-tertiary-fixed": { palette: "tertiary", tone: 10, note: "" },
  "on-tertiary-fixed-variant": { palette: "tertiary", tone: 30, note: "" },
  "primary-dim": { palette: "primary", tone: 80, note: "" },
  "secondary-dim": { palette: "secondary", tone: 80, note: "" },
  "error-dim": { palette: "error", tone: 80, note: "" },
  "surface-tint": { palette: "primary", tone: 80, note: "" },
}

const LIGHT_CHOICES: ToneChoice = {
  surface: { palette: "neutral", tone: 98, note: "" },
  background: { palette: "neutral", tone: 98, note: "" },
  "on-surface": { palette: "brand", tone: 17, note: "brand navy #0F2A4A (tone 17) as text" },
  "on-background": { palette: "brand", tone: 17, note: "same as on-surface" },
  tertiary: { palette: "tertiary", tone: 40, note: "deep gold on light surfaces" },
  "on-tertiary": { palette: "neutral", tone: 100, note: "" },
  "inverse-on-surface": { palette: "neutral", tone: 95, note: "" },
}

const brandTone = (value: number, palette: PaletteName) =>
  palette === "neutral" ? hexOf(PALETTES.neutral.tone(value)) : hexOf(PALETTES[palette].tone(value))

function brandScheme(dark: boolean) {
  const generated = generatedScheme(dark)
  const choices = dark ? DARK_CHOICES : LIGHT_CHOICES
  const out: Record<string, string> = { ...generated }
  for (const [role, choice] of Object.entries(choices)) {
    out[role] =
      choice.palette === "brand"
        ? dark
          ? BRAND.cream
          : BRAND.navy
        : brandTone(choice.tone, choice.palette)
  }
  return out
}

const dark = brandScheme(true)
const light = brandScheme(false)

/* ---------- 5. WCAG ---------- */
const srgb = (c: number) => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const luminance = (value: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16))
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b)
}
export const contrast = (a: string, b: string) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return Math.round(((l1 + 0.05) / (l2 + 0.05)) * 100) / 100
}

const PAIRS: [string, string, string][] = [
  ["on-surface", "surface", "headings, body text on the page background"],
  ["on-surface", "surface-container", "body text on a card"],
  ["on-surface-variant", "surface", "secondary text on the page background"],
  ["on-surface-variant", "surface-container", "card descriptions"],
  ["tertiary", "surface", "gold accent text / icons on the background"],
  ["tertiary", "surface-container", "gold accent on a card"],
  ["on-tertiary", "tertiary", "label on the gold filled button"],
  ["on-tertiary", "tertiary-dim", "label on the pressed gold button"],
  ["on-secondary-container", "secondary-container", "tonal (navy) button label"],
  ["on-primary-container", "primary-container", "text on a primary container"],
  ["primary", "surface", "primary accent on the background"],
  ["on-primary", "primary", "label on a filled primary button"],
  ["on-tertiary-container", "tertiary-container", "light gold text on the gold container"],
  ["outline", "surface", "outline on the background"],
  ["outline-variant", "surface", "card border on the background"],
  ["error", "surface", "error text on the background"],
]

/* ---------- 6. write the files ---------- */
const banner = `/**
 * Sharea Material 3 color scheme — GENERATED, do not edit by hand.
 *
 * \`npm run colors:report\` builds this from the brand tokens with Google's
 * material-color-utilities and writes both the scheme and docs/color-mapping.md.
 * See src/lib/m3e/color.ts for how the "sharea" variant is wired into the
 * M3E theme provider.
 */`

const ts = `${banner}
export const SHAREA_SCHEME = {
  dark: ${JSON.stringify(dark, null, 2).replaceAll('"', '"')},
  light: ${JSON.stringify(light, null, 2).replaceAll('"', '"')},
} as const

export type ShareaScheme = typeof SHAREA_SCHEME
`

const root = new URL("..", import.meta.url)
mkdirSync(new URL("src/lib/m3e/", root), { recursive: true })
mkdirSync(new URL("docs/", root), { recursive: true })
writeFileSync(new URL("src/lib/m3e/sharea-scheme.ts", root), ts)

const TONES = [0, 4, 6, 8, 10, 12, 14, 17, 20, 22, 24, 30, 40, 50, 60, 70, 78, 80, 86, 87, 88, 90, 94, 95, 98, 100]
const paletteNames: PaletteName[] = ["primary", "secondary", "tertiary", "neutral", "neutralVariant", "error"]
const paletteNotes: Record<PaletteName, string> = {
  primary: `brand navy \`${BRAND.navy}\` — hue ${HUES.navy}, chroma ${CHROMAS.primary}`,
  secondary: `brand secondary navy \`${BRAND.navySecondary}\` — hue ${HUES.navySecondary}, chroma ${CHROMAS.secondary}`,
  tertiary: `brand light gold \`${BRAND.goldLight}\` — hue ${HUES.goldLight}, chroma ${CHROMAS.tertiary}`,
  neutral: `brand deep navy \`${BRAND.navyDeep}\` — hue ${HUES.navySecondary}, chroma ${CHROMAS.neutral}`,
  neutralVariant: `desaturated navy — hue ${HUES.navySecondary}, chroma ${CHROMAS.neutralVariant}`,
  error: `M3 error red — hue ${HUES.red}, chroma ${CHROMAS.error}`,
}

let md = `# Sharea — Material 3 color mapping

Brand → M3 roles. Generated by \`npm run colors:report\` with Google's
[\`@material/material-color-utilities\`](https://github.com/material-foundation/material-color-utilities),
the library shadcn M3E generates its schemes with. **Do not edit by hand** —
change the brand tokens in \`scripts/color-report.ts\` and run it again.

The page ships the **dark scheme** (\`ColorModeProvider\` is fixed to dark). The
light scheme is generated by the same palettes and is contrast-checked below,
but it is not exposed in the UI.

## 1. Brand tokens in HCT

| Token | Hex | HCT hue | HCT chroma | HCT tone |
| --- | --- | --- | --- | --- |
${Object.entries(BRAND)
  .map(([name, value]) => {
    const h = hctOf(value)
    return `| \`${name}\` | \`${value}\` | ${h.hue.toFixed(1)} | ${h.chroma.toFixed(1)} | ${h.tone.toFixed(1)} |`
  })
  .join("\n")}

## 2. Tonal palettes

| Palette | Source |
| --- | --- |
${paletteNames.map((p) => `| \`${p}\` | ${paletteNotes[p]} |`).join("\n")}

Every palette below is a column of M3 tones of the palette above it.

| M3 tone | ${paletteNames.join(" | ")} |
| --- |${paletteNames.map(() => " --- |").join("")}
${TONES.map((t) => `| **${t}** | ${paletteNames.map((p) => `\`${hexOf(PALETTES[p].tone(t))}\``).join(" | ")} |`).join("\n")}

## 3. Dark scheme — the shipped scheme

| M3 role | palette | tone | hex |
| --- | --- | --- | --- |
${Object.entries(dark)
  .map(([role, value]) => {
    const choice = DARK_CHOICES[role]
    const palette = choice ? (choice.palette === "brand" ? "brand cream #F5EEDC" : choice.palette) : "material-color-utilities"
    const tone = choice ? choice.tone : "—"
    const note = choice?.note ? ` — ${choice.note}` : ""
    return `| \`${role}\` | ${palette} | ${tone} | \`${value}\`${note} |`
  })
  .join("\n")}

Roles without a tone in the table come straight from the official M3 dark tone
mapping of the palettes above.

## 4. Light scheme — generated, not exposed

| M3 role | hex |
| --- | --- |
${Object.entries(light)
  .map(([role, value]) => `| \`${role}\` | \`${value}\` |`)
  .join("\n")}

## 5. WCAG contrast — dark scheme (what the page renders)

| foreground | background | where it is used | ratio | AA text (4.5:1) | AA large (3:1) |
| --- | --- | --- | --- | --- | --- |
${PAIRS.map(([fg, bg, use]) => {
  const ratio = contrast(dark[fg], dark[bg])
  return `| \`${fg}\` \`${dark[fg]}\` | \`${bg}\` \`${dark[bg]}\` | ${use} | **${ratio}:1** | ${ratio >= 4.5 ? "pass" : "fail"} | ${ratio >= 3 ? "pass" : "fail"} |`
}).join("\n")}

## 6. WCAG contrast — light scheme

| foreground | background | ratio |
| --- | --- | --- |
${(
  [
    ["on-surface", "surface"],
    ["on-surface-variant", "surface"],
    ["primary", "surface"],
    ["tertiary", "surface"],
    ["on-tertiary", "tertiary"],
    ["on-primary", "primary"],
    ["on-primary-container", "primary-container"],
  ] as [string, string][]
)
  .map(([fg, bg]) => {
    const ratio = contrast(light[fg], light[bg])
    return `| \`${fg}\` | \`${bg}\` | **${ratio}:1** ${ratio >= 4.5 ? "" : "⚠️ below AA"} |`
  })
  .join("\n")}

## 7. Style rules

Flat colors only. No gradients, glows, shimmer or glass effects: the gold reads
as gold through tone and restraint. Elevation on the page comes from the M3
surface-container ladder, not from glossy effects.
`

writeFileSync(new URL("docs/color-mapping.md", root), md)

/* the brand hexes the asset scripts (QR, OG image, icons) need */
writeFileSync(
  new URL("assets/brand/colors.json", root),
  `${JSON.stringify({ ...BRAND, scheme: { dark, light } }, null, 2)}\n`
)

console.log("dark scheme:")
for (const [role, value] of Object.entries(dark)) console.log(`  --md-sys-color-${role}: ${value};`)
console.log("\nkey contrasts (dark):")
for (const [fg, bg, use] of PAIRS) {
  const ratio = contrast(dark[fg], dark[bg])
  console.log(`  ${fg} on ${bg}: ${ratio}:1 ${ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA-large" : "FAIL"} — ${use}`)
}
console.log("\nwrote src/lib/m3e/sharea-scheme.ts, docs/color-mapping.md, assets/brand/colors.json")
