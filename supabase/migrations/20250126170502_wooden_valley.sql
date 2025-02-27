/*
  # MercadoLibre Integration Tables

  1. New Tables
    - `mercadolibre_accounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users.id)
      - `account_id` (text, MercadoLibre user ID)
      - `access_token` (text)
      - `refresh_token` (text)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `mercadolibre_accounts` table
    - Add policies for authenticated users to:
      - Read their own accounts
      - Create their own accounts
      - Update their own accounts
*/

CREATE TABLE IF NOT EXISTS mercadolibre_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  account_id text NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, account_id)
);

ALTER TABLE mercadolibre_accounts ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own accounts
CREATE POLICY "Users can read own mercadolibre accounts"
  ON mercadolibre_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to create their own accounts
CREATE POLICY "Users can create own mercadolibre accounts"
  ON mercadolibre_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own accounts
CREATE POLICY "Users can update own mercadolibre accounts"
  ON mercadolibre_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
