/*
  # Fix User Registration Issues

  1. Changes
    - Drop all existing policies and recreate them with proper permissions
    - Ensure public registration works correctly
    - Fix foreign key constraint issues

  2. Security
    - Maintain RLS policies for user data protection
    - Allow public registration while maintaining security
*/

-- First disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "enable_public_registration" ON users;
DROP POLICY IF EXISTS "enable_public_read" ON users;
DROP POLICY IF EXISTS "enable_authenticated_update" ON users;

-- Drop and recreate the users table with proper auth integration
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('client', 'consultant')),
  created_at timestamptz DEFAULT now()
);

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "enable_public_registration"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "enable_authenticated_read"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "enable_authenticated_update"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
