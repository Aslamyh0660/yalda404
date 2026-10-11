import { GoldRule } from "@/components/brand"
import { TopBar } from "@/components/site/TopBar"
import { Hero } from "@/components/site/Hero"
import { HowTo } from "@/components/site/HowTo"
import { ServicesRibbon } from "@/components/site/ServicesRibbon"
import { Services } from "@/components/site/Services"
import { TrustStrip } from "@/components/site/TrustStrip"
import { LikeCard } from "@/components/site/LikeCard"
import { CallsToAction } from "@/components/site/CallsToAction"
import { StickyCta } from "@/components/site/StickyCta"
import { Footer } from "@/components/site/Footer"
import { SECTIONS } from "@/lib/site.config"

/**
 * One page for every approved location.
 *
 * There are no routes, no venue parameters and no per-venue data: the QR code
 * on every printed stand opens this same page (see README → "One universal QR
 * code"). Sections can be switched off from src/lib/site.config.ts.
 */
export default function App() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <TopBar />

      <main className="flex-1">
        <Hero />

        {SECTIONS.howTo && (
          <div className="mx-auto w-full max-w-5xl px-5 pb-4 sm:px-8">
            <GoldRule className="mb-10" />
            <HowTo />
          </div>
        )}

        {SECTIONS.servicesRibbon && <ServicesRibbon className="mt-12" />}

        {SECTIONS.services && <Services />}

        {SECTIONS.trust && <TrustStrip />}

        {SECTIONS.likes && <LikeCard />}

        {SECTIONS.callsToAction && <CallsToAction />}
      </main>

      <Footer />
      {SECTIONS.stickyCta && <StickyCta />}
    </div>
  )
}
