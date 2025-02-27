/*
  # Fix MercadoLibre products policies

  1. Changes
    - Drop existing policies if they exist
    - Recreate policies with proper checks
    - Ensure no policy name conflicts

  2. Security
    - Maintain RLS on mercadolibre_products table
    - Add policies for authenticated users to manage their own products
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own products" ON mercadolibre_products;
DROP POLICY IF EXISTS "Users can insert own products" ON mercadolibre_products;
DROP POLICY IF EXISTS "Users can update own products" ON mercadolibre_products;
DROP POLICY IF EXISTS "Los usuarios pueden leer sus propios productos" ON mercadolibre_products;

-- Create new policies with unique names
CREATE POLICY "allow_read_own_products"
  ON mercadolibre_products
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "allow_insert_own_products"
  ON mercadolibre_products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_update_own_products"
  ON mercadolibre_products
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
