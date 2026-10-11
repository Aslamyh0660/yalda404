import { Card, CardContent, CardHeader, CardTitle } from "@/components/m3e/card"
import { Icon } from "@/components/m3e/icon"
import { Separator } from "@/components/m3e/separator"
import { howTo } from "@/lib/content"

/**
 * Three plain sentences about what the printed stand does and does not prove.
 *
 * The verification stand carries one universal QR code that is the same for
 * every approved place, so the code alone cannot identify a venue — this block
 * says that honestly instead of implying a guarantee the code cannot give.
 */
function HowTo() {
  return (
    <Card
      variant="outlined"
      className="mx-auto w-full max-w-3xl border-outline-variant bg-surface-container-low"
      size="lg"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-heading text-title-large">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
            <Icon name="verified_user" size={20} />
          </span>
          {howTo.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col">
          {howTo.points.map((point, index) => (
            <li key={point}>
              {index > 0 && <Separator className="my-4" />}
              <p className="flex gap-3 text-body-medium text-on-surface-variant">
                <span
                  aria-hidden
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-tertiary"
                />
                {point}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export { HowTo }
