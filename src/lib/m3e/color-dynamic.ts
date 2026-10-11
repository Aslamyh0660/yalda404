/**
 * Dynamic Material 3 color schemes — the part that needs Google's
 * material-color-utilities.
 *
 * This module is loaded on demand (`import("./color-dynamic")`), never with the
 * page: the Sharea scheme is static (`./sharea-scheme.ts`), so the ~60 kB of
 * colour maths would otherwise be shipped to every visitor for nothing. Import
 * it directly only from tools, scripts or a theme picker.
 *
 * Everything here mirrors the M3E registry module of the same name; the split
 * is the only change (see src/lib/m3e/color.ts for the reasoning).
 */
import {
  DynamicScheme,
  Hct,
  MaterialDynamicColors,
  TonalPalette,
  Variant,
  argbFromHex,
  hexFromArgb,
  type DynamicColor,
} from "@material/material-color-utilities"

import type { ContrastLevel, SchemeOptions, SchemeVariant } from "./color"

const VARIANT: Record<
  Exclude<SchemeVariant, "image" | "baseline" | "sharea">,
  Variant
> = {
  tonalSpot: Variant.TONAL_SPOT,
  expressive: Variant.EXPRESSIVE,
  vibrant: Variant.VIBRANT,
  neutral: Variant.NEUTRAL,
  fidelity: Variant.FIDELITY,
  content: Variant.CONTENT,
  rainbow: Variant.RAINBOW,
  fruitSalad: Variant.FRUIT_SALAD,
  monochrome: Variant.MONOCHROME,
}

export const CONTRAST_LEVELS = { standard: 0, medium: 0.5, high: 1 } as const
export const SPEC_VERSIONS = ["2021", "2025"] as const

const mdc = new MaterialDynamicColors()

/** every role, keyed by its CSS name (`on-primary-container`) */
const ROLES: [string, DynamicColor][] = [
  ...mdc.allColors,
  mdc.surfaceVariant(),
  mdc.surfaceTint(),
  mdc.shadow(),
  mdc.scrim(),
].map((c) => [c.name.replaceAll("_", "-"), c])

const imagePalette = (hex: string | undefined, minChroma: number) => {
  if (!hex) return undefined
  const hct = Hct.fromInt(argbFromHex(hex))
  return TonalPalette.fromHueAndChroma(hct.hue, Math.max(hct.chroma, minChroma))
}

export function createDynamicScheme({
  source,
  variant = "tonalSpot",
  contrast = "standard",
  spec = "2021",
  dark = false,
}: SchemeOptions): DynamicScheme {
  const sourceColorHct = Hct.fromInt(argbFromHex(source.primary))
  const base = {
    sourceColorHct,
    contrastLevel: CONTRAST_LEVELS[contrast],
    isDark: dark,
    specVersion: spec,
  }
  if (variant !== "image") {
    // the static variants fall back to tonal spot, exactly as M3E does
    const v =
      variant === "baseline" || variant === "sharea" ? "tonalSpot" : variant
    return new DynamicScheme({ ...base, variant: VARIANT[v] })
  }
  const neutral = source.neutral ? Hct.fromInt(argbFromHex(source.neutral)) : null
  return new DynamicScheme({
    ...base,
    variant: Variant.TONAL_SPOT,
    primaryPalette: TonalPalette.fromHueAndChroma(
      sourceColorHct.hue,
      Math.max(sourceColorHct.chroma, 36)
    ),
    secondaryPalette: imagePalette(source.secondary, 12),
    tertiaryPalette: imagePalette(source.tertiary, 24),
    neutralPalette: neutral
      ? TonalPalette.fromHueAndChroma(neutral.hue, 6)
      : undefined,
    neutralVariantPalette: neutral
      ? TonalPalette.fromHueAndChroma(neutral.hue, 10)
      : undefined,
  })
}

export function generateSchemeDynamic(opts: SchemeOptions): Record<string, string> {
  const { contrast = "standard", dark = false } = opts
  const scheme = createDynamicScheme(opts)
  const out: Record<string, string> = Object.fromEntries(
    ROLES.map(([name, color]) => [name, hexFromArgb(color.getArgb(scheme))])
  )
  // M3 Expressive (Compose expressiveLightColorScheme): on-container = tone 30
  if (!dark && (opts.spec ?? "2021") === "2021" && contrast === "standard") {
    out["on-primary-container"] = hexFromArgb(scheme.primaryPalette.tone(30))
    out["on-secondary-container"] = hexFromArgb(scheme.secondaryPalette.tone(30))
    out["on-tertiary-container"] = hexFromArgb(scheme.tertiaryPalette.tone(30))
    out["on-error-container"] = hexFromArgb(scheme.errorPalette.tone(30))
  }
  // 2021 has no *-dim roles
  for (const k of ["primary", "secondary", "tertiary", "error"])
    out[`${k}-dim`] ??= out[k]
  return out
}

/** the tones M3 tools show for a tonal palette */
export const PALETTE_TONES = [
  0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100,
] as const

const paletteTones = (p: TonalPalette) =>
  PALETTE_TONES.map((t) => hexFromArgb(p.tone(t)))

export function schemePalettes(opts: SchemeOptions) {
  const s = createDynamicScheme(opts)
  return {
    primary: paletteTones(s.primaryPalette),
    secondary: paletteTones(s.secondaryPalette),
    tertiary: paletteTones(s.tertiaryPalette),
    neutral: paletteTones(s.neutralPalette),
    "neutral-variant": paletteTones(s.neutralVariantPalette),
    error: paletteTones(s.errorPalette),
  }
}

export const isContrastLevel = (v: unknown): v is ContrastLevel =>
  typeof v === "string" && v in CONTRAST_LEVELS

export const isSpecVersion = (v: unknown): v is (typeof SPEC_VERSIONS)[number] =>
  typeof v === "string" && SPEC_VERSIONS.some((s) => s === v)
