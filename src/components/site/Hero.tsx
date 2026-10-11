import { ApprovalBadge } from "@/components/brand"
import { Button } from "@/components/m3e/button"
import { Icon } from "@/components/m3e/icon"
import { chipVariants } from "@/components/m3e/chip"
import { cn } from "@/lib/m3e/cn"
import { hero } from "@/lib/content"
import { TELEGRAM_HANDLE, TELEGRAM_URL } from "@/lib/site.config"

/**
 * The most important screen: the visitor is standing at a reception desk
 * holding a phone, so the first screen says one thing — this place is approved
 * by Sharea — and offers one action: open the bot.
 *
 * Nothing here claims more than that: no verification codes, no dates, no
 * "secure" promises about the room the visitor is standing in.
 */
function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 pt-10 pb-14 text-center sm:px-8 sm:pt-16 sm:pb-20"
    >
      <ApprovalBadge />

      <h1
        id="hero-heading"
        className="mt-8 font-heading text-headline-medium text-on-surface sm:text-headline-large"
      >
        {hero.headline}
      </h1>

      <p className="mt-4 max-w-xl text-body-large text-on-surface-variant">
        {hero.supporting}
      </p>

      <p className="mt-6 inline-flex items-center gap-2 text-title-medium text-tertiary">
        <Icon name="check_circle" size={20} />
        {hero.reassurance}
      </p>

      <span
        className={cn(
          chipVariants({ variant: "flat" }),
          "mt-6 cursor-default text-on-surface"
        )}
      >
        <span className="inline-flex text-tertiary">
          <Icon name="verified" size={18} />
        </span>
        {hero.chip}
      </span>

      <div className="mt-12 w-full max-w-xl border-t border-outline-variant pt-10">
        <p className="font-heading text-headline-small text-tertiary">
          {hero.slogan}
        </p>
        <p className="mt-3 text-body-medium text-on-surface-variant">
          {hero.sloganSupporting}
        </p>
      </div>

      <Button
        render={<a href={TELEGRAM_URL} target="_blank" rel="noopener" />}
        size="md"
        className="mt-8 min-h-12 bg-tertiary px-7 text-label-large text-on-tertiary hover:shadow-elevation-1 sm:text-title-medium"
      >
        <Icon name="smart_toy" size={22} />
        {hero.primaryCta}
      </Button>

      <p className="mt-4 text-body-small text-on-surface-variant">
        <bdi className="latin" dir="ltr">
          {TELEGRAM_HANDLE}
        </bdi>
      </p>
    </section>
  )
}

export { Hero }
