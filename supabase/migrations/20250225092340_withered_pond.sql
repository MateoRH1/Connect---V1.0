/*
  # Delete all data from database tables

  1. Changes
    - Temporarily disable RLS to allow complete data removal
    - Delete all data from all tables in the correct order to maintain referential integrity
    - Re-enable RLS after deletion
  
  2. Important Notes
    - This migration preserves table structures and policies
    - Only removes data content
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
TRUNCATE TABLE mercadolibre_sales_data CASCADE;
TRUNCATE TABLE mercadolibre_questions CASCADE;
TRUNCATE TABLE mercadolibre_categories CASCADE;
TRUNCATE TABLE mercadolibre_sales CASCADE;
TRUNCATE TABLE mercadolibre_products CASCADE;
TRUNCATE TABLE mercadolibre_auth_codes CASCADE;
TRUNCATE TABLE mercadolibre_accounts CASCADE;
TRUNCATE TABLE users CASCADE;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_auth_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_sales_data ENABLE ROW LEVEL SECURITY;
