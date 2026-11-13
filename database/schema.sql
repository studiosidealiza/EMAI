-- Execute com npm run db:setup. Repetir não apaga os dados existentes.
CREATE TABLE IF NOT EXISTS settings (
  id integer PRIMARY KEY CHECK (id = 1),
  admin_email text NOT NULL,
  auth_version integer NOT NULL DEFAULT 1,
  content jsonb NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY, email text NOT NULL, digest text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('login','email')),
  session_hash text, auth_version integer NOT NULL,
  expires_at timestamptz NOT NULL, attempts integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY, auth_version integer NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS rate_limits (
  key text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS workshops (
  id uuid PRIMARY KEY, institution text NOT NULL, location text NOT NULL,
  starts_at timestamptz NOT NULL, people integer NOT NULL CHECK (people BETWEEN 1 AND 1000),
  extra_seats integer NOT NULL CHECK (extra_seats BETWEEN 0 AND 500), email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reason text, created_at timestamptz NOT NULL DEFAULT now(), decided_at timestamptz
);
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY, workshop_id uuid NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  name text NOT NULL, email text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workshop_id, email)
);
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY, title text NOT NULL, category text NOT NULL,
  body text NOT NULL, published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS outbox (
  id uuid PRIMARY KEY, recipient text NOT NULL, subject text NOT NULL, body text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sending','sent','failed')),
  attempts integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(),
  attempted_at timestamptz, sent_at timestamptz
);
CREATE INDEX IF NOT EXISTS workshops_status_date ON workshops(status, starts_at);
CREATE INDEX IF NOT EXISTS enrollments_workshop ON enrollments(workshop_id);
CREATE INDEX IF NOT EXISTS challenges_expiry ON challenges(expires_at);
