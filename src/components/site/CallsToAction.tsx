import * as React from "react"

import { Button } from "@/components/m3e/button"
import { Icon } from "@/components/m3e/icon"
import { toast } from "@/components/m3e/toast"
import { Reveal } from "@/components/Reveal"
import { callsToAction, hero, meta } from "@/lib/content"
import {
  SECTIONS,
  TELEGRAM_HANDLE,
  TELEGRAM_URL,
  WHATSAPP_GROUP_URL,
} from "@/lib/site.config"

/** the page URL as the visitor actually reached it (host, base path and all) */
const shareUrl = () => window.location.href

/**
 * Primary call to action (the Telegram bot, gold) and the secondary one (the
 * WhatsApp group).
 *
 * The WhatsApp group has no link configured yet, so its button ships in a
 * disabled, labelled state instead of a link that would lead nowhere — set
 * `WHATSAPP_GROUP_URL` in src/lib/site.config.ts and it becomes a real button.
 */
function CallsToAction() {
  const [sharing, setSharing] = React.useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl())
      toast.add({ title: callsToAction.copied, type: "success" })
    } catch {
      toast.add({ title: callsToAction.copyFailed, type: "error" })
    }
  }

  async function share() {
    // no Web Share API (most desktop browsers): fall back to copying
    if (!navigator.share) return copyLink()
    setSharing(true)
    try {
      await navigator.share({
        title: meta.title,
        text: hero.slogan,
        url: shareUrl(),
      })
    } catch {
      // the visitor closed the share sheet: nothing to report
    } finally {
      setSharing(false)
    }
  }

  return (
    <Reveal
      aria-labelledby="cta-heading"
      className="mx-auto w-full max-w-3xl px-5 py-14 text-center sm:px-8 sm:py-20"
    >
      <h2
        id="cta-heading"
        className="font-heading text-headline-small text-on-surface sm:text-headline-medium"
      >
        {callsToAction.title}
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-body-medium text-on-surface-variant">
        {callsToAction.body}
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <Button
          render={<a href={TELEGRAM_URL} target="_blank" rel="noopener" />}
          size="md"
          className="min-h-12 w-full bg-tertiary px-7 text-label-large text-on-tertiary hover:shadow-elevation-1 sm:w-auto sm:text-title-medium"
        >
          <Icon name="smart_toy" size={22} />
          {callsToAction.primary}
        </Button>

        {WHATSAPP_GROUP_URL ? (
          <Button
            render={
              <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener" />
            }
            variant="tonal"
            size="md"
            className="min-h-12 w-full px-7 text-label-large sm:w-auto sm:text-title-medium"
          >
            <Icon name="groups" size={22} />
            {callsToAction.secondary}
          </Button>
        ) : (
          <div className="flex w-full flex-col items-center gap-2 sm:w-auto">
            <Button
              variant="tonal"
              size="md"
              disabled
              className="min-h-12 w-full px-7 text-label-large sm:w-auto sm:text-title-medium"
            >
              <Icon name="groups" size={22} />
              {callsToAction.secondary}
              <span className="rounded-full border border-current px-2 py-0.5 text-label-small">
                {callsToAction.secondaryPending}
              </span>
            </Button>
            <p className="text-body-small text-on-surface-variant">
              {callsToAction.pendingNote}
            </p>
          </div>
        )}
      </div>

      <p className="mt-6 text-body-medium text-on-surface-variant">
        <bdi className="latin" dir="ltr">
          {TELEGRAM_HANDLE}
        </bdi>
      </p>

      {SECTIONS.share && (
        <>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="text"
              className="min-h-11"
              onClick={share}
              disabled={sharing}
            >
              <Icon name="share" size={20} />
              {callsToAction.share}
            </Button>
            <Button variant="text" className="min-h-11" onClick={copyLink}>
              <Icon name="content_copy" size={20} />
              {callsToAction.copy}
            </Button>
          </div>
          <p className="sr-only" aria-live="polite">
            {callsToAction.copied}
          </p>
        </>
      )}
    </Reveal>
  )
}

export { CallsToAction }
