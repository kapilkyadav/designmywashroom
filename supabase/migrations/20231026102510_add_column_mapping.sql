
-- Add column_mapping field to brands table
ALTER TABLE public.brands
ADD COLUMN IF NOT EXISTS column_mapping JSONB;
