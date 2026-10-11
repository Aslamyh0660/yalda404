import { AppBar, useScrolled } from "@/components/m3e/app-bar"
import { LogoLockup } from "@/components/brand"

/**
 * M3E small top app bar: the logo lockup only. No intro screen, no menu —
 * everything the page offers is one scroll away, and the sticky bottom bar
 * carries the call to action on phones.
 *
 * `scrolled` is the M3E behaviour: surface while at the top, surface-container
 * with elevation 2 once content has scrolled under the bar.
 */
function TopBar() {
  const scrolled = useScrolled(undefined, 8)
  return (
    <AppBar
      title={<LogoLockup />}
      // the page's one <h1> is the approval statement in the hero
      titleAs="div"
      scrolled={scrolled}
      className="sticky top-0 z-30"
    />
  )
}

export { TopBar }
