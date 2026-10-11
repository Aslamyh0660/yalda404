import { LogoLockup } from "@/components/brand"
import { footer } from "@/lib/content"
import { TELEGRAM_HANDLE, TELEGRAM_URL } from "@/lib/site.config"

/** SHAREA, شارع, the handle and one line. Nothing else. */
function Footer() {
  return (
    <footer className="mt-6 border-t border-outline-variant bg-surface-container-lowest">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-5 py-10 text-center sm:px-8">
        <LogoLockup />
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener"
          className="inline-flex min-h-11 items-center rounded-full px-4 text-body-medium text-tertiary underline decoration-outline-variant underline-offset-4 focus-ring"
        >
          <bdi className="latin" dir="ltr">
            {TELEGRAM_HANDLE}
          </bdi>
        </a>
        <p className="text-body-medium text-on-surface-variant">
          {footer.line}
        </p>
        <p className="text-body-small text-on-surface-variant">
          {footer.about}
        </p>
      </div>
    </footer>
  )
}

export { Footer }
