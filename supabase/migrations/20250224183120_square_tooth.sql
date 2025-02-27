/*
  # Database Schema Update

  1. Tables
    - Ensure users table exists with proper structure
    - Create MercadoLibre accounts table if not exists
  
  2. Security
    - Enable RLS on both tables
    - Add policies with existence checks
    
  3. Changes
    - Use DO blocks to safely create policies
    - Add proper foreign key constraints
*/

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('client', 'consultant')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Safely create policies for users table
DO $$ 
BEGIN
  -- Users read policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data"
      ON users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  -- Users update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data"
      ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Users insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Allow public user creation during registration'
  ) THEN
    CREATE POLICY "Allow public user creation during registration"
      ON users
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;

-- Create MercadoLibre accounts table
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

-- Enable RLS for mercadolibre_accounts table
ALTER TABLE mercadolibre_accounts ENABLE ROW LEVEL SECURITY;

-- Safely create policies for mercadolibre_accounts table
DO $$ 
BEGIN
  -- Read policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'mercadolibre_accounts' AND policyname = 'Users can read own mercadolibre accounts'
  ) THEN
    CREATE POLICY "Users can read own mercadolibre accounts"
      ON mercadolibre_accounts
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'mercadolibre_accounts' AND policyname = 'Users can create own mercadolibre accounts'
  ) THEN
    CREATE POLICY "Users can create own mercadolibre accounts"
      ON mercadolibre_accounts
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'mercadolibre_accounts' AND policyname = 'Users can update own mercadolibre accounts'
  ) THEN
    CREATE POLICY "Users can update own mercadolibre accounts"
      ON mercadolibre_accounts
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
