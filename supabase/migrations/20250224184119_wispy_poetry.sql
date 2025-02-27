/*
  # Fix authentication setup

  1. Changes
    - Recreate users table with proper auth integration
    - Update policies to handle registration and login properly
    - Add proper indexes for performance
    
  2. Security
    - Maintain RLS
    - Add proper constraints
    - Ensure proper auth flow
*/

-- Recreate users table with proper auth integration
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('client', 'consultant')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow public user creation during registration" ON users;

-- Create new policies with proper permissions
CREATE POLICY "Enable read access for own user"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for registration"
  ON users FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable update for users"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
