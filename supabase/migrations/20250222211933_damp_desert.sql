/*
  # Add MercadoLibre authorization codes table

  1. New Tables
    - `mercadolibre_auth_codes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `code` (text, the authorization code)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `mercadolibre_auth_codes` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS mercadolibre_auth_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  code text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mercadolibre_auth_codes ENABLE ROW LEVEL SECURITY;

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
