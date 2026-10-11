import { Icon } from "@/components/m3e/icon"
import { Reveal } from "@/components/Reveal"
import { trust } from "@/lib/content"

/**
 * Four brand values with Material icons.
 *
 * These are values Sharea works by — not a legal or technical guarantee about
 * the visitor's stay — and the caption underneath says so.
 */
function TrustStrip() {
  return (
    <Reveal
      aria-labelledby="trust-heading"
      className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8"
    >
      <h2 id="trust-heading" className="sr-only">
        قيم شارع
      </h2>
      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 rounded-3xl border border-outline-variant bg-surface-container-low px-6 py-8">
        {trust.items.map((item) => (
          <li key={item.label} className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container">
              <Icon name={item.icon} size={22} />
            </span>
            <span className="font-heading text-title-large text-on-surface">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-center text-body-small text-on-surface-variant">
        {trust.caption}
      </p>
    </Reveal>
  )
}

export { TrustStrip }
