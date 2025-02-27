/*
  # Fix user registration policies

  1. Changes
    - Drop existing policies that are causing conflicts
    - Create new simplified policies that allow:
      - Public registration
      - Authenticated users to read/update their own data
      - Service role to manage all data
  
  2. Security
    - Maintains row-level security
    - Ensures users can only access their own data
    - Allows public registration
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for own user" ON users;
DROP POLICY IF EXISTS "Enable insert for registration" ON users;
DROP POLICY IF EXISTS "Enable update for users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Allow public user creation during registration" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "allow_public_registration" ON users;
DROP POLICY IF EXISTS "allow_users_read_own_data" ON users;
DROP POLICY IF EXISTS "allow_users_update_own_data" ON users;

-- Create new policies
CREATE POLICY "enable_public_registration"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "enable_users_read_own_data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "enable_users_update_own_data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
