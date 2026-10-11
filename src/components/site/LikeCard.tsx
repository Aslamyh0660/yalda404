import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/m3e/card"
import { Icon } from "@/components/m3e/icon"
import { Toggle } from "@/components/m3e/toggle"
import { toast } from "@/components/m3e/toast"
import { Reveal } from "@/components/Reveal"
import { likes } from "@/lib/content"
import { useLikes } from "@/lib/likes"

/**
 * The public like button and counter.
 *
 * The toggle is M3E's own `Toggle`: square at rest, round when selected, with
 * the M3E ripple and the M3 icon-fill transition (`<Icon fill="auto">` fills
 * while the control carries `aria-pressed`). No particles, no bursts.
 *
 * The number next to it is what the server reports. When the backend is not
 * configured or fails, the card says so and still offers the share buttons.
 */
function LikeCard() {
  const { state, like } = useLikes()
  const [busy, setBusy] = React.useState(false)

  const countLabel =
    state.count === null ? null : `${state.count.toLocaleString("en-US")}`

  async function onPressedChange(next: boolean) {
    if (!next || state.liked || busy) return
    setBusy(true)
    const ok = await like()
    setBusy(false)
    if (ok) toast.add({ title: likes.thanks, type: "success" })
    else toast.add({ title: likes.error, type: "error" })
  }

  return (
    <Reveal
      aria-labelledby="likes-heading"
      className="mx-auto w-full max-w-3xl px-5 py-6 sm:px-8"
    >
      <Card
        variant="outlined"
        size="lg"
        className="border-outline-variant bg-surface-container-low"
      >
        <CardHeader>
          <CardTitle className="font-heading text-title-large">
            {likes.title}
          </CardTitle>
          <p className="text-body-medium text-on-surface-variant">
            {likes.body}
          </p>
        </CardHeader>

        <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <Toggle
            aria-label={likes.action}
            pressed={state.liked}
            disabled={busy}
            onPressedChange={onPressedChange}
            variant="outline"
            size="md"
            shape="square"
            className="min-h-12 min-w-12 border-outline-variant data-pressed:border-transparent data-pressed:bg-tertiary data-pressed:text-on-tertiary"
          >
            <Icon name="favorite" fill="auto" size={24} />
            <span className="text-label-large">{likes.action}</span>
          </Toggle>

          <p
            className="text-body-medium text-on-surface-variant"
            aria-live="polite"
            aria-atomic="true"
          >
            {state.status === "loading" && likes.loading}
            {state.status === "unconfigured" || state.status === "unavailable"
              ? likes.unavailable
              : null}
            {countLabel !== null && (
              <>
                <span className="text-title-medium text-on-surface">
                  {countLabel}
                </span>{" "}
                {likes.countLabel}
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </Reveal>
  )
}

export { LikeCard }
