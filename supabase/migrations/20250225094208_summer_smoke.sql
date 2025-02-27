-- First disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "allow_public_insert" ON users;
DROP POLICY IF EXISTS "allow_read_own_user" ON users;
DROP POLICY IF EXISTS "allow_update_own_user" ON users;

-- Drop and recreate the users table
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id uuid DEFAULT auth.uid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('client', 'consultant')),
  created_at timestamptz DEFAULT now()
);

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper permissions
CREATE POLICY "enable_public_insert"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "enable_authenticated_read"
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
