-- ─────────────────────────────────────────────────────────────────────────────
-- FloraPetFriend — Initial Database Schema
-- Run this in Supabase SQL Editor or via supabase db push
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── SPECIES TABLE ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.species (
  id            TEXT PRIMARY KEY,
  common_name   TEXT NOT NULL,
  scientific_name TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('animal', 'plant')),
  image_url     TEXT,
  safety_level  TEXT NOT NULL DEFAULT 'safe' CHECK (safety_level IN ('safe', 'caution', 'danger')),
  is_legal      BOOLEAN NOT NULL DEFAULT TRUE,
  is_domestic   BOOLEAN NOT NULL DEFAULT FALSE,
  short_desc    TEXT,
  diet          TEXT,
  lifespan      TEXT,
  habitat       TEXT,
  care_notes    TEXT,
  legal_notes   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_species_type ON public.species(type);
CREATE INDEX IF NOT EXISTS idx_species_common_name ON public.species USING gin(to_tsvector('spanish', common_name));

-- ─── PROFILES (extends Supabase auth.users) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE,
  full_name     TEXT,
  avatar_url    TEXT,
  country       TEXT DEFAULT 'ES',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── VIRTUAL PETS TABLE ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.virtual_pets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       TEXT NOT NULL,
  species_id    TEXT NOT NULL REFERENCES public.species(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  avatar_url    TEXT,
  personality   TEXT,
  message       TEXT,
  level         INT NOT NULL DEFAULT 1,
  happiness     INT NOT NULL DEFAULT 80 CHECK (happiness BETWEEN 0 AND 100),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_virtual_pets_user ON public.virtual_pets(user_id);

-- ─── REMINDERS TABLE ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reminders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       TEXT NOT NULL,
  pet_id        UUID NOT NULL REFERENCES public.virtual_pets(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('food', 'sun', 'water', 'cleaning', 'other')),
  label         TEXT NOT NULL,
  time          TEXT NOT NULL,
  frequency     TEXT NOT NULL,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_pet  ON public.reminders(pet_id);

-- ─── PET PHOTOS TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pet_photos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       TEXT NOT NULL,
  pet_id        UUID NOT NULL REFERENCES public.virtual_pets(id) ON DELETE CASCADE,
  photo_url     TEXT NOT NULL,
  caption       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pet_photos_pet ON public.pet_photos(pet_id);

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.virtual_pets
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
ALTER TABLE public.species      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_photos   ENABLE ROW LEVEL SECURITY;

-- Species: public read, service-role write
CREATE POLICY "species_public_read"
  ON public.species FOR SELECT USING (TRUE);

CREATE POLICY "species_service_insert"
  ON public.species FOR INSERT WITH CHECK (TRUE);

-- Virtual pets: allow anonymous (user_id = 'anonymous' for demo) + auth users
CREATE POLICY "virtual_pets_all"
  ON public.virtual_pets FOR ALL USING (TRUE);

CREATE POLICY "reminders_all"
  ON public.reminders FOR ALL USING (TRUE);

CREATE POLICY "pet_photos_all"
  ON public.pet_photos FOR ALL USING (TRUE);

-- ─── SEED DATA (sample species) ──────────────────────────────────────────────
INSERT INTO public.species (id, common_name, scientific_name, type, safety_level, is_legal, is_domestic, short_desc, diet, lifespan, habitat, care_notes, legal_notes)
VALUES
  ('perro-domestico', 'Perro doméstico', 'Canis lupus familiaris', 'animal', 'safe', TRUE, TRUE,
   'El compañero más fiel del ser humano, con miles de años de domesticación.',
   'Pienso balanceado, carne cocida, verduras', '10-15 años', 'Hogares, zonas urbanas y rurales',
   'Requiere ejercicio diario, vacunas anuales y revisiones veterinarias.', 'Legal en todos los países.'),

  ('gato-domestico', 'Gato doméstico', 'Felis catus', 'animal', 'safe', TRUE, TRUE,
   'Independiente y afectuoso, uno de los animales domésticos más populares del mundo.',
   'Pienso para gatos, carne, pescado', '12-18 años', 'Hogares, zonas urbanas',
   'Caja de arena limpia, juguetes, visitas al veterinario anuales.', 'Legal en todos los países.'),

  ('cactus-erizo', 'Cactus erizo', 'Echinocactus grusonii', 'plant', 'safe', TRUE, FALSE,
   'Planta suculenta de forma esférica con largas espinas doradas.',
   'No requiere fertilización frecuente', '20-100 años', 'Desiertos de México y EE.UU.',
   'Riego escaso cada 2-3 semanas, mucha luz directa, sustrato arenoso.', 'Legal en todos los países.'),

  ('tortuga-rusa', 'Tortuga rusa', 'Testudo horsfieldii', 'animal', 'caution', TRUE, TRUE,
   'Tortuga terrestre robusta y longeva, popular como mascota.',
   'Hierbas, hojas, verduras de hoja verde', '40-60 años', 'Zonas áridas y estepas',
   'Necesita vitamina D3, temperatura controlada, hibernación en invierno.', 'Requiere documentación CITES en algunos países europeos.')
ON CONFLICT (id) DO NOTHING;
