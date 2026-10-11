/**
 * The public like counter.
 *
 * The count is real and comes from the server (a Cloudflare Worker with D1 —
 * see workers/likes/). Three rules this file follows:
 *
 *  1. No invented numbers. If the backend is not configured, or the request
 *     fails, the page says the counter is unavailable instead of showing a
 *     count it made up.
 *  2. `localStorage` only *discourages* repeat likes; the server de-duplicates
 *     by the anonymous browser id below. It is not "one person, one like", and
 *     nothing in the UI claims it is.
 *  3. Nothing secret here: the endpoint is public and write-limited by IP on
 *     the server.
 */
import * as React from "react"

import { LIKES_API_BASE } from "@/lib/site.config"

const ID_KEY = "sharea:like-id"
const DONE_KEY = "sharea:liked"
const TIMEOUT_MS = 8000

export type LikesStatus =
  /** no VITE_LIKES_API_BASE: the counter is honestly switched off */
  | "unconfigured"
  | "loading"
  | "ready"
  /** the backend answered with an error, or did not answer */
  | "unavailable"

export type LikesState = {
  status: LikesStatus
  count: number | null
  liked: boolean
}

/** an anonymous, random id: how the server keeps one browser from voting twice */
function browserId(): string {
  try {
    const existing = localStorage.getItem(ID_KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(ID_KEY, id)
    return id
  } catch {
    // private mode with storage disabled: still a valid one-off id
    return crypto.randomUUID()
  }
}

const alreadyLiked = () => {
  try {
    return localStorage.getItem(DONE_KEY) === "1"
  } catch {
    return false
  }
}

const rememberLiked = () => {
  try {
    localStorage.setItem(DONE_KEY, "1")
  } catch {
    /* nothing to do */
  }
}

async function request(path: string, init?: RequestInit): Promise<number> {
  const response = await fetch(`${LIKES_API_BASE}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`likes API ${response.status}`)
  const data: unknown = await response.json()
  const count = (data as { count?: unknown })?.count
  if (typeof count !== "number" || !Number.isFinite(count))
    throw new Error("likes API: unexpected payload")
  return count
}

export function useLikes() {
  const [state, setState] = React.useState<LikesState>(() =>
    LIKES_API_BASE
      ? { status: "loading", count: null, liked: alreadyLiked() }
      : { status: "unconfigured", count: null, liked: alreadyLiked() }
  )

  React.useEffect(() => {
    if (!LIKES_API_BASE) return
    let cancelled = false
    request("/count")
      .then((count) => {
        if (!cancelled) setState((prev) => ({ ...prev, status: "ready", count }))
      })
      .catch(() => {
        if (!cancelled) setState((prev) => ({ ...prev, status: "unavailable" }))
      })
    return () => {
      cancelled = true
    }
  }, [])

  /** returns false when the like could not be recorded */
  const like = React.useCallback(async () => {
    if (!LIKES_API_BASE) return false
    try {
      const count = await request("/like", {
        method: "POST",
        body: JSON.stringify({ id: browserId() }),
      })
      rememberLiked()
      setState({ status: "ready", count, liked: true })
      return true
    } catch {
      setState((prev) => ({ ...prev, status: "unavailable" }))
      return false
    }
  }, [])

  return { state, like }
}
