/**
 * Everything external lives here: links, the like backend, feature flags.
 * Change a link once and every button, QR code and document follows.
 *
 * Nothing secret belongs in this file — it ships to the browser. The like
 * backend keeps its credentials on the server (see workers/likes/README.md).
 */

/** The Telegram bot. The handle is @Sharea_qombot with a **q**, not a g. */
export const TELEGRAM_URL = "https://t.me/Sharea_qombot"
export const TELEGRAM_HANDLE = "@Sharea_qombot"

/**
 * The WhatsApp group.
 *
 * ⚠️ NOT CONFIGURED YET. While this is an empty string the page does not render
 * a link that looks clickable: the "انضم إلى مجموعة الواتساب" button renders in
 * a disabled, clearly-labelled state (and the QR code, README and docs say the
 * same). Paste the invite link here — `https://chat.whatsapp.com/…` — and it
 * becomes a real, working button on the next build.
 */
export const WHATSAPP_GROUP_URL = ""

/** Public URL of the deployed page. Used for share text, OG tags and the QR code. */
export const SITE_URL = "https://aslamyh0660.github.io/sharesa-verify/"

/**
 * Like backend (Cloudflare Worker + D1). Leave empty and the counter shows an
 * honest "unavailable" state instead of a made-up number:
 *
 *   VITE_LIKES_API_BASE=https://sharea-likes.<your-subdomain>.workers.dev
 *
 * Set it in `.env.local` for local work and in the deploy environment (see
 * README → "Configure the like backend").
 */
export const LIKES_API_BASE: string =
  (import.meta.env.VITE_LIKES_API_BASE as string | undefined)?.replace(/\/$/, "") ?? ""

/** Section switches — turn a block off without deleting it. */
export const SECTIONS = {
  howTo: true,
  servicesRibbon: true,
  services: true,
  trust: true,
  likes: true,
  callsToAction: true,
  share: true,
  stickyCta: true,
} as const
