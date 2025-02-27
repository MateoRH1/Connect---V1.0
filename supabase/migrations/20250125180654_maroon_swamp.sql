/*
  # Delete existing users

  1. Changes
    - Safely delete all existing users from the users table
    - Maintain table structure and policies
  
  2. Security
    - Maintains existing RLS policies
    - Does not affect table structure
*/

-- Disable RLS temporarily to allow deletion
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Delete all existing users
DELETE FROM users;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
