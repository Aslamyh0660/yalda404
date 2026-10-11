import { Icon } from "@/components/m3e/icon"
import { cn } from "@/lib/m3e/cn"
import { ribbon, services } from "@/lib/content"

/** one copy of the list; the second is aria-hidden so it is read once */
function RibbonRow({ "aria-hidden": hidden }: { "aria-hidden"?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex items-center gap-10 pr-10"
    >
      {services.items.map((service) => (
        <li
          key={service.title}
          className="flex shrink-0 items-center gap-3 text-title-medium text-on-surface-variant"
        >
          <Icon name={service.icon} size={22} className="text-tertiary" />
          {service.title}
        </li>
      ))}
    </ul>
  )
}

/**
 * One gently scrolling row of service names — the only looping motion on the
 * page. It pauses while the visitor hovers or touches it, it stands still for
 * `prefers-reduced-motion: reduce`, and the duplicated list is `aria-hidden`
 * so the seven services are announced once.
 *
 * `ribbon` in src/lib/content.ts holds the short names used here.
 */
function ServicesRibbon({ className }: { className?: string }) {
  return (
    <section
      aria-label="خدمات شارع في سطر واحد"
      className={cn(
        "ribbon border-y border-outline-variant bg-surface-container-low py-5",
        className
      )}
    >
      <div className="ribbon-track">
        <RibbonRow />
        <RibbonRow aria-hidden />
      </div>
      <p className="sr-only">{ribbon.join("، ")}</p>
    </section>
  )
}

export { ServicesRibbon }
