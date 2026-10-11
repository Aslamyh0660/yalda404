/**
 * Sharea like counter — Cloudflare Worker on D1.
 *
 * GET  /count  → { "count": 1234 }
 * POST /like   → { "count": 1235 }   body: { "id": "<anonymous browser id>" }
 *
 * Design notes
 *  - The count is global: this page is one page for every approved location, so
 *    it has one counter, not one per venue.
 *  - `id` is a random uuid the browser keeps in localStorage. The primary key
 *    `(browser_id)` is what stops a browser from voting twice — deliberately a
 *    *discouragement*, not a guarantee: clearing storage or using another
 *    browser allows another like, and the page never claims otherwise.
 *  - Writes are rate limited per IP (see MAX_PER_IP_PER_HOUR) so the endpoint
 *    cannot be flooded, and only `/count` and `/like` exist: no free-form
 *    writes, no reads of anything else.
 *  - Failures are honest: a 4xx/5xx makes the page say the counter is
 *    unavailable rather than showing a made-up number.
 *
 * Credentials live in wrangler.toml / the Cloudflare dashboard, never in the
 * frontend: the page only knows the public URL of this Worker.
 */
export interface Env {
  /** D1 binding, see wrangler.toml */
  DB: D1Database
  /** comma-separated origins allowed to call this Worker */
  ALLOWED_ORIGINS?: string
  /** writes allowed per IP per hour (default 20) */
  MAX_PER_IP_PER_HOUR?: string
}

const DEFAULT_ORIGINS = [
  "https://aslamyh0660.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]

function cors(request: Request, env: Env): Headers {
  const origin = request.headers.get("origin") ?? ""
  const allowed = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : DEFAULT_ORIGINS
  const headers = new Headers({
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "origin",
  })
  if (allowed.includes(origin)) headers.set("access-control-allow-origin", origin)
  return headers
}

const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...init.headers },
  })

async function readCount(env: Env): Promise<number> {
  const row = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM likes"
  ).first<{ count: number }>()
  return Number(row?.count ?? 0)
}

/** Cloudflare sets CF-Connecting-IP; the fallback keeps local `wrangler dev` working */
const clientIp = (request: Request) =>
  request.headers.get("CF-Connecting-IP") ??
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
  "unknown"

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const headers = cors(request, env)
    const url = new URL(request.url)

    if (request.method === "OPTIONS") return new Response(null, { headers })
    if (url.pathname === "/count" && request.method === "GET") {
      return json({ count: await readCount(env) }, { headers })
    }
    if (url.pathname === "/like" && request.method === "POST") {
      let id = ""
      try {
        const body = (await request.json()) as { id?: unknown }
        id = typeof body.id === "string" ? body.id.trim() : ""
      } catch {
        return json({ error: "invalid json" }, { status: 400, headers })
      }
      // a uuid, or at least something long enough to be one: never free text
      if (!/^[A-Za-z0-9-]{16,64}$/.test(id))
        return json({ error: "invalid id" }, { status: 400, headers })

      const ip = clientIp(request)
      const limit = Number(env.MAX_PER_IP_PER_HOUR ?? "20")
      const since = Date.now() - 60 * 60 * 1000
      const recent = await env.DB.prepare(
        "SELECT COUNT(*) AS count FROM likes WHERE ip = ?1 AND created_at > ?2"
      )
        .bind(ip, since)
        .first<{ count: number }>()
      if (Number(recent?.count ?? 0) >= limit)
        return json({ error: "rate limited" }, { status: 429, headers })

      // INSERT OR IGNORE: the primary key on browser_id makes a repeat like a no-op
      await env.DB.prepare(
        "INSERT OR IGNORE INTO likes (browser_id, ip, created_at) VALUES (?1, ?2, ?3)"
      )
        .bind(id, ip, Date.now())
        .run()

      return json({ count: await readCount(env) }, { headers })
    }

    return json({ error: "not found" }, { status: 404, headers })
  },
}
