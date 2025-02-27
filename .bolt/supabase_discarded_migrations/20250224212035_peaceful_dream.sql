/*
  # Create MercadoLibre products table

  1. New Tables
    - `mercadolibre_products`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `item_id` (text)
      - `title` (text)
      - `category_id` (text)
      - `price` (numeric)
      - `currency_id` (text)
      - `available_quantity` (integer)
      - `sold_quantity` (integer)
      - `listing_type_id` (text)
      - `status` (text)
      - `permalink` (text)
      - `thumbnail` (text)
      - `condition` (text)
      - `last_updated` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `mercadolibre_products` table
    - Add policies for authenticated users to manage their own products
*/

CREATE TABLE IF NOT EXISTS mercadolibre_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  item_id text NOT NULL,
  title text NOT NULL,
  category_id text NOT NULL,
  price numeric(10,2) NOT NULL,
  currency_id text NOT NULL,
  available_quantity integer NOT NULL,
  sold_quantity integer NOT NULL DEFAULT 0,
  listing_type_id text NOT NULL,
  status text NOT NULL,
  permalink text NOT NULL,
  thumbnail text,
  condition text NOT NULL,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Enable RLS
ALTER TABLE mercadolibre_products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own products"
  ON mercadolibre_products
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON mercadolibre_products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON mercadolibre_products
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_mercadolibre_products_user_id ON mercadolibre_products(user_id);
CREATE INDEX idx_mercadolibre_products_item_id ON mercadolibre_products(item_id);
