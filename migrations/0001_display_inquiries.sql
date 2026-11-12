CREATE TABLE IF NOT EXISTS display_inquiries (
  id TEXT PRIMARY KEY,
  brief_json TEXT NOT NULL,
  contact_json TEXT NOT NULL,
  privacy_consent INTEGER NOT NULL,
  marketing_consent INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  client_request_id TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  imported_reference TEXT,
  imported_at TEXT
);
CREATE INDEX IF NOT EXISTS display_inquiries_pending ON display_inquiries(imported_reference,created_at);
CREATE TABLE IF NOT EXISTS display_intake_limits (
  key TEXT PRIMARY KEY,
  window TEXT NOT NULL,
  count INTEGER NOT NULL
);
