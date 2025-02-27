/*
  # Fix MercadoLibre tables and policies

  1. Changes
    - Add mercadolibre_auth_codes table if not exists
    - Update policies for both tables
    - Add indexes for better performance

  2. Security
    - Enable RLS
    - Add appropriate policies
*/

-- Create auth codes table if not exists
CREATE TABLE IF NOT EXISTS mercadolibre_auth_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, code)
);

-- Enable RLS
ALTER TABLE mercadolibre_auth_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own auth codes" ON mercadolibre_auth_codes;
DROP POLICY IF EXISTS "Users can insert own auth codes" ON mercadolibre_auth_codes;

-- Create new policies
CREATE POLICY "Users can read own auth codes"
  ON mercadolibre_auth_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own auth codes"
  ON mercadolibre_auth_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_mercadolibre_auth_codes_user_id ON mercadolibre_auth_codes(user_id);
