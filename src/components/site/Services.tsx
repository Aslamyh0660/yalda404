import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/m3e/card"
import { Icon } from "@/components/m3e/icon"
import { Reveal } from "@/components/Reveal"
import { services } from "@/lib/content"

/**
 * The seven services, as M3E outlined cards on the surface-container-low level:
 * flat navy panels, one gold icon each, one short sentence each. No prices, no
 * promises, no stock imagery.
 */
function Services() {
  return (
    <Reveal
      aria-labelledby="services-heading"
      className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 sm:py-20"
    >
      <div className="text-center">
        <h2
          id="services-heading"
          className="font-heading text-headline-small text-on-surface sm:text-headline-medium"
        >
          {services.title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-body-medium text-on-surface-variant">
          {services.supporting}
        </p>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.items.map((service) => (
          <li key={service.title} className="flex">
            <Card
              variant="outlined"
              size="lg"
              className="w-full border-outline-variant bg-surface-container-low"
            >
              <CardHeader>
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
                  <Icon name={service.icon} size={24} />
                </span>
                <CardTitle className="mt-3 font-heading text-title-large">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-body-medium">
                  {service.body}
                </CardDescription>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </Reveal>
  )
}

export { Services }
