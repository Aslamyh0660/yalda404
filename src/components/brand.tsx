import { Icon } from "@/components/m3e/icon"
import { cn } from "@/lib/m3e/cn"
import { appBar, hero } from "@/lib/content"
import { asset } from "@/lib/theme"

/**
 * The brand portrait in a flat light-gold ring.
 *
 * ⚠️ The image is the official Sharea bot profile picture. Replace
 * `public/brand/profile.png` with the real portrait (square, ≥ 512 × 512) and
 * regenerate the icons with `npm run assets`. The file shipped in this
 * repository is a clearly-marked placeholder — see README → "Replace the
 * portrait".
 */
function Portrait({
  size = 40,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-tertiary p-[2px]",
        className
      )}
      style={{ width: size, height: size }}
    >
      <img
        src={asset("brand/profile.png")}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className="size-full rounded-full bg-surface-container object-cover"
      />
    </span>
  )
}

/** Portrait + SHAREA + شارع, side by side (top app bar, footer). */
function LogoLockup({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <Portrait size={40} />
      <span className="flex flex-col leading-none">
        <span className="wordmark latin text-on-surface" dir="ltr">
          {appBar.wordmark}
        </span>
        <span className="mt-1 text-label-large text-on-surface-variant">
          {appBar.name}
        </span>
      </span>
    </span>
  )
}

/**
 * The approval badge: flat, M3 shape language (full corner pill), the Material
 * `verified` glyph and two words. No wreath, no ornament, no glow.
 */
function ApprovalBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 rounded-full border border-tertiary bg-surface-container-low px-4 py-2.5",
        className
      )}
    >
      <Icon
        name="verified"
        fill
        size={22}
        className="text-tertiary"
      />
      <span className="text-label-large text-tertiary">{hero.badge}</span>
      <span aria-hidden className="h-4 w-px bg-outline-variant" />
      <span className="wordmark latin text-on-surface" dir="ltr">
        {appBar.wordmark}
      </span>
    </span>
  )
}

/** A small gold rule used between sections (flat, 1px, no gradient). */
function GoldRule({ className }: { className?: string }) {
  return <span aria-hidden className={cn("block h-px w-16 bg-tertiary", className)} />
}

export { ApprovalBadge, GoldRule, LogoLockup, Portrait }
