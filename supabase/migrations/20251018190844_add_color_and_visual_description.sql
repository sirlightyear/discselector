/*
  # Tilføj farve og visuel beskrivelse til discs

  ## Ændringer
  
  1. Fjern photo_url kolonne
  2. Tilføj color kolonne (hex color code, f.eks. #FF5733)
  3. Tilføj visual_description kolonne (tekstbeskrivelse af discens udseende)
  
  Disse felter gør det nemt at identificere discen visuelt uden at uploade billeder.
*/

-- Fjern photo_url hvis den eksisterer
ALTER TABLE discs DROP COLUMN IF EXISTS photo_url;

-- Tilføj color og visual_description
ALTER TABLE discs 
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS visual_description text;
