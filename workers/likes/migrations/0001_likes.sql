-- Sharea like counter.
--
-- One global counter for the one universal page (there is no per-venue data by
-- design). `browser_id` is a random uuid kept in the visitor's localStorage:
-- the primary key is what discourages a second like from the same browser.
-- `ip` is stored only so the Worker can rate limit writes; it is never returned
-- by the API and never shown in the UI.
CREATE TABLE IF NOT EXISTS likes (
  browser_id TEXT PRIMARY KEY,
  ip         TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- the rate-limit lookup: (ip, created_at)
CREATE INDEX IF NOT EXISTS idx_likes_ip_created ON likes (ip, created_at);
