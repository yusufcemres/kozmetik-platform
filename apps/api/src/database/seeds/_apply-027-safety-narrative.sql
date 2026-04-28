-- Migration 027 manuel uygulama (TypeORM CLI ESM sorunu var)
ALTER TABLE ingredients
  ADD COLUMN IF NOT EXISTS safety_narrative TEXT,
  ADD COLUMN IF NOT EXISTS controversy_summary TEXT;

-- Migrations history tablosuna kaydet (idempotent)
INSERT INTO migrations (timestamp, name)
VALUES (1700000000027, 'IngredientSafetyNarrative1700000000027')
ON CONFLICT DO NOTHING;
