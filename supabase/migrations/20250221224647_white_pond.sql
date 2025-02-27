/*
  # Create initial schema

  1. Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - role (text, check constraint)
      - created_at (timestamptz)
    - mercadolibre_accounts
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - account_id (text)
      - access_token (text)
      - refresh_token (text)
      - expires_at (timestamptz)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add appropriate policies for user access
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS mercadolibre_accounts;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('client', 'consultant')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow public user creation during registration"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create MercadoLibre accounts table
CREATE TABLE mercadolibre_accounts (
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

-- MercadoLibre accounts table policies
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
