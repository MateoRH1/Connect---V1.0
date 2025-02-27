/*
  # Clear all data from database tables

  1. Changes
    - Safely removes all data from all tables while preserving structure
    - Temporarily disables RLS to ensure complete data removal
    - Re-enables RLS after cleanup
    - Maintains referential integrity by deleting in correct order

  2. Security
    - Temporarily disables RLS for cleanup
    - Re-enables RLS immediately after
    - Preserves all existing policies
*/

-- Temporarily disable RLS to allow complete data removal
ALTER TABLE mercadolibre_sales_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_auth_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Delete data in correct order to maintain referential integrity
DELETE FROM mercadolibre_sales_data;
DELETE FROM mercadolibre_questions;
DELETE FROM mercadolibre_categories;
DELETE FROM mercadolibre_sales;
DELETE FROM mercadolibre_products;
DELETE FROM mercadolibre_auth_codes;
DELETE FROM mercadolibre_accounts;
DELETE FROM users;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_auth_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_sales_data ENABLE ROW LEVEL SECURITY;
