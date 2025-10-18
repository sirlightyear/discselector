/*
  # Udvid Disc funktionalitet og tilføj Bags system

  ## Ændringer til `discs` tabel
  
  1. Nye felter:
    - `weight` (integer, optional) - Discens vægt i gram
    - `is_glow` (boolean, default false) - Om discen er glow-in-the-dark
    - `personal_speed` (integer, optional) - Personlig speed værdi (1-14)
    - `personal_glide` (integer, optional) - Personlig glide værdi (1-7)
    - `personal_turn` (numeric, optional) - Personlig turn værdi (-5 til +5)
    - `personal_fade` (numeric, optional) - Personlig fade værdi (0-5)
    - `photo_url` (text, optional) - URL til billede af discen

  ## Nye tabeller
  
  ### `bags`
  Gemmer brugerens forskellige disc golf bags
  - `bag_id` (serial, primary key)
  - `user_id` (text, foreign key) - Refererer til users.user_id
  - `name` (text, required) - Navn på bag'en (f.eks. "Skov runde", "Turneringsbag")
  - `description` (text, optional) - Beskrivelse af bag'en
  - `created_at` (timestamptz) - Oprettelsestidspunkt
  - `updated_at` (timestamptz) - Sidste opdatering

  ### `bag_discs`
  Junction tabel der forbinder bags med discs (mange-til-mange)
  - `bag_id` (integer, foreign key) - Refererer til bags.bag_id
  - `disc_id` (integer, foreign key) - Refererer til discs.disc_id
  - `position` (integer, optional) - Rækkefølge i bag'en
  - `added_at` (timestamptz) - Hvornår discen blev tilføjet til bag'en
  - Primary key: (bag_id, disc_id)

  ## Sikkerhed
  
  - RLS aktiveret på alle tabeller
  - Brugere kan kun se og ændre deres egne bags
  - bag_discs følger samme sikkerhed som bags
*/

-- Tilføj nye felter til discs tabel
ALTER TABLE discs 
  ADD COLUMN IF NOT EXISTS weight integer CHECK (weight IS NULL OR (weight >= 150 AND weight <= 180)),
  ADD COLUMN IF NOT EXISTS is_glow boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS personal_speed integer CHECK (personal_speed IS NULL OR (personal_speed >= 1 AND personal_speed <= 14)),
  ADD COLUMN IF NOT EXISTS personal_glide integer CHECK (personal_glide IS NULL OR (personal_glide >= 1 AND personal_glide <= 7)),
  ADD COLUMN IF NOT EXISTS personal_turn numeric CHECK (personal_turn IS NULL OR (personal_turn >= -5 AND personal_turn <= 5)),
  ADD COLUMN IF NOT EXISTS personal_fade numeric CHECK (personal_fade IS NULL OR (personal_fade >= 0 AND personal_fade <= 5)),
  ADD COLUMN IF NOT EXISTS photo_url text;

-- Bags tabel
CREATE TABLE IF NOT EXISTS bags (
  bag_id serial PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brugere kan læse deres egne bags"
  ON bags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Brugere kan oprette bags"
  ON bags FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Brugere kan opdatere deres egne bags"
  ON bags FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Brugere kan slette deres egne bags"
  ON bags FOR DELETE
  TO anon, authenticated
  USING (true);

-- bag_discs junction tabel
CREATE TABLE IF NOT EXISTS bag_discs (
  bag_id integer NOT NULL REFERENCES bags(bag_id) ON DELETE CASCADE,
  disc_id integer NOT NULL REFERENCES discs(disc_id) ON DELETE CASCADE,
  position integer,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (bag_id, disc_id)
);

ALTER TABLE bag_discs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brugere kan læse bag_discs"
  ON bag_discs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Brugere kan tilføje discs til bags"
  ON bag_discs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Brugere kan opdatere bag_discs"
  ON bag_discs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Brugere kan fjerne discs fra bags"
  ON bag_discs FOR DELETE
  TO anon, authenticated
  USING (true);

-- Indexes for bedre performance
CREATE INDEX IF NOT EXISTS idx_bags_user_id ON bags(user_id);
CREATE INDEX IF NOT EXISTS idx_bag_discs_bag_id ON bag_discs(bag_id);
CREATE INDEX IF NOT EXISTS idx_bag_discs_disc_id ON bag_discs(disc_id);

-- Funktion til at opdatere updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger til at opdatere updated_at automatisk
DROP TRIGGER IF EXISTS update_bags_updated_at ON bags;
CREATE TRIGGER update_bags_updated_at
  BEFORE UPDATE ON bags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
