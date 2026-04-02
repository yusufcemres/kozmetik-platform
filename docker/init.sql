-- Enable pg_trgm extension for fuzzy/trigram search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Verify
SELECT extname FROM pg_extension WHERE extname = 'pg_trgm';
