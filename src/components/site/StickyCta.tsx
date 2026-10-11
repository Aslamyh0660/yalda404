import { Button } from "@/components/m3e/button"
import { Icon } from "@/components/m3e/icon"
import { DockedToolbar } from "@/components/m3e/toolbar"
import { sticky } from "@/lib/content"
import { TELEGRAM_URL, WHATSAPP_GROUP_URL } from "@/lib/site.config"

/**
 * Phones get the action within thumb reach: M3E's docked toolbar pinned to the
 * bottom edge, with `env(safe-area-inset-bottom)` padding for the home
 * indicator. `body` in src/index.css keeps the same space free, so the bar
 * never covers content, and `scroll-padding-bottom` keeps focused controls
 * above it. Hidden from `md` up, where the page's own buttons are in reach.
 */
function StickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <DockedToolbar
        className="border-t border-outline-variant bg-surface-container pb-[env(safe-area-inset-bottom)]"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <Button
          render={<a href={TELEGRAM_URL} target="_blank" rel="noopener" />}
          className="min-h-12 flex-1 bg-tertiary text-label-large text-on-tertiary"
        >
          <Icon name="smart_toy" size={20} />
          {sticky.primary}
        </Button>

        {WHATSAPP_GROUP_URL ? (
          <Button
            render={<a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener" />}
            variant="tonal"
            size="icon"
            aria-label={sticky.secondary}
            className="min-h-12 min-w-12"
          >
            <Icon name="groups" size={22} />
          </Button>
        ) : (
          <Button
            variant="tonal"
            size="icon"
            disabled
            aria-label={`${sticky.secondary} — قيد التفعيل`}
            className="min-h-12 min-w-12"
          >
            <Icon name="groups" size={22} />
          </Button>
        )}
      </DockedToolbar>
    </div>
  )
}

export { StickyCta }
