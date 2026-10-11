// node workers/likes/test.mjs [base-url]      (npm run test:likes)
//
// Integration tests for the like counter, run against a live Worker — either a
// local `npm run likes:dev` (default http://127.0.0.1:8787) or a deployed one.
//
//   npm run likes:dev            # in one terminal (applies the local D1 schema)
//   npm run test:likes           # in another
//
// What it checks: the count endpoint, CORS for the page origin, that one browser
// cannot like twice, that two browsers can, that malformed ids are refused, that
// the per-IP rate limit actually fires, and that unknown routes 404.
const BASE = (process.argv[2] ?? process.env.LIKES_API_BASE ?? "http://127.0.0.1:8787").replace(/\/$/, "")
const ORIGIN = process.env.TEST_ORIGIN ?? "https://aslamyh0660.github.io"
const uuid = () => crypto.randomUUID()

/*
 * Each run pretends to come from its own IP, so the per-IP rate limit left
 * behind by a previous run cannot make the suite fail for the wrong reason.
 *
 * This is safe: in production Cloudflare sets (and overwrites) CF-Connecting-IP
 * itself, so a client cannot choose its own rate-limit bucket on the real
 * Worker. The header is only trusted here, against a local dev server.
 */
const RUN_IP = `test-${crypto.randomUUID().slice(0, 8)}`
const IP_LIMIT_IP = `test-limit-${crypto.randomUUID().slice(0, 8)}`

let passed = 0
let failed = 0

function check(label, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`)
  ok ? passed++ : failed++
}

async function get(path, init) {
  const response = await fetch(`${BASE}${path}`, init)
  let body = null
  try {
    body = await response.json()
  } catch {
    /* not json */
  }
  return { status: response.status, body, headers: response.headers }
}

const postAs = (ip, id) =>
  get("/like", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: ORIGIN,
      "CF-Connecting-IP": ip,
    },
    body: JSON.stringify({ id }),
  })
const post = (id) => postAs(RUN_IP, id)

console.log(`testing ${BASE}  (this run uses the pretend IP ${RUN_IP})\n`)

/* 1. the count endpoint answers with a number */
const start = await get("/count")
check("GET /count returns a number", typeof start.body?.count === "number", JSON.stringify(start.body))

/* 2. CORS: the page's origin is allowed, so the browser will accept the reply */
const preflight = await get("/like", {
  method: "OPTIONS",
  headers: {
    origin: ORIGIN,
    "access-control-request-method": "POST",
    "access-control-request-headers": "content-type",
  },
})
check(
  "OPTIONS /like allows the page origin",
  preflight.headers.get("access-control-allow-origin") === ORIGIN,
  `allow-origin: ${preflight.headers.get("access-control-allow-origin")}`
)

/* 3. one browser, one like */
const browserA = uuid()
const first = await post(browserA)
check("POST /like counts a new browser", first.status === 200 && first.body?.count === start.body.count + 1, JSON.stringify(first.body))
const again = await post(browserA)
check(
  "the same browser id does not count twice",
  again.status === 200 && again.body?.count === first.body?.count,
  JSON.stringify(again.body)
)

/* 4. another browser does count */
const second = await post(uuid())
check("a second browser counts", second.status === 200 && second.body?.count === first.body?.count + 1, JSON.stringify(second.body))

/* 5. malformed ids are refused, not stored */
for (const bad of ["", "short", "with spaces and punctuation !!", 123, null]) {
  const response = await post(bad)
  check(`a malformed id is refused (${JSON.stringify(bad)})`, response.status === 400, `status ${response.status}`)
}

/* 6. the per-IP rate limit fires (default 20/hour) */
const limit = Number(process.env.MAX_PER_IP_PER_HOUR ?? 20)
let limited = false
let attempts = 0
for (let i = 0; i < limit + 5; i++) {
  attempts++
  const response = await postAs(IP_LIMIT_IP, uuid())
  if (response.status === 429) {
    limited = true
    break
  }
  if (response.status >= 400) {
    check("unexpected error while testing the rate limit", false, `status ${response.status}`)
    break
  }
}
check(
  `the per-IP rate limit (${limit}/hour) rejects further writes`,
  limited,
  `429 after ${attempts} attempts in this run`
)

/* 7. no other surface exists */
check("an unknown route 404s", (await get("/admin")).status === 404)
check("GET /like is not a thing", (await get("/like")).status === 404)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed) process.exit(1)
