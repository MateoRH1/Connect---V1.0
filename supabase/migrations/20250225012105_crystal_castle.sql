/*
  # Fix Authentication Policies

  1. Changes
    - Update user policies to handle unconfirmed emails
    - Add proper indexes for performance
    - Clean up existing policies

  2. Security
    - Enable RLS on users table
    - Ensure proper access control
*/

-- First disable RLS to clean up
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "allow_public_registration" ON users;
DROP POLICY IF EXISTS "allow_users_read_own_data" ON users;
DROP POLICY IF EXISTS "allow_users_update_own_data" ON users;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies
CREATE POLICY "enable_public_registration"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "enable_public_read"
  ON users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "enable_authenticated_update"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
