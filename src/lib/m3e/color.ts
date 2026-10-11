/**
 * Material 3 Expressive color schemes.
 *
 *  - `sharea`: this project's own static scheme, generated from the Sharea brand
 *    tokens with material-color-utilities by `npm run colors:report`, see
 *    `./sharea-scheme.ts` and docs/color-mapping.md
 *  - `baseline`: the official static scheme (Compose Material3 tokens, with the
 *    expressive on-container tones), see `./baseline.ts`
 *  - every other variant: a dynamic scheme from a seed colour, computed with
 *    Google's material-color-utilities. Those live in `./color-dynamic.ts`,
 *    which is loaded on demand so the colour maths never reaches a visitor who
 *    only looks at this page (change from the M3E registry module: one
 *    `import()` instead of a static import — the schemes are identical).
 *
 * Key colors can come from a seed or from an image through node-vibrant (see
 * `./vibrant.ts`): the `image` variant uses the image's own swatches as the
 * secondary/tertiary/neutral palettes instead of deriving them from the seed.
 */

import { BASELINE } from "./baseline"
import { SHAREA_SCHEME } from "./sharea-scheme"

export const SCHEME_VARIANTS = [
  "sharea",
  "baseline",
  "tonalSpot",
  "expressive",
  "vibrant",
  "neutral",
  "fidelity",
  "content",
  "rainbow",
  "fruitSalad",
  "monochrome",
  "image",
] as const
export type SchemeVariant = (typeof SCHEME_VARIANTS)[number]

/** membership check that narrows an unknown value to one of the unions */
export const isOneOf = <T extends string>(list: readonly T[], v: unknown): v is T =>
  typeof v === "string" && list.some((x) => x === v)

export const CONTRAST_LEVELS = { standard: 0, medium: 0.5, high: 1 } as const
export type ContrastLevel = keyof typeof CONTRAST_LEVELS

export const SPEC_VERSIONS = ["2021", "2025"] as const
export type SpecVersion = (typeof SPEC_VERSIONS)[number]

/** The baseline seed (M3's #6750A4). */
export const BASELINE_SEED = "#6750A4"

/** Key colors of a scheme. Only `primary` is required. */
export type SchemeSource = {
  primary: string
  secondary?: string
  tertiary?: string
  neutral?: string
}

export type SchemeOptions = {
  source: SchemeSource
  variant?: SchemeVariant
  contrast?: ContrastLevel
  spec?: SpecVersion
  dark?: boolean
}

export type ColorScheme = Record<string, string>

/** the variants that need material-color-utilities at runtime */
export const isDynamicVariant = (variant: SchemeVariant) =>
  variant !== "sharea" && variant !== "baseline"

/** the material-color-utilities module, loaded only when a dynamic scheme is asked for */
export const loadDynamicColor = () => import("./color-dynamic")

/**
 * The scheme for these options.
 *
 * Static variants (what this page uses) resolve synchronously, with no colour
 * maths at runtime. A dynamic variant throws here — use
 * `generateSchemeAsync`, or `loadDynamicColor()` for the palettes and the
 * full-colour picker helpers.
 */
export function generateScheme(opts: SchemeOptions): ColorScheme {
  const { variant = "tonalSpot", contrast = "standard", dark = false } = opts
  if (variant === "sharea") {
    return { ...SHAREA_SCHEME[dark ? "dark" : "light"] }
  }
  if (variant === "baseline" && contrast === "standard") {
    return { ...BASELINE[dark ? "dark" : "light"] }
  }
  throw new Error(
    `the "${variant}" variant is a dynamic scheme: use generateSchemeAsync(), ` +
      `or the "sharea" / "baseline" static schemes`
  )
}

/** the same thing for a dynamic variant, without blocking the initial bundle */
export async function generateSchemeAsync(opts: SchemeOptions): Promise<ColorScheme> {
  if (!isDynamicVariant(opts.variant ?? "tonalSpot")) return generateScheme(opts)
  const { generateSchemeDynamic } = await loadDynamicColor()
  return generateSchemeDynamic(opts)
}

/* ---------- CSS ---------- */

export function schemeToCss(scheme: ColorScheme, indent = "  "): string {
  return Object.entries(scheme)
    .map(([role, hex]) => `${indent}--md-sys-color-${role}: ${hex};`)
    .join("\n")
}

/** `:root { ...light } .dark { ...dark }` for one theme */
export function themeCss(
  opts: Omit<SchemeOptions, "dark">,
  selectors = { light: ":root", dark: ".dark" }
): string {
  const light = generateScheme({ ...opts, dark: false })
  const dark = generateScheme({ ...opts, dark: true })
  return `${selectors.light} {\n${schemeToCss(light)}\n}\n\n${selectors.dark} {\n${schemeToCss(dark)}\n}\n`
}
