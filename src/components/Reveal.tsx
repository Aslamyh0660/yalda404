import * as React from "react"

import { cn } from "@/lib/m3e/cn"

/**
 * Fades a section in the first time it scrolls into view — the page's only
 * scroll-driven effect.
 *
 * Nothing is ever hidden: the animation class is added when the element enters
 * the viewport, so with JavaScript off, with `prefers-reduced-motion: reduce`,
 * or on a section that is already on screen at load, the content is simply
 * there. Content never waits for an effect.
 */
function useReveal<T extends HTMLElement>(enabled = true) {
  const ref = React.useRef<T>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!enabled || !el) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reduced.matches) return
    // already visible on the first screen: no animation, no flash
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add("reveal-in")
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [enabled])

  return ref
}

type RevealProps = React.ComponentPropsWithoutRef<"section"> & {
  as?: "section" | "div"
}

function Reveal({ as = "section", className, children, ...props }: RevealProps) {
  const ref = useReveal<HTMLElement>()
  const Tag = as
  return (
    <Tag ref={ref as React.Ref<never>} className={cn(className)} {...props}>
      {children}
    </Tag>
  )
}

export { Reveal, useReveal }
