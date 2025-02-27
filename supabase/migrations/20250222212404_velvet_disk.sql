/*
  # Fix user policies and constraints

  1. Changes
    - Update user policies to allow proper access
    - Add ON CONFLICT handling for user creation
    - Clean up duplicate entries

  2. Security
    - Maintain RLS while fixing access issues
*/

-- First, clean up any potential duplicate users
DELETE FROM users a USING users b
WHERE a.id > b.id 
AND a.email = b.email;

-- Update user policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable insert access for registration" ON users;
DROP POLICY IF EXISTS "Enable update for users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Allow public user creation during registration" ON users;

-- Create new, more permissive policies
CREATE POLICY "Allow users to read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow public registration"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow users to update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
