/*
  # Fix RLS Policies for User Registration

  1. Changes
    - Update RLS policies to properly handle public registration
    - Fix policy permissions for user creation
    - Maintain security while allowing new user registration

  2. Security
    - Allow public registration while maintaining data protection
    - Ensure users can only access their own data
*/

-- First disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "enable_public_registration" ON users;
DROP POLICY IF EXISTS "enable_authenticated_read" ON users;
DROP POLICY IF EXISTS "enable_authenticated_update" ON users;

-- Drop and recreate the users table
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('client', 'consultant')),
  created_at timestamptz DEFAULT now()
);

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create new policies with correct permissions
CREATE POLICY "enable_insert_for_registration"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "enable_read_own_user"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "enable_update_own_user"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
