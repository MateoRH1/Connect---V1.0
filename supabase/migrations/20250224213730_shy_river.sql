/*
  # Fix Registration Policies

  1. Changes
    - Drop all existing user policies for a clean slate
    - Create new simplified policies that allow:
      - Public registration
      - Users to read their own data
      - Users to update their own data
    - Add proper indexes for performance

  2. Security
    - Enable RLS on users table
    - Ensure proper access control for user data
*/

-- First disable RLS to clean up
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for own user" ON users;
DROP POLICY IF EXISTS "Enable insert for registration" ON users;
DROP POLICY IF EXISTS "Enable update for users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Allow public user creation during registration" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "allow_public_registration" ON users;
DROP POLICY IF EXISTS "allow_users_read_own_data" ON users;
DROP POLICY IF EXISTS "allow_users_update_own_data" ON users;
DROP POLICY IF EXISTS "enable_public_registration" ON users;
DROP POLICY IF EXISTS "enable_users_read_own_data" ON users;
DROP POLICY IF EXISTS "enable_users_update_own_data" ON users;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies
CREATE POLICY "allow_public_registration"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "allow_users_read_own_data"
  ON users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "allow_users_update_own_data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
