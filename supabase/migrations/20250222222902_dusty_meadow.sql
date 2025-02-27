/*
  # Fix MercadoLibre accounts table

  1. Changes
    - Drop and recreate mercadolibre_accounts table with proper constraints
    - Add better indexes for performance
    - Update RLS policies
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS mercadolibre_accounts;

-- Create the table with proper constraints
CREATE TABLE mercadolibre_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  account_id text NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE mercadolibre_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own mercadolibre accounts"
  ON mercadolibre_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own mercadolibre accounts"
  ON mercadolibre_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mercadolibre accounts"
  ON mercadolibre_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mercadolibre_accounts_user_id ON mercadolibre_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_mercadolibre_accounts_account_id ON mercadolibre_accounts(account_id);
