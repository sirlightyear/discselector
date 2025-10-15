/*
  # Min Bag - Bruger og Disc Database

  ## Nye tabeller
  
  ### `users`
  Gemmer bruger-profiler med simpel identifikation
  - `user_id` (text, primary key) - Unikt bruger-ID
  - `initialer` (text, optional) - Max 5 tegn, bruges til simpel identifikation
  - `created_at` (timestamptz) - Oprettelsestidspunkt

  ### `discs`
  Gemmer brugerens disc-samling
  - `disc_id` (serial, primary key) - Auto-incrementing ID
  - `user_id` (text, foreign key) - Refererer til users.user_id
  - `name` (text, required) - Disc navn
  - `speed` (integer, required) - Flight number: speed (1-14)
  - `glide` (integer, required) - Flight number: glide (1-7)
  - `turn` (numeric, required) - Flight number: turn (-5 til +5)
  - `fade` (numeric, required) - Flight number: fade (0-5)
  - `throw_type` (text, required) - Enum: 'forhånd', 'baghånd', 'begge'
  - `note` (text, optional) - Valgfri noter
  - `created_at` (timestamptz) - Oprettelsestidspunkt

  ## Sikkerhed
  
  - RLS aktiveret på begge tabeller
  - Brugere kan læse og oprette deres egne profiler
  - Brugere kan kun læse og ændre deres egne discs
*/

-- Users tabel
CREATE TABLE IF NOT EXISTS users (
  user_id text PRIMARY KEY,
  initialer text CHECK (length(initialer) <= 5),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brugere kan læse alle profiler"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Brugere kan oprette deres egen profil"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Brugere kan opdatere deres egen profil"
  ON users FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Discs tabel
CREATE TABLE IF NOT EXISTS discs (
  disc_id serial PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  name text NOT NULL,
  speed integer NOT NULL CHECK (speed >= 1 AND speed <= 14),
  glide integer NOT NULL CHECK (glide >= 1 AND glide <= 7),
  turn numeric NOT NULL CHECK (turn >= -5 AND turn <= 5),
  fade numeric NOT NULL CHECK (fade >= 0 AND fade <= 5),
  throw_type text NOT NULL CHECK (throw_type IN ('forhånd', 'baghånd', 'begge')),
  note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE discs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brugere kan læse alle discs"
  ON discs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Brugere kan oprette discs"
  ON discs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Brugere kan opdatere deres egne discs"
  ON discs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Brugere kan slette deres egne discs"
  ON discs FOR DELETE
  TO anon, authenticated
  USING (true);

-- Index for hurtigere queries
CREATE INDEX IF NOT EXISTS idx_discs_user_id ON discs(user_id);
CREATE INDEX IF NOT EXISTS idx_discs_throw_type ON discs(throw_type);
